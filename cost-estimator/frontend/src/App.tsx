import { useEffect, useMemo, useState } from "react";
import { fetchJob, fetchMachineProfiles, fetchMaterials, fetchPart, fetchParts, getModelUrl, uploadStep } from "./api";
import { EstimatePanel } from "./components/EstimatePanel";
import { ModelViewer } from "./components/ModelViewer";
import { PartList } from "./components/PartList";
import { UploadPanel } from "./components/UploadPanel";
import type { AnalysisJob, MachineProfile, Material, PartRead, PartSummary } from "./types/domain";
import "./styles.css";

function App() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [machineProfiles, setMachineProfiles] = useState<MachineProfile[]>([]);
  const [parts, setParts] = useState<PartSummary[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [selectedPart, setSelectedPart] = useState<PartRead | null>(null);
  const [activeJob, setActiveJob] = useState<AnalysisJob | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [globalError, setGlobalError] = useState("");

  async function loadInitial() {
    setGlobalError("");
    try {
      const [materialsData, machineProfilesData, partsData] = await Promise.all([
        fetchMaterials(),
        fetchMachineProfiles(),
        fetchParts(),
      ]);
      setMaterials(materialsData);
      setMachineProfiles(machineProfilesData);
      setParts(partsData);
      if (!selectedPartId && partsData.length > 0) {
        setSelectedPartId(partsData[0].id);
      }
    } catch (error) {
      console.error(error);
      setGlobalError("API connection failed. Check backend service.");
    }
  }

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    if (!selectedPartId) {
      setSelectedPart(null);
      return;
    }
    fetchPart(selectedPartId)
      .then((data) => setSelectedPart(data))
      .catch((error) => {
        console.error(error);
        setGlobalError("Part details could not be loaded.");
      });
  }, [selectedPartId]);

  useEffect(() => {
    if (!activeJob?.id) return;
    const timer = window.setInterval(async () => {
      try {
        const next = await fetchJob(activeJob.id);
        setActiveJob(next);
        if (next.status === "completed" || next.status === "failed") {
          window.clearInterval(timer);
          await loadInitial();
          setSelectedPartId(next.part_id);
        }
      } catch (error) {
        console.error(error);
      }
    }, 1800);
    return () => window.clearInterval(timer);
  }, [activeJob?.id]);

  async function handleUpload(file: File, materialId: number, machineProfileId: string) {
    setUploadBusy(true);
    setGlobalError("");
    try {
      const response = await uploadStep(file, materialId, machineProfileId);
      const job = await fetchJob(response.job_id);
      setActiveJob(job);
      setSelectedPartId(response.part_id);
      await loadInitial();
    } catch (error) {
      console.error(error);
      setGlobalError("Upload failed. Check file format and API logs.");
    } finally {
      setUploadBusy(false);
    }
  }

  const modelUrl = useMemo(() => {
    if (!selectedPart) return null;
    if (!selectedPart.model_key) return null;
    return `${getModelUrl(selectedPart.id)}?v=${encodeURIComponent(selectedPart.updated_at)}`;
  }, [selectedPart]);

  return (
    <main className="layout">
      <header className="topbar">
        <div>
          <h1>CNC Material Quote & Cost Estimator</h1>
          <p>STEP upload, stock suggestion, operation planning and cycle-time based cost output.</p>
        </div>
        <button className="ghost" onClick={loadInitial}>
          Refresh
        </button>
      </header>

      {globalError && <div className="alert error">{globalError}</div>}
      {activeJob && (
        <div className={`alert ${activeJob.status === "failed" ? "error" : "info"}`}>
          Job {activeJob.id.slice(0, 8)}... status: <strong>{activeJob.status}</strong>
          {activeJob.error_message ? ` - ${activeJob.error_message}` : ""}
        </div>
      )}

      <section className="grid-two">
        <UploadPanel
          materials={materials}
          machineProfiles={machineProfiles}
          onUpload={handleUpload}
          busy={uploadBusy}
        />
        <PartList parts={parts} selectedPartId={selectedPartId} onSelect={setSelectedPartId} />
      </section>

      <section className="grid-two viewer-section">
        <ModelViewer modelUrl={modelUrl} modelFormat={selectedPart?.model_format ?? null} />
        <EstimatePanel part={selectedPart} />
      </section>
    </main>
  );
}

export default App;
