from fastapi import APIRouter

from app.services.machine_profiles import list_machine_profiles

router = APIRouter(prefix="/machine-profiles", tags=["machine-profiles"])


@router.get("")
def get_machine_profiles() -> list[dict]:
    return list_machine_profiles()

