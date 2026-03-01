from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class CuttingParameter(Base):
    __tablename__ = "cutting_parameters"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    material_id: Mapped[int] = mapped_column(ForeignKey("materials.id"), nullable=False, index=True)
    machine_type: Mapped[str] = mapped_column(String(40), nullable=False, index=True)

    sfm: Mapped[float] = mapped_column(Float, nullable=False)
    feed_per_rev: Mapped[float] = mapped_column(Float, nullable=False)
    feed_per_tooth: Mapped[float] = mapped_column(Float, nullable=False)
    number_of_teeth: Mapped[int] = mapped_column(Integer, nullable=False, default=4)
    tool_change_time_min: Mapped[float] = mapped_column(Float, nullable=False, default=0.4)
    facing_time_min: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    parting_time_min: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    retract_time_min: Mapped[float] = mapped_column(Float, nullable=False, default=0.1)
    cutter_diameter_mm: Mapped[float] = mapped_column(Float, nullable=False, default=10.0)
    stepover_mm: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    non_cut_factor: Mapped[float] = mapped_column(Float, nullable=False, default=0.2)
    machine_cost_per_min: Mapped[float] = mapped_column(Float, nullable=False, default=1.2)
    labor_cost_per_min: Mapped[float] = mapped_column(Float, nullable=False, default=0.35)

    material = relationship("Material", back_populates="cutting_parameters")
