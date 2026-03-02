import { useEffect, useMemo, useState } from "react";
import {
  clearMockData,
  fetchJob,
  fetchMachineProfiles,
  fetchMaterials,
  fetchPart,
  fetchParts,
  getModelUrl,
  isMockModeActive,
  uploadStep,
} from "./api";
import { EstimatePanel } from "./components/EstimatePanel";
import { ModelViewer } from "./components/ModelViewer";
import { PartList } from "./components/PartList";
import { UploadPanel } from "./components/UploadPanel";
import type { AnalysisJob, MachineProfile, Material, PartRead, PartSummary } from "./types/domain";
import "./styles.css";

function jobStatusLabel(status: string): string {
  if (status === "processing") return "Isleniyor";
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
  const [activeJob, setActiveJob] = useState<AnalysisJob | null>(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [mockMode, setMockMode] = useState(isMockModeActive());

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
      setMockMode(isMockModeActive());
      setSelectedPartId((current) => {
        if (partsData.length === 0) return null;
        if (current && partsData.some((p) => p.id === current)) return current;
        return partsData[0].id;
      });
    } catch (error) {
      console.error(error);
      setGlobalError("API baglantisi basarisiz. Arka servis kontrol edin.");
      setMockMode(isMockModeActive());
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
      setGlobalError("Yukleme basarisiz. Dosya bicimini ve API kayitlarini kontrol edin.");
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
      {mockMode && (
        <div className="alert info">
          Backend baglantisi olmadigi icin yerel demo modu aktif. Gosterilen model ve hesaplar gercek STEP analizinden
          gelmez.
          <button
            className="ghost"
            onClick={() => {
              clearMockData();
              setSelectedPartId(null);
              setSelectedPart(null);
              setActiveJob(null);
              loadInitial();
            }}
            style={{ marginLeft: 10, padding: "4px 10px" }}
          >
            Demo veriyi temizle
          </button>
        </div>
      )}
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
