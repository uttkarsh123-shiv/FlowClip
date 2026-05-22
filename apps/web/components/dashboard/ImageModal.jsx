"use client";
import { useState } from "react";

export default function ImageModal({ imageData, onClose }) {
  const [downloaded, setDownloaded] = useState(false);

  if (!imageData) return null;

  const handleDownload = async () => {
    // imageData can be a URL (Convex Storage) or base64
    if (imageData.startsWith("http")) {
      // Fetch the image and download as blob
      const res = await fetch(imageData);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `flowclip-screenshot-${Date.now()}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // Legacy base64
      const a = document.createElement("a");
      a.href = imageData;
      a.download = `flowclip-screenshot-${Date.now()}.jpg`;
      a.click();
    }
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div
      onClick={() => { onClose(); setDownloaded(false); }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 12 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 1100, maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 8px 40px rgba(0,0,0,0.2)", fontFamily: "var(--font-sans), 'Plus Jakarta Sans', sans-serif" }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#000" }}>Screenshot</span>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleDownload}
              style={{ fontSize: 12, fontWeight: 600, color: downloaded ? "#fff" : "#38d091", background: downloaded ? "#38d091" : "none", border: "1px solid #38d091", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
              {downloaded ? "Saved ✓" : "Download"}
            </button>
            <button
              onClick={() => { onClose(); setDownloaded(false); }}
              style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#aaa", lineHeight: 1, padding: "0 4px" }}>
              ×
            </button>
          </div>
        </div>

        {/* Image */}
        <div style={{ overflowY: "auto", padding: 24 }}>
          <img
            src={imageData}
            alt="Screenshot"
            style={{ width: "100%", objectFit: "contain", borderRadius: 8, display: "block" }}
          />
        </div>
      </div>
    </div>
  );
}
