import { Component, Suspense, type ReactNode, useEffect, useMemo, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { Bounds, Grid, OrbitControls, useGLTF } from "@react-three/drei";
import { OBJLoader } from "three-stdlib";

type Props = {
  modelUrl: string | null;
  modelFormat: string | null;
  geometry: Record<string, unknown> | null;
  stock: Record<string, unknown> | null;
};

type ErrorBoundaryProps = {
  onError: () => void;
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ViewerErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function GLBModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function OBJModel({ url }: { url: string }) {
  const obj = useLoader(OBJLoader, url);
  return <primitive object={obj} />;
}

function SceneContent({ url, format }: { url: string; format: string | null }) {
  if (format === "obj") return <OBJModel url={url} />;
  return <GLBModel url={url} />;
}

function toPositiveNumber(value: unknown, fallback: number): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return fallback;
  return num;
}

function FallbackModel({
  geometry,
  stock,
}: {
  geometry: Record<string, unknown> | null;
  stock: Record<string, unknown> | null;
}) {
  const bbox = ((geometry?.bbox ?? {}) as Record<string, unknown>) ?? {};
  const x = toPositiveNumber(bbox.x_mm, 60);
  const y = toPositiveNumber(bbox.y_mm, 60);
  const z = toPositiveNumber(bbox.z_mm, 100);
  const stockType = String(stock?.stock_type ?? "").toLowerCase();
  const isRound = stockType === "round_bar" || Math.abs(x - y) / Math.max(x, y) < 0.08;
  const radius = Math.max(4, Math.max(x, y) / 2);

  if (isRound) {
    return (
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, z, 56]} />
        <meshStandardMaterial color={"#5f90ff"} metalness={0.32} roughness={0.4} />
      </mesh>
    );
  }

  return (
    <mesh castShadow receiveShadow>
      <boxGeometry args={[x, y, z]} />
      <meshStandardMaterial color={"#5f90ff"} metalness={0.2} roughness={0.46} />
    </mesh>
  );
}

function hasUsableGeometry(geometry: Record<string, unknown> | null): boolean {
  const bbox = ((geometry?.bbox ?? {}) as Record<string, unknown>) ?? {};
  return Number(bbox.x_mm) > 0 && Number(bbox.y_mm) > 0 && Number(bbox.z_mm) > 0;
}

export function ModelViewer({ modelUrl, modelFormat, geometry, stock }: Props) {
  const normalizedFormat = useMemo(() => (modelFormat ?? "glb").toLowerCase(), [modelFormat]);
  const [modelError, setModelError] = useState(false);
  const fallbackAvailable = hasUsableGeometry(geometry);
  const canvasKey = useMemo(() => {
    if (modelUrl) return `${modelUrl}|${normalizedFormat}`;
    const bbox = ((geometry?.bbox ?? {}) as Record<string, unknown>) ?? {};
    return `fallback:${bbox.x_mm ?? "x"}:${bbox.y_mm ?? "y"}:${bbox.z_mm ?? "z"}:${String(stock?.stock_type ?? "")}`;
  }, [modelUrl, normalizedFormat, geometry, stock]);

  useEffect(() => {
    setModelError(false);
  }, [modelUrl, normalizedFormat]);

  useEffect(() => {
    if (!modelUrl || normalizedFormat !== "glb") return;
    return () => {
      useGLTF.clear(modelUrl);
    };
  }, [modelUrl, normalizedFormat]);

  const showModel = Boolean(modelUrl) && !modelError;
  const showFallback = !showModel && fallbackAvailable;
  const emptyState = !showModel && !showFallback;

  return (
    <section className="panel viewer">
      <h2>3D Preview</h2>
      {emptyState ? (
        <div className="muted">Model not ready yet.</div>
      ) : (
        <Canvas key={canvasKey} camera={{ position: [210, 150, 200], fov: 40 }}>
          <color attach="background" args={["#0e1118"]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[240, 260, 200]} intensity={1.2} />
          <Suspense fallback={null}>
            <Bounds fit clip observe margin={1.3}>
              {showModel && modelUrl ? (
                <ViewerErrorBoundary key={`${modelUrl}|${normalizedFormat}`} onError={() => setModelError(true)}>
                  <SceneContent url={modelUrl} format={normalizedFormat} />
                </ViewerErrorBoundary>
              ) : (
                <FallbackModel geometry={geometry} stock={stock} />
              )}
            </Bounds>
          </Suspense>
          <Grid args={[400, 400]} cellColor={"#263043"} sectionColor={"#33435a"} />
          <OrbitControls makeDefault />
        </Canvas>
      )}
      {modelError && (
        <div className="muted" style={{ marginTop: 8 }}>
          Preview model could not be loaded, fallback geometry is shown.
        </div>
      )}
      {!showModel && showFallback && !modelError && (
        <div className="muted" style={{ marginTop: 8 }}>
          Model file is not available yet, showing geometry-based preview.
        </div>
      )}
    </section>
  );
}
