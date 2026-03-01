import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Part(Base):
    __tablename__ = "parts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_key: Mapped[str] = mapped_column(String(500), nullable=False)
    model_key: Mapped[str | None] = mapped_column(String(500), nullable=True)
    model_format: Mapped[str | None] = mapped_column(String(20), nullable=True)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="queued")

    material_id: Mapped[int] = mapped_column(ForeignKey("materials.id"), nullable=False, index=True)

    geometry_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    stock_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    operations_json: Mapped[list | None] = mapped_column(JSON, nullable=True)
    estimate_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )

    material = relationship("Material", back_populates="parts")
    jobs = relationship("AnalysisJob", back_populates="part", cascade="all,delete")
