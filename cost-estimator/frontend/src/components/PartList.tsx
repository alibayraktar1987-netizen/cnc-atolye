import type { PartSummary } from "../types/domain";

type Props = {
  parts: PartSummary[];
  selectedPartId: string | null;
  onSelect: (partId: string) => void;
};

function statusClass(status: string): string {
  if (status === "completed") return "ok";
  if (status === "failed") return "danger";
  if (status === "processing") return "warn";
  return "neutral";
}
function statusLabel(status: string): string {
  if (status === "completed") return "Tamamlandi";
  if (status === "failed") return "Basarisiz";
  if (status === "processing") return "Isleniyor";
  return status;
}

export function PartList({ parts, selectedPartId, onSelect }: Props) {
  return (
    <section className="panel">
      <h2>Analiz Edilen Parcalar</h2>
      <div className="list">
        {parts.map((p) => (
          <button
            key={p.id}
            className={`list-row ${selectedPartId === p.id ? "active" : ""}`}
            onClick={() => onSelect(p.id)}
          >
            <div className="list-main">
              <div className="file">{p.filename}</div>
              <div className="muted small">{new Date(p.created_at).toLocaleString()}</div>
            </div>
            <span className={`pill ${statusClass(p.status)}`}>{statusLabel(p.status)}</span>
          </button>
        ))}
        {parts.length === 0 && <div className="muted">Henuz parca yuklenmedi.</div>}
      </div>
    </section>
  );
}
