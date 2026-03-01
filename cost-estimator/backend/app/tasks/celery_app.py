from celery import Celery

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery("cnc_cost_estimator", broker=settings.redis_url, backend=settings.redis_url)
celery_app.conf.task_track_started = True
celery_app.conf.task_serializer = "json"
celery_app.conf.result_serializer = "json"
celery_app.conf.accept_content = ["json"]
celery_app.conf.timezone = "UTC"
celery_app.conf.imports = ("app.tasks.analysis_tasks",)
