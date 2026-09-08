import { useEffect, useMemo, useState } from "react";
import {
  fetchJob,
  fetchMachineProfiles,
  fetchMaterials,
  fetchPart,
  fetchParts,
  getModelUrl,
  uploadStep,
} from "./api";
import { EstimatePanel } from "./components/EstimatePanel";
import { ModelViewer } from "./components/ModelViewer";
import { PartList } from "./components/PartList";
import { UploadPanel } from "./components/UploadPanel";
import type { AnalysisJob, MachineProfile, Material, PartRead, PartSummary } from "./types/domain";
import "./styles.css";

function jobStatusLabel(status: string): string {
  if (status === "queued") return "Sirada";
  if (status === "processing" || status === "running") return "Isleniyor";
  if (status === "completed") return "Tamamlandi";
  if (status === "failed") return "Basarisiz";
  return status;
}

function App() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [machineProfiles, setMachineProfiles] = useState<MachineProfile[]>([]);
  const [parts, setParts] = useState<PartSummary[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [selectedPart, setSelectedPart] = useState<PartRead | null>(null);
  const [partRevision, setPartRevision] = useState(0);
  const [activeJob, setActiveJob] = useState<Pick<AnalysisJob, "id" | "part_id" | "status" | "error_message"> | null>(null);
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
      setPartRevision((version) => version + 1);
      setSelectedPartId((current) => {
        if (partsData.length === 0) return null;
        if (current && partsData.some((p) => p.id === current)) return current;
        return partsData[0].id;
      });
    } catch (error) {
      console.error(error);
      setGlobalError("API baglantisi basarisiz. Arka servis kontrol edin.");
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
    // Do not keep showing the previous part while loading the newly selected one.
    setSelectedPart((current) => (current?.id === selectedPartId ? current : null));
    let cancelled = false;
    fetchPart(selectedPartId)
      .then((data) => {
        if (cancelled) return;
        setSelectedPart(data);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error(error);
        setGlobalError("Parca detaylari yuklenemedi.");
        setSelectedPart(null);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedPartId, partRevision]);

  useEffect(() => {
    if (!activeJob?.id) return;
    const jobId = activeJob.id;
    let cancelled = false;
    let timer: number | undefined;
    async function poll() {
      try {
        const next = await fetchJob(jobId);
        if (cancelled) return;
        setActiveJob(next);
        if (next.status === "completed" || next.status === "failed") {
          await loadInitial();
          return;
        }
      } catch (error) {
        if (cancelled) return;
        console.error(error);
      }
      if (!cancelled) timer = window.setTimeout(poll, 1800);
    }
    void poll();
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [activeJob?.id]);

  async function handleUpload(file: File, materialId: number, machineProfileId: string) {
    setUploadBusy(true);
    setGlobalError("");
    try {
      const response = await uploadStep(file, materialId, machineProfileId);
      setActiveJob({ id: response.job_id, part_id: response.part_id, status: response.status, error_message: null });
      setSelectedPartId(response.part_id);
      await loadInitial();
      return true;
    } catch (error) {
      console.error(error);
      setGlobalError("Yukleme basarisiz. Dosya bicimini ve API kayitlarini kontrol edin.");
      return false;
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
          <h1>CNC Malzeme Teklifi ve Maliyet Hesaplayici</h1>
          <p>STEP yukleme, stok onerisi, operasyon planlama ve cevrim suresi bazli maliyet cikisi.</p>
        </div>
        <button className="ghost" onClick={loadInitial}>
          Yenile
        </button>
      </header>

      {globalError && <div className="alert error">{globalError}</div>}
      {activeJob && (
        <div className={`alert ${activeJob.status === "failed" ? "error" : "info"}`}>
          Is {activeJob.id.slice(0, 8)}... durumu: <strong>{jobStatusLabel(activeJob.status)}</strong>
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
        <ModelViewer
          modelUrl={modelUrl}
          modelFormat={selectedPart?.model_format ?? null}
          geometry={(selectedPart?.geometry_json as Record<string, unknown> | null) ?? null}
          stock={(selectedPart?.stock_json as Record<string, unknown> | null) ?? null}
        />
        <EstimatePanel part={selectedPart} />
      </section>
    </main>
  );
}

export default App;
