import json
import re
from typing import Any

from fastapi import APIRouter, HTTPException
from openai import OpenAI
from pydantic import BaseModel, Field

from app.core.config import get_settings


router = APIRouter(prefix="/fai", tags=["fai-ai"])


class BalloonAiRequest(BaseModel):
    image_data_url: str = Field(min_length=32, max_length=15_000_000)
    page_number: int = Field(default=1, ge=1, le=999)
    page_width: float = Field(default=1, gt=0)
    page_height: float = Field(default=1, gt=0)


def _extract_json(text: str) -> dict[str, Any]:
    cleaned = str(text or "").strip()
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned, flags=re.IGNORECASE)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=502, detail="AI yaniti beklenen JSON formatinda degil.") from exc
    if not isinstance(data, dict):
        raise HTTPException(status_code=502, detail="AI yaniti beklenen nesne formatinda degil.")
    return data


@router.post("/auto-balloon-ai")
def analyze_fai_drawing(payload: BalloonAiRequest) -> dict[str, Any]:
    settings = get_settings()
    if not settings.openai_api_key:
        raise HTTPException(status_code=503, detail="AI balonlama servisi yapilandirilmamis. OPENAI_API_KEY ortam degiskenini tanimlayin.")
    if not payload.image_data_url.startswith(("data:image/png;base64,", "data:image/jpeg;base64,")):
        raise HTTPException(status_code=400, detail="Yalnizca PNG veya JPEG teknik resim goruntusu kabul edilir.")

    prompt = """Analyze this CNC technical drawing for first article inspection (FAI) ballooning.
Extract only drawing dimensions. Exclude title blocks, dates, drawing numbers, revisions, page numbers, and general notes.
Recognize diameters, radii, threads, tolerances, fits, angles, depths, and axial dimensions.
For each dimension, return the center position of the dimension text as 0-100 percentage coordinates.
Exclude a dimension when its position is uncertain. Deduplicate repeated dimensions.
Return no text outside this JSON object:
{"dimensions":[{"text":"DIA 12 H7","xPct":42.5,"yPct":31.2,"confidence":0.91}],"notes":["optional short note"]}
"""
    try:
        client = OpenAI(api_key=settings.openai_api_key)
        response = client.responses.create(
            model=settings.openai_model,
            input=[{
                "role": "user",
                "content": [
                    {"type": "input_text", "text": prompt},
                    {"type": "input_image", "image_url": payload.image_data_url, "detail": "high"},
                ],
            }],
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI teknik resim analizi basarisiz: {str(exc)[:180]}") from exc

    result = _extract_json(getattr(response, "output_text", ""))
    rows = result.get("dimensions", [])
    if not isinstance(rows, list):
        raise HTTPException(status_code=502, detail="AI yanitinda dimensions listesi yok.")
    dimensions = []
    for item in rows[:300]:
        if not isinstance(item, dict):
            continue
        text = str(item.get("text", "")).strip()
        if not text:
            continue
        try:
            x_pct = max(0.0, min(100.0, float(item.get("xPct", 0))))
            y_pct = max(0.0, min(100.0, float(item.get("yPct", 0))))
            confidence = max(0.0, min(1.0, float(item.get("confidence", 0.5))))
        except (TypeError, ValueError):
            continue
        dimensions.append({"text": text[:80], "xPct": x_pct, "yPct": y_pct, "confidence": confidence})
    return {
        "engine": "openai_vision",
        "page": payload.page_number,
        "dimensions": dimensions,
        "notes": [str(note)[:240] for note in result.get("notes", []) if str(note).strip()][:8],
    }
