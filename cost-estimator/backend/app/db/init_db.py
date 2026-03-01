from sqlalchemy import select

from app.db.session import Base, SessionLocal, engine
from app.models.cutting_parameter import CuttingParameter
from app.models.material import Material


def seed_reference_data() -> None:
    with SessionLocal() as db:
        has_material = db.scalar(select(Material.id).limit(1))
        if not has_material:
            materials = [
                Material(code="AL6061", name="Aluminum 6061", density_g_cm3=2.70, price_per_kg=6.0, allowance_mm=3.0),
                Material(code="C45", name="Steel C45", density_g_cm3=7.85, price_per_kg=3.2, allowance_mm=3.0),
                Material(code="AISI304", name="Stainless AISI 304", density_g_cm3=8.00, price_per_kg=5.4, allowance_mm=3.0),
                Material(code="BRASS", name="Brass", density_g_cm3=8.50, price_per_kg=7.1, allowance_mm=3.0),
            ]
            db.add_all(materials)
            db.flush()

            defaults = []
            for material in materials:
                defaults.extend(
                    [
                        CuttingParameter(
                            material_id=material.id,
                            machine_type="turning",
                            sfm=450.0 if material.code == "AL6061" else 220.0,
                            feed_per_rev=0.20,
                            feed_per_tooth=0.08,
                            number_of_teeth=4,
                            tool_change_time_min=0.40,
                            facing_time_min=0.60,
                            parting_time_min=0.90,
                            retract_time_min=0.10,
                            cutter_diameter_mm=12.0,
                            stepover_mm=1.0,
                            non_cut_factor=0.2,
                            machine_cost_per_min=1.15,
                            labor_cost_per_min=0.35,
                        ),
                        CuttingParameter(
                            material_id=material.id,
                            machine_type="milling",
                            sfm=800.0 if material.code == "AL6061" else 320.0,
                            feed_per_rev=0.15,
                            feed_per_tooth=0.05,
                            number_of_teeth=4,
                            tool_change_time_min=0.45,
                            facing_time_min=0.0,
                            parting_time_min=0.0,
                            retract_time_min=0.10,
                            cutter_diameter_mm=10.0,
                            stepover_mm=1.2,
                            non_cut_factor=0.2,
                            machine_cost_per_min=1.35,
                            labor_cost_per_min=0.35,
                        ),
                        CuttingParameter(
                            material_id=material.id,
                            machine_type="drilling",
                            sfm=180.0,
                            feed_per_rev=0.12,
                            feed_per_tooth=0.04,
                            number_of_teeth=2,
                            tool_change_time_min=0.20,
                            facing_time_min=0.0,
                            parting_time_min=0.0,
                            retract_time_min=0.08,
                            cutter_diameter_mm=6.0,
                            stepover_mm=0.8,
                            non_cut_factor=0.2,
                            machine_cost_per_min=1.00,
                            labor_cost_per_min=0.35,
                        ),
                    ]
                )

            db.add_all(defaults)
            db.commit()


def init_db() -> None:
    # Ensure model metadata is loaded
    from app.models import analysis_job, cutting_parameter, material, part  # noqa: F401

    Base.metadata.create_all(bind=engine)
    seed_reference_data()
