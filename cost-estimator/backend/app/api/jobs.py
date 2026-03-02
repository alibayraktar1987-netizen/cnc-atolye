from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.analysis_job import AnalysisJob
from app.schemas.job import JobRead
from app.services.analysis_pipeline import AnalysisPipeline

router = APIRouter(prefix="/jobs", tags=["jobs"])
SYNC_FALLBACK_AFTER = timedelta(seconds=20)


def _to_utc(dt: datetime | None) -> datetime | None:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def _should_run_sync(job: AnalysisJob) -> bool:
    if job.status not in {"queued", "running"}:
        return False
    now = datetime.now(timezone.utc)
    ref = _to_utc(job.started_at) or _to_utc(job.created_at)
    if ref is None:
        return True
    return now - ref >= SYNC_FALLBACK_AFTER


@router.get("/{job_id}", response_model=JobRead)
def get_job(job_id: str, db: Session = Depends(get_db)) -> AnalysisJob:
    job = db.get(AnalysisJob, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    if _should_run_sync(job):
        try:
            pipeline = AnalysisPipeline(db)
            pipeline.run(part_id=job.part_id, job_id=job.id, machine_profile="auto")
            db.refresh(job)
        except Exception:
            db.refresh(job)

    return job
