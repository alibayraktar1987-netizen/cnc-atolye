from datetime import datetime

from pydantic import BaseModel

from app.schemas.common import ORMModel


class PartUploadResponse(BaseModel):
    part_id: str
    job_id: str
    status: str


class PartSummary(ORMModel):
    id: str
    filename: str
    status: str
    material_id: int
    model_format: str | None
    created_at: datetime
    updated_at: datetime


class PartRead(PartSummary):
    storage_key: str
    model_key: str | None
    geometry_json: dict | None
    stock_json: dict | None
    operations_json: list | None
    estimate_json: dict | None


class EstimateResult(BaseModel):
    material_cost: float
    machining_cost: float
    labor_cost: float
    total_cost: float
    total_cycle_time_min: float
    operation_breakdown: list[dict]
