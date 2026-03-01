import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class AnalysisJob(Base):
    __tablename__ = "analysis_jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    part_id: Mapped[str] = mapped_column(ForeignKey("parts.id"), nullable=False, index=True)
    celery_task_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="queued")
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    part = relationship("Part", back_populates="jobs")
