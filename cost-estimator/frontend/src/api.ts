import axios from "axios";
import type { AnalysisJob, MachineProfile, Material, PartRead, PartSummary } from "./types/domain";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const API_PREFIX = "/api/v1";
const MOCK_DB_KEY = "ce_mock_db_v1";
const MOCK_MODE_KEY = "ce_mock_mode_v1";

const client = axios.create({
  baseURL: `${API_BASE}${API_PREFIX}`,
  timeout: 60000,
});

type UploadResponse = { part_id: string; job_id: string; status: string };

type MockDb = {
  materials: Material[];
  machineProfiles: MachineProfile[];
  parts: PartRead[];
  jobs: AnalysisJob[];
};

const DEFAULT_MATERIALS: Material[] = [
  { id: 1, code: "AISI-1040", name: "Steel 1040", density_g_cm3: 7.85, price_per_kg: 1.95, allowance_mm: 3 },
  { id: 2, code: "AISI-304", name: "Stainless 304", density_g_cm3: 8.0, price_per_kg: 3.8, allowance_mm: 3 },
  { id: 3, code: "AL-6061", name: "Aluminium 6061", density_g_cm3: 2.7, price_per_kg: 4.2, allowance_mm: 3 },
];

const DEFAULT_MACHINE_PROFILES: MachineProfile[] = [
  {
    id: "auto",
    label: "Otomatik (Geometriye Gore)",
    process: "hybrid",
    stock_strategy: "auto",
    allowance_multiplier: 1,
    machine_cost_multiplier: 1,
    labor_cost_multiplier: 1,
    non_cut_factor_delta: 0,
    max_x_mm: 500,
    max_y_mm: 500,
    max_z_mm: 1000,
    description: "Geometriye gore turning/milling secilir.",
  },
  {
    id: "cnc_lathe_2axis",
    label: "CNC Torna 2 Eksen",
    process: "turning",
    stock_strategy: "round_bar",
    allowance_multiplier: 0.95,
    machine_cost_multiplier: 0.95,
    labor_cost_multiplier: 1,
    non_cut_factor_delta: 0.02,
    max_x_mm: 260,
    max_y_mm: 260,
    max_z_mm: 650,
    description: "Mil, burc ve donel parcalar icin optimize.",
  },
  {
    id: "vmc_3axis",
    label: "VMC 3 Eksen",
    process: "milling",
    stock_strategy: "rectangular_block",
    allowance_multiplier: 1.1,
    machine_cost_multiplier: 1,
    labor_cost_multiplier: 1,
    non_cut_factor_delta: 0.05,
    max_x_mm: 600,
    max_y_mm: 400,
    max_z_mm: 450,
    description: "Genel freze operasyonlari.",
  },
  {
    id: "vmc_5axis",
    label: "VMC 5 Eksen",
    process: "milling",
    stock_strategy: "rectangular_block",
    allowance_multiplier: 1.05,
    machine_cost_multiplier: 1.35,
    labor_cost_multiplier: 1.15,
    non_cut_factor_delta: 0.03,
    max_x_mm: 500,
    max_y_mm: 500,
    max_z_mm: 500,
    description: "Karmaasik geometri ve yuksek hassasiyet.",
  },
  {
    id: "mill_turn_center",
    label: "Mill-Turn Center",
    process: "hybrid",
    stock_strategy: "auto",
    allowance_multiplier: 1,
    machine_cost_multiplier: 1.25,
    labor_cost_multiplier: 1.1,
    non_cut_factor_delta: 0.01,
    max_x_mm: 420,
    max_y_mm: 420,
    max_z_mm: 800,
    description: "Ayni tezgahta turning + milling.",
  },
];

let forceMockMode = readMockMode();

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readMockMode(): boolean {
  if (!canUseStorage()) return false;
  return window.localStorage.getItem(MOCK_MODE_KEY) === "1";
}

function writeMockMode(value: boolean): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(MOCK_MODE_KEY, value ? "1" : "0");
}

export function isMockModeActive(): boolean {
  return forceMockMode || readMockMode();
}

export function clearMockData(): void {
  forceMockMode = false;
  if (!canUseStorage()) return;
  window.localStorage.removeItem(MOCK_DB_KEY);
  window.localStorage.removeItem(MOCK_MODE_KEY);
}

function nowIso(): string {
  return new Date().toISOString();
}

function makeId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function readMockDb(): MockDb {
  const empty: MockDb = { materials: DEFAULT_MATERIALS, machineProfiles: DEFAULT_MACHINE_PROFILES, parts: [], jobs: [] };
  if (!canUseStorage()) return empty;
  const db = safeParse<MockDb>(window.localStorage.getItem(MOCK_DB_KEY), empty);
  return {
    materials: Array.isArray(db.materials) && db.materials.length > 0 ? db.materials : DEFAULT_MATERIALS,
    machineProfiles:
      Array.isArray(db.machineProfiles) && db.machineProfiles.length > 0 ? db.machineProfiles : DEFAULT_MACHINE_PROFILES,
    parts: Array.isArray(db.parts) ? db.parts : [],
    jobs: Array.isArray(db.jobs) ? db.jobs : [],
  };
}

