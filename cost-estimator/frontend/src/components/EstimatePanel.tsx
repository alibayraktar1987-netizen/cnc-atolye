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
        <h2>Tahmin</h2>
        <div className="muted">Tahmin detaylarini gormek icin bir parca secin.</div>
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
      <h2>Maliyet Dagilimi</h2>
      {estimate ? (
        <>
          {machine && (
            <div className={`alert ${machineFit ? "info" : "error"}`} style={{ marginBottom: 10 }}>
              Tezgah: <strong>{String(machine.label ?? machine.id ?? "-")}</strong>
              {" · "}
              Strateji: <strong>{String(machine.stock_strategy ?? "-")}</strong>
              {" · "}
              Uygunluk: <strong>{machineFit ? "Uygun" : "Zarf disi"}</strong>
            </div>
          )}
          <div className="kpi-grid">
            <div className="kpi">
              <span>Malzeme Maliyeti</span>
              <strong>{formatMoney(estimate.material_cost)}</strong>
            </div>
            <div className="kpi">
              <span>Isleme Maliyeti</span>
              <strong>{formatMoney(estimate.machining_cost)}</strong>
            </div>
            <div className="kpi">
              <span>Iscilik Maliyeti</span>
              <strong>{formatMoney(estimate.labor_cost)}</strong>
            </div>
            <div className="kpi total">
              <span>Toplam Maliyet</span>
              <strong>{formatMoney(estimate.total_cost)}</strong>
            </div>
          </div>

          <div className="section-title">Geometri</div>
          <div className="meta-grid">
            <div>X: {Number(bbox.x_mm ?? 0).toFixed(2)} mm</div>
            <div>Y: {Number(bbox.y_mm ?? 0).toFixed(2)} mm</div>
            <div>Z: {Number(bbox.z_mm ?? 0).toFixed(2)} mm</div>
            <div>Hacim: {Number(geometry?.volume_cm3 ?? 0).toFixed(2)} cm3</div>
            <div>Yuzey: {Number(geometry?.surface_area_cm2 ?? 0).toFixed(2)} cm2</div>
            <div>Delik: {Number(geometry?.holes_count ?? 0)}</div>
            <div>Dis: {Number(geometry?.thread_feature_count ?? 0)}</div>
            <div>Alt Kesit: {Number(geometry?.undercut_count ?? 0)}</div>
          </div>

          <div className="section-title">Stok</div>
          <pre className="json-box">{JSON.stringify(stock, null, 2)}</pre>

          <div className="section-title">Operasyonlar</div>
          <div className="ops">
            {operations.map((op, idx) => (
              <div key={idx} className="op-row">
                <strong>{String(op.operation ?? "-")}</strong>
                <span>{String(op.machine_type ?? "-")}</span>
              </div>
            ))}
            {operations.length === 0 && <div className="muted">Henuz operasyon uretilmedi.</div>}
          </div>
        </>
      ) : (
        <div className="muted">Analiz beklemede veya basarisiz.</div>
      )}
    </section>
  );
}
