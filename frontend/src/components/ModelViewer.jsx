import { Suspense, useRef, useEffect, useCallback } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

function Model({ url, onReady }) {
  const ext = url.split(".").pop().toLowerCase();
  const geom = useLoader(
    ext === "glb" || ext === "gltf" ? GLTFLoader : OBJLoader,
    url
  );
  const scene = geom.scene ?? geom;
  const ref = useRef();

  useEffect(() => {
    if (ref.current) {
      const box = new THREE.Box3().setFromObject(ref.current);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3()).length();
      onReady?.(center, size);
    }
  }, [onReady]);

  return <primitive ref={ref} object={scene} />;
}

export default function ModelViewer({ modelUrl }) {
  const controlsRef = useRef();

  const handleReady = useCallback((center, size) => {
    if (controlsRef.current) {
      controlsRef.current.target.copy(center);
      const dist = Math.max(size * 1.5, 2);
      const cam = controlsRef.current.object;
      cam.position.set(
        center.x + dist,
        center.y + dist * 0.5,
        center.z + dist
      );
      cam.lookAt(center);
      controlsRef.current.update();
    }
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: 480,
        borderRadius: 16,
        overflow: "hidden",
        background: "#111820",
      }}
    >
      <Canvas
        camera={{ position: [3, 2, 5], fov: 30 }}
        gl={{ outputColorSpace: "srgb", toneMapping: THREE.ACESFilmicToneMapping }}
        onCreated={({ gl }) => {
          gl.setClearColor("#0b0e14");
        }}
      >
        <ambientLight intensity={0.4} />
        <hemisphereLight args={["#b1e1ff", "#606060", 0.8]} />
        <directionalLight position={[5, 8, 5]} intensity={1.5} />
        <directionalLight position={[-5, 3, -5]} intensity={0.7} />
        <directionalLight position={[0, -4, 6]} intensity={0.3} />
        <Suspense fallback={null}>
          <Model url={modelUrl} onReady={handleReady} />
        </Suspense>
        <OrbitControls ref={controlsRef} enablePan enableZoom enableRotate />
      </Canvas>
    </div>
  );
}
