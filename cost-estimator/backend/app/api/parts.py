from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.analysis_job import AnalysisJob
from app.models.material import Material
from app.models.part import Part
from app.schemas.part import PartRead, PartSummary, PartUploadResponse
from app.services.storage_service import StorageService
from app.tasks.analysis_tasks import run_part_analysis_task

router = APIRouter(prefix="/parts", tags=["parts"])


def _validate_step_file(filename: str) -> str:
    ext = Path(filename).suffix.lower()
    if ext not in {".step", ".stp"}:
        raise HTTPException(status_code=400, detail="Only .step and .stp files are accepted")
    return ext


@router.post("/upload", response_model=PartUploadResponse, status_code=status.HTTP_202_ACCEPTED)
def upload_part(
    file: UploadFile = File(...),
    material_id: int = Form(...),
    db: Session = Depends(get_db),
) -> PartUploadResponse:
    if db.get(Material, material_id) is None:
        raise HTTPException(status_code=404, detail="Material not found")

    filename = Path(file.filename or "part.step").name
    _validate_step_file(filename)
    file_bytes = file.file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    part_id = str(uuid4())
    raw_key = f"{part_id}/{filename}"
    storage = StorageService()
    storage.upload_raw_file(raw_key, file_bytes, file.content_type or "application/step")

    part = Part(
        id=part_id,
        filename=filename,
        storage_key=raw_key,
        model_key=None,
        model_format=None,
        status="queued",
        material_id=material_id,
    )
    job = AnalysisJob(
        id=str(uuid4()),
        part_id=part_id,
        status="queued",
    )
    db.add(part)
    db.add(job)
    db.commit()

    async_task = run_part_analysis_task.delay(part_id=part.id, job_id=job.id)
    job.celery_task_id = async_task.id
    db.commit()

    return PartUploadResponse(part_id=part.id, job_id=job.id, status=job.status)


@router.get("", response_model=list[PartSummary])
def list_parts(db: Session = Depends(get_db)) -> list[Part]:
    rows = db.scalars(select(Part).order_by(Part.created_at.desc())).all()
    return list(rows)


@router.get("/{part_id}", response_model=PartRead)
def get_part(part_id: str, db: Session = Depends(get_db)) -> Part:
    part = db.get(Part, part_id)
    if part is None:
        raise HTTPException(status_code=404, detail="Part not found")
    return part


@router.get("/{part_id}/model")
def get_part_model(part_id: str, db: Session = Depends(get_db)) -> Response:
    part = db.get(Part, part_id)
    if part is None:
        raise HTTPException(status_code=404, detail="Part not found")
    if not part.model_key:
        raise HTTPException(status_code=404, detail="Model not generated yet")

    storage = StorageService()
    content, content_type = storage.get_model_bytes(part.model_key)
    return Response(content=content, media_type=content_type)


@router.get("/{part_id}/raw")
def get_part_raw_file(part_id: str, db: Session = Depends(get_db)) -> Response:
    part = db.get(Part, part_id)
    if part is None:
        raise HTTPException(status_code=404, detail="Part not found")
    storage = StorageService()
    content, content_type = storage.get_raw_bytes(part.storage_key)
    return Response(content=content, media_type=content_type)
