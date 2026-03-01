export type Material = {
  id: number;
  code: string;
  name: string;
  density_g_cm3: number;
  price_per_kg: number;
  allowance_mm: number;
};

export type PartSummary = {
  id: string;
  filename: string;
  status: string;
  material_id: number;
  model_format: string | null;
  created_at: string;
  updated_at: string;
};

export type PartRead = PartSummary & {
  storage_key: string;
  model_key: string | null;
  geometry_json: Record<string, unknown> | null;
  stock_json: Record<string, unknown> | null;
  operations_json: Array<Record<string, unknown>> | null;
  estimate_json: {
    material_cost: number;
    machining_cost: number;
    labor_cost: number;
    total_cost: number;
    total_cycle_time_min: number;
    operation_breakdown: Array<{
      operation: string;
      machine_type: string;
      cycle_time_min: number;
      machine_cost: number;
      labor_cost: number;
      details: Record<string, unknown>;
    }>;
  } | null;
};

export type AnalysisJob = {
  id: string;
  part_id: string;
  status: string;
  error_message: string | null;
  celery_task_id: string | null;
  created_at: string;
  updated_at: string;
};
