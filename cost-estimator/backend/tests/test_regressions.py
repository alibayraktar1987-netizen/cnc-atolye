import os
import sys
import unittest
from datetime import datetime, timedelta, timezone
from io import BytesIO
from math import pi
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["DEBUG"] = "false"

from fastapi import HTTPException, UploadFile
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.api.jobs import get_job
from app.api.parts import upload_part
from app.core.config import Settings
from app.db.session import Base
from app.models.analysis_job import AnalysisJob
from app.models.material import Material
from app.models.part import Part
from app.services.cycle_time_service import CycleTimeService, ParameterProfile
from app.services.analysis_pipeline import AnalysisPipeline
from app.services.stock_service import MaterialInfo, StockService


class ConfigurationTests(unittest.TestCase):
    def test_render_postgres_urls_use_installed_driver(self):
        for prefix in ("postgres://", "postgresql://", "postgresql+psycopg://"):
            with self.subTest(prefix=prefix):
                settings = Settings(_env_file=None, database_url=prefix + "user:pass@host/db")
                self.assertEqual(settings.database_url, "postgresql+psycopg://user:pass@host/db")

    def test_other_driver_is_preserved(self):
        self.assertEqual(Settings(_env_file=None, database_url="sqlite://").database_url, "sqlite://")


class CalculationTests(unittest.TestCase):
    def test_catalogue_rounds_up(self):
        self.assertEqual(StockService._snap_up(31, [20, 30, 40]), 40)

    def test_oversized_block_still_contains_part_and_allowance(self):
        stock = StockService().determine_stock(
            {"bbox": {"x_mm": 450, "y_mm": 320, "z_mm": 50}}, MaterialInfo(2.7, 6, 3)
        )
        self.assertGreaterEqual(stock["dimensions"]["x_mm"], 456)
        self.assertGreaterEqual(stock["dimensions"]["y_mm"], 326)

    def test_oversized_bar_still_contains_part_and_allowance(self):
        stock = StockService().determine_stock(
            {"bbox": {"x_mm": 150, "y_mm": 150, "z_mm": 50}, "rotational_symmetry": True},
            MaterialInfo(2.7, 6, 3),
        )
        self.assertGreaterEqual(stock["dimensions"]["diameter_mm"], 156)

    def test_one_inch_diameter_at_100_sfm(self):
        self.assertAlmostEqual(CycleTimeService.spindle_rpm(100, 25.4), 1200 / pi)

    def test_every_cutting_operation_uses_millimetre_rpm(self):
        profile = ParameterProfile("milling", 100, .2, .05, 4, .4, .6, .9, .1, 25.4, 1, .2, 1, .35)
        geometry = {"bbox": {"x_mm": 25.4, "y_mm": 25.4, "z_mm": 50}, "surface_area_cm2": 10}
        operations = [{"operation": name, "machine_type": "milling"} for name in
                      ("CNC Turning", "CNC Milling", "Drilling", "Tapping", "Boring")]
        result = CycleTimeService().estimate(operations, geometry, {"raw_material_cost": 3}, [profile])
        for row, diameter in zip(result["operation_breakdown"], [25.4, 25.4, 8, 4, 20]):
            self.assertAlmostEqual(row["details"]["rpm"], 30480 / (pi * diameter), places=3)
        self.assertAlmostEqual(result["total_cost"],
                               result["material_cost"] + result["machining_cost"] + result["labor_cost"], places=3)


class JobTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://")
        Base.metadata.create_all(self.engine)
        self.db = Session(self.engine)
        self.material = Material(code="TEST", name="Test", density_g_cm3=2.7, price_per_kg=6, allowance_mm=3)
        self.db.add(self.material)
        self.db.flush()
        self.part = Part(id="part-1", filename="test.step", storage_key="part-1/test.step",
                         material_id=self.material.id, status="processing")
        self.db.add(self.part)
        self.db.commit()

    def tearDown(self):
        self.db.close()
        self.engine.dispose()

    def test_polling_old_job_never_starts_another_analysis(self):
        started = datetime.now(timezone.utc) - timedelta(minutes=5)
        job = AnalysisJob(id="job-1", part_id=self.part.id, status="running", started_at=started)
        self.db.add(job)
        self.db.commit()
        with patch("app.services.analysis_pipeline.AnalysisPipeline.run") as run:
            for _ in range(3):
                self.assertEqual(get_job(job.id, self.db).status, "running")
            run.assert_not_called()

    def test_missing_job_returns_404(self):
        with self.assertRaises(HTTPException) as caught:
            get_job("missing", self.db)
        self.assertEqual(caught.exception.status_code, 404)

    def test_storage_connection_failure_is_recorded_on_job(self):
        job = AnalysisJob(id="job-storage", part_id=self.part.id, status="queued")
        self.db.add(job)
        self.db.commit()
        with patch("app.services.analysis_pipeline.StorageService", side_effect=RuntimeError("storage unavailable")):
            with self.assertRaisesRegex(RuntimeError, "storage unavailable"):
                AnalysisPipeline(self.db).run(self.part.id, job.id)
        self.db.refresh(job)
        self.assertEqual(job.status, "failed")
        self.assertEqual(job.error_message, "storage unavailable")
        self.assertEqual(self.db.get(Part, job.part_id).status, "failed")

    def test_broker_failure_does_not_leave_a_permanently_queued_job(self):
        file = UploadFile(filename="test.step", file=BytesIO(b"ISO-10303-21;"))
        with patch("app.api.parts.StorageService"), patch("app.api.parts.run_part_analysis_task.delay", side_effect=RuntimeError("offline")):
            with self.assertRaises(HTTPException) as caught:
                upload_part(file=file, material_id=self.material.id, machine_profile="auto", db=self.db)
        self.assertEqual(caught.exception.status_code, 503)
        job = self.db.scalar(select(AnalysisJob))
        self.assertEqual(job.status, "failed")
        self.assertIsNotNone(job.completed_at)
        self.assertEqual(self.db.get(Part, job.part_id).status, "failed")


if __name__ == "__main__":
    unittest.main()
