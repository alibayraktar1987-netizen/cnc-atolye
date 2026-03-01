import { useMemo, useState } from "react";
import type { Material } from "../types/domain";

type Props = {
  materials: Material[];
  onUpload: (file: File, materialId: number) => Promise<void>;
  busy: boolean;
};

export function UploadPanel({ materials, onUpload, busy }: Props) {
  const [materialId, setMaterialId] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const acceptedHint = ".step,.stp";
  const defaultMaterialId = useMemo(() => materials[0]?.id ?? null, [materials]);

  const selectedMaterial = materialId ?? defaultMaterialId;

  async function handleUpload() {
    setError("");
    if (!file) {
      setError("Please select a STEP file.");
      return;
    }
    if (!selectedMaterial) {
      setError("Please select a material.");
      return;
    }
    await onUpload(file, selectedMaterial);
    setFile(null);
  }

  return (
    <section className="panel">
      <h2>STEP Upload</h2>
      <p className="muted">AP203 / AP214 .step or .stp files are accepted.</p>
      <div className="form-grid">
        <label className="field">
          <span>Material</span>
          <select value={selectedMaterial ?? ""} onChange={(e) => setMaterialId(Number(e.target.value) || null)}>
            {materials.map((m) => (
              <option value={m.id} key={m.id}>
                {m.code} - {m.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>STEP File</span>
          <input
            type="file"
            accept={acceptedHint}
            onChange={(e) => setFile(e.target.files && e.target.files.length > 0 ? e.target.files[0] : null)}
          />
        </label>
      </div>
      {file && (
        <div className="tag">
          Selected: <strong>{file.name}</strong> ({Math.round(file.size / 1024)} KB)
        </div>
      )}
      {error && <div className="alert error">{error}</div>}
      <button className="primary" disabled={busy} onClick={handleUpload}>
        {busy ? "Uploading..." : "Upload & Analyze"}
      </button>
    </section>
  );
}