function writeMockDb(db: MockDb): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(MOCK_DB_KEY, JSON.stringify(db));
}

function isConnectivityError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  if (!error.response) return true;
  return false;
}

async function withFallback<T>(online: () => Promise<T>, offline: () => Promise<T> | T): Promise<T> {
  try {
    const data = await online();
    if (forceMockMode) {
      forceMockMode = false;
      writeMockMode(false);
    }
    return data;
  } catch (error) {
    if (!isConnectivityError(error)) throw error;
    forceMockMode = true;
    writeMockMode(true);
    return await offline();
  }
}

function toSummary(part: PartRead): PartSummary {
  return {
    id: part.id,
    filename: part.filename,
    status: part.status,
    material_id: part.material_id,
    model_format: part.model_format,
    created_at: part.created_at,
    updated_at: part.updated_at,
  };
}

function getMachineProfileById(machineProfileId: string): MachineProfile {
  return DEFAULT_MACHINE_PROFILES.find((p) => p.id === machineProfileId) ?? DEFAULT_MACHINE_PROFILES[0];
}

function buildMockPart(file: File, material: Material, machineProfile: MachineProfile): PartRead {
  const id = makeId("part");
  const createdAt = nowIso();
  const name = file.name.toLowerCase();
  let rotational = /(shaft|mil|bushing|burc|turn|torna)/.test(name);
  if (machineProfile.stock_strategy === "round_bar") rotational = true;
  if (machineProfile.stock_strategy === "rectangular_block") rotational = false;
  const base = Math.max(30, Math.min(240, Math.round(Math.cbrt(file.size) * 2.4)));
  const x = rotational ? base : Math.round(base * 1.15);
  const y = rotational ? base : Math.round(base * 0.86);
  const z = Math.max(30, Math.round(base * (rotational ? 1.9 : 1.25)));
  const volumeCm3 = Math.max(8, Number(((x * y * z) / 1000 * (rotational ? 0.6 : 0.45)).toFixed(2)));
  const surfaceCm2 = Number((volumeCm3 * (rotational ? 2.6 : 3.1)).toFixed(2));
  const holes = rotational ? 1 : Math.max(2, Math.round((x + y) / 35));
  const threads = Math.max(0, Math.round(holes / 3));
  const undercuts = rotational ? 0 : Math.max(0, Math.round(x / 90) - 1);

  const allowance = Number((material.allowance_mm * Math.max(machineProfile.allowance_multiplier, 0.1)).toFixed(2));
  const stock = rotational
    ? {
        stock_type: "round_bar",
        diameter_mm: x + allowance * 2,
        length_mm: z + allowance * 2,
        allowance_mm: allowance,
      }
    : {
        stock_type: "rectangular_block",
        x_mm: x + allowance * 2,
        y_mm: y + allowance * 2,
        z_mm: z + allowance * 2,
        allowance_mm: allowance,
      };
  const fitForMachine = x <= machineProfile.max_x_mm && y <= machineProfile.max_y_mm && z <= machineProfile.max_z_mm;
  (stock as Record<string, unknown>).machine_profile = {
    id: machineProfile.id,
    label: machineProfile.label,
    process: machineProfile.process,
    stock_strategy: machineProfile.stock_strategy,
    fit_for_part_bbox: fitForMachine,
  };

  const machineType = rotational && machineProfile.process !== "milling" ? "CNC Turning" : "CNC Milling";
  const operations: Array<Record<string, unknown>> = [
    { operation: machineType, machine_type: machineType, cycle_time_min: rotational ? 8.2 : 12.4 },
    { operation: "Drilling", machine_type: rotational ? "Lathe live tooling" : "CNC Milling", cycle_time_min: Number((holes * 0.75).toFixed(2)) },
  ];
  if (threads > 0) operations.push({ operation: "Tapping", machine_type: "CNC Milling", cycle_time_min: Number((threads * 0.5).toFixed(2)) });
  if (rotational && !name.includes("round")) operations.push({ operation: "C-axis Milling", machine_type: "Turning Center", cycle_time_min: 2.2 });

  const nonCutFactor = Math.max(0.05, 0.2 + machineProfile.non_cut_factor_delta);
  const baseCycle = operations.reduce((sum, op) => sum + Number(op.cycle_time_min ?? 0), 0);
  const cycleMin = Number((baseCycle * (1 + nonCutFactor)).toFixed(2));
  const materialCost = Number(((volumeCm3 * material.density_g_cm3) / 1000 * material.price_per_kg).toFixed(2));
  const machiningBase = rotational ? 2.1 : 2.35;
  const laborBase = 0.68;
  const machiningCost = Number((cycleMin * machiningBase * machineProfile.machine_cost_multiplier).toFixed(2));
  const laborCost = Number((cycleMin * laborBase * machineProfile.labor_cost_multiplier).toFixed(2));
  const totalCost = Number((materialCost + machiningCost + laborCost).toFixed(2));

  return {
    id,
    filename: file.name,
    status: "completed",
    material_id: material.id,
    model_format: null,
    created_at: createdAt,
    updated_at: createdAt,
    storage_key: `mock/${id}/${file.name}`,
    model_key: null,
    geometry_json: {
      bbox: { x_mm: x, y_mm: y, z_mm: z },
      volume_cm3: volumeCm3,
      surface_area_cm2: surfaceCm2,
      holes_count: holes,
      thread_feature_count: threads,
      undercut_count: undercuts,
      note: "Generated in local mock mode (backend unavailable).",
    },
    stock_json: stock,
    operations_json: operations,
    estimate_json: {
      material_cost: materialCost,
      machining_cost: machiningCost,
      labor_cost: laborCost,
      total_cost: totalCost,
      total_cycle_time_min: cycleMin,
      machine_profile: {
        id: machineProfile.id,
        label: machineProfile.label,
        process: machineProfile.process,
        stock_strategy: machineProfile.stock_strategy,
        machine_cost_multiplier: machineProfile.machine_cost_multiplier,
        labor_cost_multiplier: machineProfile.labor_cost_multiplier,
      },
      operation_breakdown: operations.map((op) => {
        const opCycle = Number(op.cycle_time_min ?? 0);
        return {
          operation: String(op.operation ?? "-"),
          machine_type: String(op.machine_type ?? "-"),
          cycle_time_min: opCycle,
          machine_cost: Number((opCycle * 2.2).toFixed(2)),
          labor_cost: Number((opCycle * 0.68).toFixed(2)),
          details: {},
        };
      }),
    },
  };
}

