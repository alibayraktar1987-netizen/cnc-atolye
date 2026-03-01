from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class MaterialCreate(BaseModel):
    code: str = Field(min_length=1, max_length=50)
    name: str = Field(min_length=1, max_length=120)
    density_g_cm3: float = Field(gt=0)
    price_per_kg: float = Field(gt=0)
    allowance_mm: float = Field(default=3.0, ge=0)


class MaterialRead(ORMModel):
    id: int
    code: str
    name: str
    density_g_cm3: float
    price_per_kg: float
    allowance_mm: float
