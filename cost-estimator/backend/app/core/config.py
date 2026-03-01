from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "CNC Cost Estimator API"
    app_env: str = "development"
    debug: bool = False

    api_prefix: str = "/api/v1"
    cors_origins: List[str] = Field(default_factory=lambda: ["http://localhost:5173", "http://127.0.0.1:5173"])

    database_url: str = "postgresql+psycopg://cnc:cnc@postgres:5432/cnc_cost"
    redis_url: str = "redis://redis:6379/0"

    minio_endpoint: str = "minio:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_secure: bool = False
    minio_bucket_raw: str = "step-raw"
    minio_bucket_model: str = "step-model"

    default_allowance_mm: float = 3.0
    default_non_cut_factor: float = 0.2


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
