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

export function PartList({ parts, selectedPartId, onSelect }: Props) {
  return (
    <section className="panel">
      <h2>Analyzed Parts</h2>
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
            <span className={`pill ${statusClass(p.status)}`}>{p.status}</span>
          </button>
        ))}
        {parts.length === 0 && <div className="muted">No parts uploaded yet.</div>}
      </div>
    </section>
  );
}
