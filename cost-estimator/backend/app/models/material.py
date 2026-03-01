from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Material(Base):
    __tablename__ = "materials"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    density_g_cm3: Mapped[float] = mapped_column(Float, nullable=False)
    price_per_kg: Mapped[float] = mapped_column(Float, nullable=False)
    allowance_mm: Mapped[float] = mapped_column(Float, nullable=False, default=3.0)

    cutting_parameters = relationship("CuttingParameter", back_populates="material", cascade="all,delete")
    parts = relationship("Part", back_populates="material")
