from __future__ import annotations

import tempfile
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.analysis_job import AnalysisJob
from app.models.cutting_parameter import CuttingParameter
from app.models.material import Material
from app.models.part import Part
from app.services.cycle_time_service import CycleTimeService, ParameterProfile
from app.services.geometry_service import GeometryService
from app.services.operation_classifier import OperationClassifier
from app.services.stock_service import MaterialInfo, StockService
from app.services.storage_service import StorageService


class AnalysisPipeline:
    def __init__(self, db: Session):
        self.db = db
        self.geometry_service = GeometryService()
        self.stock_service = StockService()
        self.operation_classifier = OperationClassifier()
        self.cycle_service = CycleTimeService()
        self.storage = StorageService()

    def run(self, part_id: str, job_id: str) -> None:
        part = self.db.get(Part, part_id)
        job = self.db.get(AnalysisJob, job_id)
        if part is None or job is None:
            raise ValueError("Part or job not found")

        part.status = "processing"
        job.status = "running"
        job.started_at = datetime.now(timezone.utc)
        self.db.commit()

        try:
            material = self.db.get(Material, part.material_id)
            if material is None:
                raise ValueError("Material not found")

            with tempfile.TemporaryDirectory(prefix="step-analysis-") as tmp_dir:
                step_path = Path(tmp_dir) / part.filename
                self.storage.download_raw_to(part.storage_key, step_path)

                geometry, model_bytes, model_format = self.geometry_service.analyze_step_file(step_path)
                stock = self.stock_service.determine_stock(
                    geometry=geometry,
                    material=MaterialInfo(
                        density_g_cm3=material.density_g_cm3,
                        price_per_kg=material.price_per_kg,
                        allowance_mm=material.allowance_mm,
                    ),
                )
                operations = self.operation_classifier.classify(geometry=geometry, stock=stock)

                param_rows = self.db.scalars(
                    select(CuttingParameter).where(CuttingParameter.material_id == material.id)
                ).all()
                profiles = [
                    ParameterProfile(
                        machine_type=row.machine_type,
                        sfm=row.sfm,
                        feed_per_rev=row.feed_per_rev,
                        feed_per_tooth=row.feed_per_tooth,
                        number_of_teeth=row.number_of_teeth,
                        tool_change_time_min=row.tool_change_time_min,
                        facing_time_min=row.facing_time_min,
                        parting_time_min=row.parting_time_min,
                        retract_time_min=row.retract_time_min,
                        cutter_diameter_mm=row.cutter_diameter_mm,
                        stepover_mm=row.stepover_mm,
                        non_cut_factor=row.non_cut_factor,
                        machine_cost_per_min=row.machine_cost_per_min,
                        labor_cost_per_min=row.labor_cost_per_min,
                    )
                    for row in param_rows
                ]

                estimate = self.cycle_service.estimate(
                    operations=operations,
                    geometry=geometry,
                    stock=stock,
                    parameter_profiles=profiles,
                )

                model_key = f"{part.id}/preview.{model_format}"
                self.storage.upload_model(model_key, model_bytes)

                part.model_key = model_key
                part.model_format = model_format
                part.geometry_json = geometry
                part.stock_json = stock
                part.operations_json = operations
                part.estimate_json = estimate
                part.status = "completed"

                job.status = "completed"
                job.completed_at = datetime.now(timezone.utc)
                job.error_message = None
                self.db.commit()
        except Exception as exc:  # noqa: BLE001
            part.status = "failed"
            job.status = "failed"
            job.error_message = str(exc)
            job.completed_at = datetime.now(timezone.utc)
            self.db.commit()
            raise
