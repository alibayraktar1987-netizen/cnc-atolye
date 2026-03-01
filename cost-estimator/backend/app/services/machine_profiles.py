from __future__ import annotations

from dataclasses import asdict, dataclass


@dataclass(frozen=True)
class MachineProfile:
    id: str
    label: str
    process: str  # turning | milling | hybrid
    stock_strategy: str  # auto | round_bar | rectangular_block
    allowance_multiplier: float
    machine_cost_multiplier: float
    labor_cost_multiplier: float
    non_cut_factor_delta: float
    max_x_mm: float
    max_y_mm: float
    max_z_mm: float
    description: str


MACHINE_PROFILES: dict[str, MachineProfile] = {
    "auto": MachineProfile(
        id="auto",
        label="Otomatik (Geometriye Gore)",
        process="hybrid",
        stock_strategy="auto",
        allowance_multiplier=1.00,
        machine_cost_multiplier=1.00,
        labor_cost_multiplier=1.00,
        non_cut_factor_delta=0.00,
        max_x_mm=500.0,
        max_y_mm=500.0,
        max_z_mm=1000.0,
        description="Geometriye gore turning/milling secilir.",
    ),
    "cnc_lathe_2axis": MachineProfile(
        id="cnc_lathe_2axis",
        label="CNC Torna 2 Eksen",
        process="turning",
        stock_strategy="round_bar",
        allowance_multiplier=0.95,
        machine_cost_multiplier=0.95,
        labor_cost_multiplier=1.00,
        non_cut_factor_delta=0.02,
        max_x_mm=260.0,
        max_y_mm=260.0,
        max_z_mm=650.0,
        description="Mil, burc ve donel parcalar icin optimize.",
    ),
    "vmc_3axis": MachineProfile(
        id="vmc_3axis",
        label="VMC 3 Eksen",
        process="milling",
        stock_strategy="rectangular_block",
        allowance_multiplier=1.10,
        machine_cost_multiplier=1.00,
        labor_cost_multiplier=1.00,
        non_cut_factor_delta=0.05,
        max_x_mm=600.0,
        max_y_mm=400.0,
        max_z_mm=450.0,
        description="Genel freze operasyonlari.",
    ),
    "vmc_5axis": MachineProfile(
        id="vmc_5axis",
        label="VMC 5 Eksen",
        process="milling",
        stock_strategy="rectangular_block",
        allowance_multiplier=1.05,
        machine_cost_multiplier=1.35,
        labor_cost_multiplier=1.15,
        non_cut_factor_delta=0.03,
        max_x_mm=500.0,
        max_y_mm=500.0,
        max_z_mm=500.0,
        description="Karmaasik geometri ve yuksek hassasiyet.",
    ),
    "mill_turn_center": MachineProfile(
        id="mill_turn_center",
        label="Mill-Turn Center",
        process="hybrid",
        stock_strategy="auto",
        allowance_multiplier=1.00,
        machine_cost_multiplier=1.25,
        labor_cost_multiplier=1.10,
        non_cut_factor_delta=0.01,
        max_x_mm=420.0,
        max_y_mm=420.0,
        max_z_mm=800.0,
        description="Ayni tezgahta turning + milling.",
    ),
}


def list_machine_profiles() -> list[dict]:
    return [asdict(profile) for profile in MACHINE_PROFILES.values()]


def list_machine_profile_ids() -> set[str]:
    return set(MACHINE_PROFILES.keys())


def get_machine_profile(profile_id: str | None) -> MachineProfile:
    if not profile_id:
        return MACHINE_PROFILES["auto"]
    return MACHINE_PROFILES.get(profile_id, MACHINE_PROFILES["auto"])

