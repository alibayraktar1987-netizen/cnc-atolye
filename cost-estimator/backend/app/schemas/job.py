from datetime import datetime

from app.schemas.common import ORMModel


class JobRead(ORMModel):
    id: str
    part_id: str
    celery_task_id: str | None
    status: str
    error_message: str | None
    started_at: datetime | None
    completed_at: datetime | None
    created_at: datetime
    updated_at: datetime
