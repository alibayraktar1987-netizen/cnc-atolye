import axios from "axios";
import type { AnalysisJob, MachineProfile, Material, PartRead, PartSummary } from "./types/domain";

const configuredApiBase = String(import.meta.env.VITE_API_BASE_URL ?? "").trim();
const runtimeApiBase = typeof window !== "undefined" ? window.location.origin : "";
const API_BASE = configuredApiBase || runtimeApiBase;
const API_PREFIX = "/api/v1";

const client = axios.create({
  baseURL: `${API_BASE}${API_PREFIX}`,
  timeout: 60000,
});

type UploadResponse = { part_id: string; job_id: string; status: string };

export async function fetchMaterials(): Promise<Material[]> {
  const { data } = await client.get<Material[]>("/materials");
  return data;
}

export async function fetchMachineProfiles(): Promise<MachineProfile[]> {
  const { data } = await client.get<MachineProfile[]>("/machine-profiles");
  return data;
}

export async function fetchParts(): Promise<PartSummary[]> {
  const { data } = await client.get<PartSummary[]>("/parts");
  return data;
}

export async function fetchPart(partId: string): Promise<PartRead> {
  const { data } = await client.get<PartRead>(`/parts/${partId}`);
  return data;
}

export async function fetchJob(jobId: string): Promise<AnalysisJob> {
  const { data } = await client.get<AnalysisJob>(`/jobs/${jobId}`);
  return data;
}

export async function uploadStep(file: File, materialId: number, machineProfileId: string): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("material_id", String(materialId));
  form.append("machine_profile", machineProfileId);

  const { data } = await client.post<UploadResponse>("/parts/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data;
}

export function getModelUrl(partId: string): string {
  return `${API_BASE}${API_PREFIX}/parts/${partId}/model`;
}