async function mockFetchMaterials(): Promise<Material[]> {
  return readMockDb().materials;
}

async function mockFetchMachineProfiles(): Promise<MachineProfile[]> {
  return readMockDb().machineProfiles;
}

async function mockFetchParts(): Promise<PartSummary[]> {
  return readMockDb()
    .parts
    .slice()
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""))
    .map(toSummary);
}

async function mockFetchPart(partId: string): Promise<PartRead> {
  const part = readMockDb().parts.find((p) => p.id === partId);
  if (!part) throw new Error("Part not found in local mock database.");
  return part;
}

async function mockUploadStep(file: File, materialId: number, machineProfileId: string): Promise<UploadResponse> {
  const db = readMockDb();
  const material = db.materials.find((m) => m.id === materialId) ?? db.materials[0] ?? DEFAULT_MATERIALS[0];
  const machineProfile =
    db.machineProfiles.find((profile) => profile.id === machineProfileId) ?? getMachineProfileById(machineProfileId);
  const part = buildMockPart(file, material, machineProfile);
  const now = nowIso();
  const job: AnalysisJob = {
    id: makeId("job"),
    part_id: part.id,
    status: "completed",
    error_message: null,
    celery_task_id: null,
    created_at: now,
    updated_at: now,
  };
  db.parts = [part, ...db.parts];
  db.jobs = [job, ...db.jobs];
  writeMockDb(db);
  return { part_id: part.id, job_id: job.id, status: "completed" };
}

async function mockFetchJob(jobId: string): Promise<AnalysisJob> {
  const job = readMockDb().jobs.find((j) => j.id === jobId);
  if (!job) throw new Error("Job not found in local mock database.");
  return job;
}

export async function fetchMaterials(): Promise<Material[]> {
  return withFallback(
    async () => {
      const { data } = await client.get<Material[]>("/materials");
      if (forceMockMode) {
        forceMockMode = false;
        writeMockMode(false);
      }
      return data;
    },
    mockFetchMaterials,
  );
}

export async function fetchMachineProfiles(): Promise<MachineProfile[]> {
  try {
    const { data } = await client.get<MachineProfile[]>("/machine-profiles");
    if (forceMockMode) {
      forceMockMode = false;
      writeMockMode(false);
    }
    return data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return mockFetchMachineProfiles();
    }
    if (!isConnectivityError(error)) throw error;
    forceMockMode = true;
    writeMockMode(true);
    return mockFetchMachineProfiles();
  }
}

export async function fetchParts(): Promise<PartSummary[]> {
  return withFallback(
    async () => {
      const { data } = await client.get<PartSummary[]>("/parts");
      return data;
    },
    mockFetchParts,
  );
}

export async function fetchPart(partId: string): Promise<PartRead> {
  return withFallback(
    async () => {
      const { data } = await client.get<PartRead>(`/parts/${partId}`);
      return data;
    },
    async () => mockFetchPart(partId),
  );
}

export async function fetchJob(jobId: string): Promise<AnalysisJob> {
  return withFallback(
    async () => {
      const { data } = await client.get<AnalysisJob>(`/jobs/${jobId}`);
      return data;
    },
    async () => mockFetchJob(jobId),
  );
}

export async function uploadStep(file: File, materialId: number, machineProfileId: string): Promise<UploadResponse> {
  return withFallback(
    async () => {
      const form = new FormData();
      form.append("file", file);
      form.append("material_id", String(materialId));
      form.append("machine_profile", machineProfileId);
      const { data } = await client.post<UploadResponse>("/parts/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    async () => mockUploadStep(file, materialId, machineProfileId),
  );
}

export function getModelUrl(partId: string): string {
  return `${API_BASE}${API_PREFIX}/parts/${partId}/model`;
}
