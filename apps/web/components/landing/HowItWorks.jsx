"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const F = "var(--font-sans), 'Plus Jakarta Sans', sans-serif";

const STEPS = [
  {
    n: "01",
    label: "Install",
    title: "Install the extension",
    sub: "10 seconds. No setup.",
    visual: (
      <div style={{ padding: "28px 32px", background: "#f9fafb", borderRadius: 16, border: "1px solid #f0f0f0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
          <div style={{ flex: 1, background: "#e5e5e5", borderRadius: 6, height: 28, display: "flex", alignItems: "center", paddingLeft: 12 }}>
            <span style={{ fontSize: 12, color: "#999", fontFamily: F }}>chrome://extensions</span>
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: 10, padding: "16px 20px", border: "1px solid #e5e5e5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, background: "#000", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: F }}>F</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#000", fontFamily: F }}>FlowClip</div>
              <div style={{ fontSize: 11, color: "#aaa", fontFamily: F }}>Smart capture tool</div>
            </div>
          </div>
          <div style={{ background: "#38d091", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 700, color: "#fff", fontFamily: F }}>Add</div>
        </div>
      </div>
    ),
  },
  {
    n: "02",
    label: "Capture",
    title: "Capture anything",
    sub: "Copy text or press S twice.",
    visual: (
      <div style={{ padding: "28px 32px", background: "#f9fafb", borderRadius: 16, border: "1px solid #f0f0f0" }}>
        <div style={{ fontSize: 13, color: "#aaa", fontFamily: F, marginBottom: 14 }}>Any webpage</div>
        <div style={{ background: "#fff", borderRadius: 10, padding: "16px 20px", border: "2px solid #38d091", marginBottom: 14, position: "relative" }}>
          <p style={{ fontSize: 14, color: "#000", lineHeight: 1.6, fontFamily: F }}>
            <span style={{ background: "rgba(56,208,145,0.2)", borderRadius: 3, padding: "1px 2px" }}>
              "The best ideas come when you're in flow — don't break it."
            </span>
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#38d091" }} />
          <span style={{ fontSize: 12, color: "#38d091", fontWeight: 700, fontFamily: F }}>Saved to FlowClip</span>
        </div>
      </div>
    ),
  },
  {
    n: "03",
    label: "Access",
    title: "Access everywhere",
    sub: "Dashboard. Sorted. Searchable.",
    visual: (
      <div style={{ padding: "28px 32px", background: "#f9fafb", borderRadius: 16, border: "1px solid #f0f0f0" }}>
        <div style={{ fontSize: 13, color: "#aaa", fontFamily: F, marginBottom: 14 }}>Your dashboard</div>
        {[
          { type: "TEXT", text: "The best ideas come when you're in flow...", color: "#000", bg: "#000" },
          { type: "LINK", text: "https://github.com/trending", color: "#38d091", bg: "#38d091" },
          { type: "IMG", text: "Screenshot captured", color: "#3b82f6", bg: "#3b82f6" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#fff", borderRadius: 8, border: "1px solid #f0f0f0", marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 800, background: item.bg, color: "#fff", borderRadius: 4, padding: "3px 7px", fontFamily: F }}>{item.type}</span>
            <span style={{ fontSize: 12, color: "#333", fontFamily: F, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.text}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export default function HowItWorks() {
  const wrapperRef = useRef(null);
  const cardRef = useRef(null);
  const bgTextRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const hasShown = useRef(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Show bg text first, card starts hidden
      gsap.set(cardRef.current, { opacity: 0, y: 40, scale: 0.96 });

      ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: "top top",
        end: `+=${STEPS.length * 600}`,
        pin: true,
        pinSpacing: true,
        onEnter: () => {
          if (hasShown.current) return;
          hasShown.current = true;
          setTimeout(() => {
            setVisible(true);
            gsap.to(cardRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power2.out" });
          }, 600);
        },
        onUpdate: (self) => {
          const idx = Math.min(Math.floor(self.progress * STEPS.length), STEPS.length - 1);
          setActiveStep(idx);
        },
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  // Animate card on step change
  useEffect(() => {
    if (!cardRef.current || !visible) return;
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
    );
  }, [activeStep]);

  const step = STEPS[activeStep];

  return (
    <div ref={wrapperRef} style={{ height: "100vh", background: "#fff", overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>

      {/* Giant bg text */}
      <div ref={bgTextRef} style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", userSelect: "none", overflow: "hidden" }}>
        <span style={{ fontSize: "15vw", fontWeight: 900, color: "#f0f0f0", letterSpacing: "-4px", fontFamily: F, whiteSpace: "nowrap", lineHeight: 1 }}>
          How it works
        </span>
      </div>
      {/* Card — split layout */}
      <div ref={cardRef} style={{ position: "relative", zIndex: 10, width: 760, background: "#fff", border: "1px solid #ebebeb", borderRadius: 28, overflow: "hidden", boxShadow: "0 8px 48px rgba(0,0,0,0.08)", display: "flex" }}>

        {/* Left — step info */}
        <div style={{ width: 280, padding: "48px 40px", background: "#fafafa", borderRight: "1px solid #f0f0f0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 72, fontWeight: 900, color: "#f0f0f0", letterSpacing: "-3px", lineHeight: 1, fontFamily: F, marginBottom: 24 }}>{step.n}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#38d091", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 10, fontFamily: F }}>{step.label}</div>
            <h3 style={{ fontSize: 24, fontWeight: 900, color: "#000", letterSpacing: "-0.5px", lineHeight: 1.2, marginBottom: 10, fontFamily: F }}>{step.title}</h3>
            <p style={{ fontSize: 14, color: "#aaa", fontWeight: 500, fontFamily: F }}>{step.sub}</p>
          </div>

          {/* Progress bar */}
          <div style={{ height: 3, background: "#f0f0f0", borderRadius: 2, marginTop: 32 }}>
            <div style={{ height: "100%", width: `${((activeStep + 1) / STEPS.length) * 100}%`, background: "#38d091", borderRadius: 2, transition: "width 0.4s ease" }} />
          </div>
        </div>

        {/* Right — visual */}
        <div style={{ flex: 1, padding: "40px 36px", display: "flex", alignItems: "center" }}>
          <div style={{ width: "100%" }}>{step.visual}</div>
        </div>
      </div>
    </div>
  );
}
