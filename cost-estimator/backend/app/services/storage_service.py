from io import BytesIO
from pathlib import Path

from minio import Minio
from minio.error import S3Error

from app.core.config import get_settings


class StorageService:
    def __init__(self) -> None:
        settings = get_settings()
        self.client = Minio(
            settings.minio_endpoint,
            access_key=settings.minio_access_key,
            secret_key=settings.minio_secret_key,
            secure=settings.minio_secure,
        )
        self.bucket_raw = settings.minio_bucket_raw
        self.bucket_model = settings.minio_bucket_model
        self._ensure_bucket(self.bucket_raw)
        self._ensure_bucket(self.bucket_model)

    def _ensure_bucket(self, bucket_name: str) -> None:
        try:
            if not self.client.bucket_exists(bucket_name):
                self.client.make_bucket(bucket_name)
        except S3Error as exc:
            raise RuntimeError(f"MinIO bucket setup failed: {bucket_name}") from exc

    def upload_raw_file(self, key: str, data: bytes, content_type: str = "application/step") -> None:
        stream = BytesIO(data)
        self.client.put_object(
            bucket_name=self.bucket_raw,
            object_name=key,
            data=stream,
            length=len(data),
            content_type=content_type,
        )

    def upload_model(self, key: str, data: bytes, content_type: str = "model/gltf-binary") -> None:
        stream = BytesIO(data)
        self.client.put_object(
            bucket_name=self.bucket_model,
            object_name=key,
            data=stream,
            length=len(data),
            content_type=content_type,
        )

    def download_raw_to(self, key: str, target_path: Path) -> Path:
        target_path.parent.mkdir(parents=True, exist_ok=True)
        self.client.fget_object(self.bucket_raw, key, str(target_path))
        return target_path

    def get_model_bytes(self, key: str) -> tuple[bytes, str]:
        response = self.client.get_object(self.bucket_model, key)
        try:
            data = response.read()
            content_type = response.headers.get("Content-Type", "application/octet-stream")
            return data, content_type
        finally:
            response.close()
            response.release_conn()

    def get_raw_bytes(self, key: str) -> tuple[bytes, str]:
        response = self.client.get_object(self.bucket_raw, key)
        try:
            data = response.read()
            content_type = response.headers.get("Content-Type", "application/octet-stream")
            return data, content_type
        finally:
            response.close()
            response.release_conn()
