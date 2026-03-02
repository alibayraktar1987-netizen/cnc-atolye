import { useMemo, useState } from "react";
import type { MachineProfile, Material } from "../types/domain";

type Props = {
  materials: Material[];
  machineProfiles: MachineProfile[];
  onUpload: (file: File, materialId: number, machineProfileId: string) => Promise<void>;
  busy: boolean;
};

export function UploadPanel({ materials, machineProfiles, onUpload, busy }: Props) {
  const [materialId, setMaterialId] = useState<number | null>(null);
  const [machineProfileId, setMachineProfileId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const acceptedHint = ".step,.stp";
  const defaultMaterialId = useMemo(() => materials[0]?.id ?? null, [materials]);
  const defaultMachineProfileId = useMemo(() => machineProfiles[0]?.id ?? null, [machineProfiles]);

  const selectedMaterial = materialId ?? defaultMaterialId;
  const selectedMachineProfile = machineProfileId ?? defaultMachineProfileId;

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
    if (!selectedMachineProfile) {
      setError("Please select a machine.");
      return;
    }
    await onUpload(file, selectedMaterial, selectedMachineProfile);
    setFile(null);
  }

  return (
    <section className="panel">
      <h2>STEP Upload</h2>
      <p className="muted">AP203 / AP214 .step or .stp files are accepted.</p>
      <div className="form-grid">
        <label className="field">
          <span>Machine</span>
          <select
            value={selectedMachineProfile ?? ""}
            onChange={(e) => setMachineProfileId(e.target.value || null)}
          >
            {machineProfiles.map((m) => (
              <option value={m.id} key={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
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
