"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const F = "var(--font-sans), 'Plus Jakarta Sans', sans-serif";

const STEPS = [
  {
    n: "01",
    title: "Install the extension",
    desc: "Add FlowClip to Chrome in seconds. No setup, no configuration required.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#38d091" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" y1="15" x2="12" y2="3"/>
      </svg>
    ),
  },
  {
    n: "02",
    title: "Capture anything",
    desc: "Press Shift+S on any page. Text, links, screenshots — saved without leaving the tab.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#38d091" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
        <circle cx="12" cy="13" r="4"/>
      </svg>
    ),
  },
  {
    n: "03",
    title: "Access everywhere",
    desc: "Open your dashboard. Everything sorted, searchable, and synced across all your devices.",
    icon: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#38d091" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const wrapperRef = useRef(null);
  const cardRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Pin the section for 3 * 600px of scroll
      ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: "top top",
        end: `+=${STEPS.length * 600}`,
        pin: true,
        pinSpacing: true,
        onUpdate: (self) => {
          // Divide progress into equal thirds
          const idx = Math.min(
            Math.floor(self.progress * STEPS.length),
            STEPS.length - 1
          );
          setActiveStep(idx);
        },
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  // Animate card content change
  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
  }, [activeStep]);

  const step = STEPS[activeStep];

  return (
    <div
      ref={wrapperRef}
      style={{
        height: "100vh",
        background: "#fff",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Giant faded background text */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        userSelect: "none",
        overflow: "hidden",
      }}>
        <span style={{
          fontSize: "15vw",
          fontWeight: 900,
          color: "#f0f0f0",
          letterSpacing: "-4px",
          fontFamily: F,
          whiteSpace: "nowrap",
          lineHeight: 1,
        }}>
          How it works
        </span>
      </div>
      {/* Single centered card — content swaps */}
      <div
        ref={cardRef}
        style={{
          position: "relative",
          zIndex: 10,
          width: 760,
          background: "#fff",
          border: "1px solid #ebebeb",
          borderRadius: 28,
          padding: "52px 56px 56px",
          boxShadow: "0 8px 48px rgba(0,0,0,0.08)",
        }}
      >
        {/* Icon top left */}
        <div style={{
          width: 80, height: 80,
          background: "#f0fdf4", borderRadius: 20,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 32,
        }}>
          {step.icon}
        </div>

        {/* Step counter */}
        <div style={{
          fontSize: 14, fontWeight: 800, color: "#38d091",
          letterSpacing: "1px", marginBottom: 14, fontFamily: F,
        }}>
          {step.n} / 0{STEPS.length}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: 44, fontWeight: 900, color: "#000",
          marginBottom: 20, letterSpacing: "-1px", lineHeight: 1.1, fontFamily: F,
        }}>
          {step.title}
        </h3>

        {/* Description */}
        <p style={{
          fontSize: 20, color: "#888",
          lineHeight: 1.65, fontWeight: 500, fontFamily: F,
          maxWidth: 520,
        }}>
          {step.desc}
        </p>

        {/* Progress bar at bottom */}
        <div style={{ marginTop: 48, height: 3, background: "#f0f0f0", borderRadius: 2 }}>
          <div style={{
            height: "100%",
            width: `${((activeStep + 1) / STEPS.length) * 100}%`,
            background: "#38d091",
            borderRadius: 2,
            transition: "width 0.4s ease",
          }} />
        </div>
      </div>
    </div>
  );
}
