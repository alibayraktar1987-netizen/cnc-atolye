from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.material import Material
from app.schemas.material import MaterialCreate, MaterialRead

router = APIRouter(prefix="/materials", tags=["materials"])


@router.get("", response_model=list[MaterialRead])
def list_materials(db: Session = Depends(get_db)) -> list[Material]:
    return list(db.scalars(select(Material).order_by(Material.code.asc())).all())


@router.post("", response_model=MaterialRead, status_code=status.HTTP_201_CREATED)
def create_material(payload: MaterialCreate, db: Session = Depends(get_db)) -> Material:
    exists = db.scalar(select(Material.id).where(Material.code == payload.code.upper()))
    if exists:
        raise HTTPException(status_code=409, detail="Material code already exists")
    material = Material(
        code=payload.code.upper(),
        name=payload.name,
        density_g_cm3=payload.density_g_cm3,
        price_per_kg=payload.price_per_kg,
        allowance_mm=payload.allowance_mm,
    )
    db.add(material)
    db.commit()
    db.refresh(material)
    return material
