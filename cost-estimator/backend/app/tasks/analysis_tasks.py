from app.db.session import SessionLocal
from app.services.analysis_pipeline import AnalysisPipeline
from app.tasks.celery_app import celery_app


@celery_app.task(name="analysis.run_part_analysis")
def run_part_analysis_task(part_id: str, job_id: str, machine_profile: str = "auto") -> dict:
    with SessionLocal() as db:
        pipeline = AnalysisPipeline(db)
        pipeline.run(part_id=part_id, job_id=job_id, machine_profile=machine_profile)
    return {"part_id": part_id, "job_id": job_id, "status": "completed"}
