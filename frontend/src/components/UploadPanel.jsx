import { useCallback, useRef, useState } from "react";

export default function UploadPanel({ onUpload, loading }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      setPreview(URL.createObjectURL(file));
      onUpload(file);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e) => handleFile(e.target.files[0]),
    [handleFile]
  );

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={() => !loading && inputRef.current?.click()}
      style={{
        width: 320,
        height: 200,
        border: "2px dashed #334155",
        borderRadius: 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: loading ? "not-allowed" : "pointer",
        background: preview
          ? `center / cover no-repeat url(${preview})`
          : "#111820",
        transition: "border-color 0.2s",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        if (!loading) e.currentTarget.style.borderColor = "#5eead4";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#334155";
      }}
    >
      {!preview && !loading && (
        <p style={{ color: "#64748b", fontSize: 14, textAlign: "center" }}>
          Drop an image here, or click to browse
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleChange}
      />
    </div>
  );
}
