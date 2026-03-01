from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable


@dataclass
class ParameterProfile:
    machine_type: str
    sfm: float
    feed_per_rev: float
    feed_per_tooth: float
    number_of_teeth: int
    tool_change_time_min: float
    facing_time_min: float
    parting_time_min: float
    retract_time_min: float
    cutter_diameter_mm: float
    stepover_mm: float
    non_cut_factor: float
    machine_cost_per_min: float
    labor_cost_per_min: float


class CycleTimeService:
    def estimate(
        self,
        operations: list[dict],
        geometry: dict,
        stock: dict,
        parameter_profiles: Iterable[ParameterProfile],
    ) -> dict:
        params_by_type = {p.machine_type: p for p in parameter_profiles}
        bbox = geometry.get("bbox", {})
        x = float(bbox.get("x_mm", 0.0))
        y = float(bbox.get("y_mm", 0.0))
        z = float(bbox.get("z_mm", 0.0))
        surface_area_mm2 = float(geometry.get("surface_area_cm2", 0.0)) * 100.0
        hole_count = int(geometry.get("holes_count", 0))
        holes_small = int(geometry.get("holes_small_count", 0))
        bores = int(geometry.get("large_bore_count", 0))

        op_rows: list[dict] = []
        total_machine_cost = 0.0
        total_labor_cost = 0.0
        total_cycle_time = 0.0

        for op in operations:
            machine_type = op.get("machine_type", "milling")
            p = params_by_type.get(machine_type) or params_by_type.get("milling")
            if p is None:
                continue

            op_name = op.get("operation", machine_type)
            cycle_min = 0.0
            details: dict = {}

            if op_name in {"CNC Turning"}:
                diameter = max(x, y, 1.0)
                cutting_length = max(z, 1.0)
                rpm = (p.sfm * 3.82) / max(diameter, 1.0)
                feed_rate = max(rpm * p.feed_per_rev, 0.1)
                cycle_min = (cutting_length / feed_rate) + p.facing_time_min + p.parting_time_min
                details = {
                    "formula": "cycle = cutting_length/feed_rate + facing + parting",
                    "cutting_length_mm": round(cutting_length, 4),
                    "rpm": round(rpm, 4),
                    "feed_rate_mm_min": round(feed_rate, 4),
                }
            elif op_name in {"CNC Milling", "C-axis Milling"}:
                tool_path_length = max(surface_area_mm2 / max(p.stepover_mm, 0.1), 1.0)
                rpm = (p.sfm * 3.82) / max(p.cutter_diameter_mm, 1.0)
                feed_rate = max(rpm * p.feed_per_tooth * max(p.number_of_teeth, 1), 0.1)
                tool_changes = 2 if op_name == "CNC Milling" else 1
                cycle_min = (tool_path_length / feed_rate) + (tool_changes * p.tool_change_time_min)
                details = {
                    "formula": "cycle = tool_path/feed_rate + tool_changes*tool_change_time",
                    "tool_path_length_mm": round(tool_path_length, 4),
                    "rpm": round(rpm, 4),
                    "feed_rate_mm_min": round(feed_rate, 4),
                    "tool_changes": tool_changes,
                }
            elif op_name in {"Drilling", "Tapping", "Boring"}:
                if op_name == "Drilling":
                    feature_count = max(hole_count, 1)
                    tool_dia = 8.0
                elif op_name == "Tapping":
                    feature_count = max(holes_small, 1)
                    tool_dia = 4.0
                else:
                    feature_count = max(bores, 1)
                    tool_dia = 20.0
                hole_depth = max(z * 0.7, 3.0)
                rpm = (p.sfm * 3.82) / max(tool_dia, 1.0)
                feed_rate = max(rpm * p.feed_per_rev, 0.1)
                per_hole = (hole_depth / feed_rate) + p.retract_time_min
                cycle_min = per_hole * feature_count
                details = {
                    "formula": "cycle = feature_count * (depth/(rpm*feed_per_rev) + retract)",
                    "feature_count": feature_count,
                    "hole_depth_mm": round(hole_depth, 4),
                    "rpm": round(rpm, 4),
                    "feed_rate_mm_min": round(feed_rate, 4),
                }
            else:
                cycle_min = max(z / 80.0, 0.5)
                details = {"formula": "fallback_time_model"}

            cycle_min *= 1.0 + max(p.non_cut_factor, 0.0)
            machine_cost = cycle_min * p.machine_cost_per_min
            labor_cost = cycle_min * p.labor_cost_per_min

            total_cycle_time += cycle_min
            total_machine_cost += machine_cost
            total_labor_cost += labor_cost

            op_rows.append(
                {
                    "operation": op_name,
                    "machine_type": machine_type,
                    "cycle_time_min": round(cycle_min, 4),
                    "machine_cost": round(machine_cost, 4),
                    "labor_cost": round(labor_cost, 4),
                    "details": details,
                }
            )

        material_cost = float(stock.get("raw_material_cost", 0.0))
        total_cost = material_cost + total_machine_cost + total_labor_cost

        return {
            "material_cost": round(material_cost, 4),
            "machining_cost": round(total_machine_cost, 4),
            "labor_cost": round(total_labor_cost, 4),
            "total_cost": round(total_cost, 4),
            "total_cycle_time_min": round(total_cycle_time, 4),
            "operation_breakdown": op_rows,
        }
