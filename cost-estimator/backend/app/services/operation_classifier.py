from __future__ import annotations


class OperationClassifier:
    def classify(self, geometry: dict, stock: dict) -> list[dict]:
        operations: list[dict] = []
        stock_type = stock.get("stock_type", "rectangular_block")
        holes = int(geometry.get("holes_count", 0))
        holes_small = int(geometry.get("holes_small_count", 0))
        bores = int(geometry.get("large_bore_count", 0))
        flat_faces = int(geometry.get("flat_face_count", 0))

        if stock_type == "round_bar":
            operations.append(
                {
                    "operation": "CNC Turning",
                    "machine_type": "turning",
                    "sequence": 10,
                    "feature_count": 1,
                }
            )
            if flat_faces > 0:
                operations.append(
                    {
                        "operation": "C-axis Milling",
                        "machine_type": "milling",
                        "sequence": 20,
                        "feature_count": max(1, flat_faces // 2),
                    }
                )
        else:
            operations.append(
                {
                    "operation": "CNC Milling",
                    "machine_type": "milling",
                    "sequence": 10,
                    "feature_count": 1,
                }
            )

        if holes > 0:
            operations.append(
                {
                    "operation": "Drilling",
                    "machine_type": "drilling",
                    "sequence": 30,
                    "feature_count": holes,
                }
            )
        if holes_small > 0:
            operations.append(
                {
                    "operation": "Tapping",
                    "machine_type": "drilling",
                    "sequence": 40,
                    "feature_count": holes_small,
                }
            )
        if bores > 0:
            operations.append(
                {
                    "operation": "Boring",
                    "machine_type": "drilling",
                    "sequence": 50,
                    "feature_count": bores,
                }
            )

        return sorted(operations, key=lambda op: op["sequence"])
