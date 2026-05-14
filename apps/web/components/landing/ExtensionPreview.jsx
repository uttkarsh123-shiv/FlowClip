"use client";
import { useState, useEffect } from "react";

const F = "var(--font-sans), 'Plus Jakarta Sans', sans-serif";

const SLIDES = [
  {
    label: "Save links instantly",
    heading: "Browsing something useful?",
    desc: "Copy any text or link on the page. It's saved with the source URL automatically.",
    clips: [
      { badge: "LINK", text: "https://producthunt.com/", iconBg: "#ecfdf5", iconColor: "#38d091", time: "just now" },
      { badge: "TEXT", text: "Focus is the new superpower.", iconBg: "#f5f5f5", iconColor: "#000", time: "4 min ago" },
      { badge: "IMG", text: "Screenshot captured", iconBg: "#eff6ff", iconColor: "#3b82f6", time: "9 min ago" },
    ],
    activeIndex: 0,
  },
  {
    label: "Capture text",
    heading: "Found a quote worth keeping?",
    desc: "Copy any text or link on the page. It's saved with the source URL automatically.",
    clips: [
      { badge: "LINK", text: "https://producthunt.com/", iconBg: "#ecfdf5", iconColor: "#38d091", time: "4 min ago" },
      { badge: "TEXT", text: "Focus is the new superpower.", iconBg: "#f5f5f5", iconColor: "#000", time: "just now" },
      { badge: "IMG", text: "Screenshot captured", iconBg: "#eff6ff", iconColor: "#3b82f6", time: "9 min ago" },
    ],
    activeIndex: 1,
  },
  {
    label: "Screenshot anything",
    heading: "See something you need to remember?",
    desc: "Press S twice to capture a screenshot of the page. Stored and synced instantly.",
    clips: [
      { badge: "LINK", text: "https://producthunt.com/", iconBg: "#ecfdf5", iconColor: "#38d091", time: "4 min ago" },
      { badge: "TEXT", text: "Focus is the new superpower.", iconBg: "#f5f5f5", iconColor: "#000", time: "9 min ago" },
      { badge: "IMG", text: "Screenshot captured", iconBg: "#eff6ff", iconColor: "#3b82f6", time: "just now" },
    ],
    activeIndex: 2,
  },
];

export default function ExtensionPreview() {
  const [slide, setSlide] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setSlide((s) => (s + 1) % SLIDES.length);
        setFading(false);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const current = SLIDES[slide];

  return (
    <div style={{
      position: "relative",
      backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.12) 1px, transparent 1px), linear-gradient(to bottom, #38d091 50%, #fff 50%)",
      backgroundSize: "24px 24px, 100% 100%",
    }}>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 64px" }}>
        <div style={{ background: "#fff", borderRadius: 24, padding: "64px 80px 72px", boxShadow: "0 8px 60px rgba(0,0,0,0.14)", display: "flex", gap: 80, alignItems: "center" }}>

          {/* Left */}
          <div style={{ flex: 1, opacity: fading ? 0 : 1, transition: "opacity 0.3s ease" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#38d091", textTransform: "uppercase", letterSpacing: "2px", marginBottom: 14, fontFamily: F }}>{current.label}</p>
            <h3 style={{ fontSize: 36, fontWeight: 900, color: "#000", letterSpacing: "-0.5px", marginBottom: 14, lineHeight: 1.2, fontFamily: F }}>{current.heading}</h3>
            <p style={{ fontSize: 18, color: "#666", lineHeight: 1.7, fontWeight: 500, fontFamily: F }}>{current.desc}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
              {SLIDES.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)} style={{
                  width: i === slide ? 24 : 8, height: 8,
                  borderRadius: 4, border: "none", cursor: "pointer",
                  background: i === slide ? "#38d091" : "#e5e5e5",
                  transition: "all 0.3s ease", padding: 0,
                }} />
              ))}
            </div>
          </div>

          {/* Right — extension mockup */}
          <div style={{ width: 420, flexShrink: 0 }}>
            <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderRadius: 20, overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.1)" }}>
              <div style={{ padding: "18px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f0f0f0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, background: "#000", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: F }}>F</div>
                  <span style={{ fontSize: 18, fontWeight: 900, color: "#000", fontFamily: F }}>FlowClip</span>
                </div>
                <span style={{ fontSize: 14, color: "#999", background: "#f5f5f5", padding: "5px 12px", borderRadius: 20, fontWeight: 600, fontFamily: F }}>3 clips</span>
              </div>

              <div style={{ padding: "14px 20px 8px", fontSize: 13, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "1px", fontFamily: F }}>Recent Captures</div>

              <div style={{ padding: "0 12px", display: "flex", flexDirection: "column", gap: 8 }}>
                {current.clips.map((clip, i) => {
                  const isActive = i === current.activeIndex;
                  return (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: isActive ? "18px 16px" : "14px 16px",
                      background: isActive ? "#f0fdf4" : "#f9fafb",
                      border: `1px solid ${isActive ? "#6ee7b7" : "#f0f0f0"}`,
                      borderRadius: 14,
                      boxShadow: isActive ? "0 4px 16px rgba(56,208,145,0.15)" : "none",
                      transition: "all 0.4s ease",
                      animation: isActive ? "fadeSlideIn 0.4s ease" : "none",
                    }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, background: clip.iconBg, border: "1px solid #e5e5e5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: clip.iconColor, flexShrink: 0, fontFamily: F, letterSpacing: "0.5px" }}>{clip.badge}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: isActive ? 700 : 600, color: "#000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: F }}>{clip.text}</div>
                        <div style={{ fontSize: 13, color: isActive ? "#38d091" : "#aaa", marginTop: 4, fontWeight: isActive ? 600 : 400, fontFamily: F }}>{clip.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ padding: "14px 12px" }}>
                <div style={{ background: "#38d091", borderRadius: 10, padding: "13px", textAlign: "center", fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: F }}>Open Dashboard</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
