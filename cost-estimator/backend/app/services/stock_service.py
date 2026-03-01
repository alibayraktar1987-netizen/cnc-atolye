from __future__ import annotations

from dataclasses import dataclass


ROUND_BAR_STANDARD_DIAMETERS = [10, 12, 16, 20, 25, 30, 35, 40, 50, 60, 80, 100]
RECT_STANDARD_EDGES = [10, 12, 16, 20, 25, 30, 35, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300]


@dataclass
class MaterialInfo:
    density_g_cm3: float
    price_per_kg: float
    allowance_mm: float


class StockService:
    @staticmethod
    def _snap_up(value: float, options: list[int]) -> float:
        for opt in sorted(options):
            if opt >= value:
                return float(opt)
        return float(options[-1])

    def determine_stock(
        self,
        geometry: dict,
        material: MaterialInfo,
        stock_strategy: str = "auto",
        allowance_multiplier: float = 1.0,
    ) -> dict:
        bbox = geometry.get("bbox", {})
        x = float(bbox.get("x_mm", 0.0))
        y = float(bbox.get("y_mm", 0.0))
        z = float(bbox.get("z_mm", 0.0))
        allowance = float(material.allowance_mm) * max(float(allowance_multiplier), 0.1)

        rotational = bool(geometry.get("rotational_symmetry", False))
        if stock_strategy == "round_bar":
            rotational = True
        elif stock_strategy == "rectangular_block":
            rotational = False

        if rotational:
            raw_diameter = max(x, y) + allowance * 2.0
            raw_length = z + allowance * 2.0
            std_diameter = self._snap_up(raw_diameter, ROUND_BAR_STANDARD_DIAMETERS)
            stock_volume_mm3 = 3.14159265359 * ((std_diameter / 2.0) ** 2) * max(raw_length, 0.001)
            stock_type = "round_bar"
            stock_dimensions = {
                "diameter_mm": round(std_diameter, 3),
                "length_mm": round(raw_length, 3),
                "nominal_diameter_mm": round(raw_diameter, 3),
            }
        else:
            raw_x = x + allowance * 2.0
            raw_y = y + allowance * 2.0
            raw_z = z + allowance * 2.0
            std_x = self._snap_up(raw_x, RECT_STANDARD_EDGES)
            std_y = self._snap_up(raw_y, RECT_STANDARD_EDGES)
            std_z = self._snap_up(raw_z, RECT_STANDARD_EDGES)
            stock_volume_mm3 = max(std_x, 0.001) * max(std_y, 0.001) * max(std_z, 0.001)
            stock_type = "rectangular_block"
            stock_dimensions = {
                "x_mm": round(std_x, 3),
                "y_mm": round(std_y, 3),
                "z_mm": round(std_z, 3),
                "nominal_x_mm": round(raw_x, 3),
                "nominal_y_mm": round(raw_y, 3),
                "nominal_z_mm": round(raw_z, 3),
            }

        stock_volume_cm3 = stock_volume_mm3 / 1000.0
        raw_material_cost = stock_volume_cm3 * material.density_g_cm3 / 1000.0 * material.price_per_kg

        return {
            "stock_type": stock_type,
            "allowance_mm": allowance,
            "dimensions": stock_dimensions,
            "stock_volume_cm3": round(stock_volume_cm3, 4),
            "raw_material_cost": round(raw_material_cost, 4),
            "catalog_meta": {
                "round_bar_diameters_mm": ROUND_BAR_STANDARD_DIAMETERS,
                "rect_block_edges_mm": RECT_STANDARD_EDGES,
            },
        }
