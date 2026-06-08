import { useState, useCallback } from "react";
import UploadPanel from "./components/UploadPanel";
import ModelViewer from "./components/ModelViewer";

export default function App() {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  const handleUpload = useCallback(async (file) => {
    setLoading(true);
    setProgress("Removing background…");
    setJob(null);

    try {
      const form = new FormData();
      form.append("file", file);

      setProgress("Generating 3D mesh…");
      const res = await fetch("http://127.0.0.1:8000/generate-3d", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || `Server error ${res.status}`);
      }

      const data = await res.json();
      setJob(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
      setProgress("");
    }
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        padding: "40px 24px",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.5px" }}>
        OmniMesh
      </h1>
      <p style={{ color: "#8892a4", marginBottom: 8 }}>
        Upload a 2D image and receive a 3D model.
      </p>

      <UploadPanel onUpload={handleUpload} loading={loading} />

      {loading && (
        <div style={{ color: "#5eead4", fontVariantNumeric: "tabular-nums" }}>
          {progress}
        </div>
      )}

      {job && (
        <div style={{ width: "100%", maxWidth: 700 }}>
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginBottom: 16,
              justifyContent: "center",
            }}
          >
            {job.tags.map((t) => (
              <span
                key={t}
                style={{
                  background: "#1e293b",
                  padding: "4px 14px",
                  borderRadius: 999,
                  fontSize: 13,
                  color: "#94a3b8",
                }}
              >
                {t}
              </span>
            ))}
          </div>

          <ModelViewer
            modelUrl={`http://127.0.0.1:8000${job.model_url}`}
          />
        </div>
      )}
    </div>
  );
}
