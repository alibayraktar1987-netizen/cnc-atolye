from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.analysis_job import AnalysisJob
from app.schemas.job import JobRead

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/{job_id}", response_model=JobRead)
def get_job(job_id: str, db: Session = Depends(get_db)) -> AnalysisJob:
    job = db.get(AnalysisJob, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
