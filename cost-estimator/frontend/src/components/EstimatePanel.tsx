import type { PartRead } from "../types/domain";

type Props = {
  part: PartRead | null;
};

function formatMoney(v: number): string {
  return `${v.toFixed(2)} USD`;
}

export function EstimatePanel({ part }: Props) {
  if (!part) {
    return (
      <section className="panel">
        <h2>Estimate</h2>
        <div className="muted">Select a part to view estimate details.</div>
      </section>
    );
  }

  const geometry = part.geometry_json as Record<string, unknown> | null;
  const stock = part.stock_json as Record<string, unknown> | null;
  const estimate = part.estimate_json;
  const operations = (part.operations_json ?? []) as Array<Record<string, unknown>>;
  const bbox = (geometry?.bbox ?? {}) as Record<string, number>;
  const machineFromEstimate = (estimate?.machine_profile ?? null) as Record<string, unknown> | null;
  const machineFromStock = (stock?.machine_profile ?? null) as Record<string, unknown> | null;
  const machine = machineFromEstimate ?? machineFromStock;
  const machineFit = Boolean(machine?.fit_for_part_bbox ?? true);

  return (
    <section className="panel">
      <h2>Cost Breakdown</h2>
      {estimate ? (
        <>
          {machine && (
            <div className={`alert ${machineFit ? "info" : "error"}`} style={{ marginBottom: 10 }}>
              Machine: <strong>{String(machine.label ?? machine.id ?? "-")}</strong>
              {" · "}
              Strategy: <strong>{String(machine.stock_strategy ?? "-")}</strong>
              {" · "}
              Fit: <strong>{machineFit ? "OK" : "Out of envelope"}</strong>
            </div>
          )}
          <div className="kpi-grid">
            <div className="kpi">
              <span>Material Cost</span>
              <strong>{formatMoney(estimate.material_cost)}</strong>
            </div>
            <div className="kpi">
              <span>Machining Cost</span>
              <strong>{formatMoney(estimate.machining_cost)}</strong>
            </div>
            <div className="kpi">
              <span>Labor Cost</span>
              <strong>{formatMoney(estimate.labor_cost)}</strong>
            </div>
            <div className="kpi total">
              <span>Total Cost</span>
              <strong>{formatMoney(estimate.total_cost)}</strong>
            </div>
          </div>

          <div className="section-title">Geometry</div>
          <div className="meta-grid">
            <div>X: {Number(bbox.x_mm ?? 0).toFixed(2)} mm</div>
            <div>Y: {Number(bbox.y_mm ?? 0).toFixed(2)} mm</div>
            <div>Z: {Number(bbox.z_mm ?? 0).toFixed(2)} mm</div>
            <div>Volume: {Number(geometry?.volume_cm3 ?? 0).toFixed(2)} cm³</div>
            <div>Surface: {Number(geometry?.surface_area_cm2 ?? 0).toFixed(2)} cm²</div>
            <div>Holes: {Number(geometry?.holes_count ?? 0)}</div>
            <div>Threads: {Number(geometry?.thread_feature_count ?? 0)}</div>
            <div>Undercuts: {Number(geometry?.undercut_count ?? 0)}</div>
          </div>

          <div className="section-title">Stock</div>
          <pre className="json-box">{JSON.stringify(stock, null, 2)}</pre>

          <div className="section-title">Operations</div>
          <div className="ops">
            {operations.map((op, idx) => (
              <div key={idx} className="op-row">
                <strong>{String(op.operation ?? "-")}</strong>
                <span>{String(op.machine_type ?? "-")}</span>
              </div>
            ))}
            {operations.length === 0 && <div className="muted">No operations generated yet.</div>}
          </div>
        </>
      ) : (
        <div className="muted">Analysis is pending or failed.</div>
      )}
    </section>
  );
}
