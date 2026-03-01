import { Suspense, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { Bounds, Grid, OrbitControls, useGLTF } from "@react-three/drei";
import { OBJLoader } from "three-stdlib";

type Props = {
  modelUrl: string | null;
  modelFormat: string | null;
};

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

export function ModelViewer({ modelUrl, modelFormat }: Props) {
  const normalizedFormat = useMemo(() => (modelFormat ?? "glb").toLowerCase(), [modelFormat]);

  return (
    <section className="panel viewer">
      <h2>3D Preview</h2>
      {!modelUrl ? (
        <div className="muted">Model not ready yet.</div>
      ) : (
        <Canvas camera={{ position: [200, 140, 180], fov: 40 }}>
          <color attach="background" args={["#0e1118"]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[240, 260, 200]} intensity={1.2} />
          <Suspense fallback={null}>
            <Bounds fit clip observe margin={1.3}>
              <SceneContent url={modelUrl} format={normalizedFormat} />
            </Bounds>
          </Suspense>
          <Grid args={[400, 400]} cellColor={"#263043"} sectionColor={"#33435a"} />
          <OrbitControls makeDefault />
        </Canvas>
      )}
    </section>
  );
}
