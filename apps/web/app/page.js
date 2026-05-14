"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import LandingNav from "@/components/landing/LandingNav";
import LandingHero from "@/components/landing/LandingHero";
import ExtensionPreview from "@/components/landing/ExtensionPreview";
import LandingFeatures from "@/components/landing/LandingFeatures";
import HowItWorks from "@/components/landing/HowItWorks";
import LandingWhy from "@/components/landing/LandingWhy";
import LandingFAQ from "@/components/landing/LandingFAQ";
import LandingCTAFooter from "@/components/landing/LandingCTAFooter";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [authModal, setAuthModal] = useState(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading || user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "var(--font-sans), 'Plus Jakarta Sans', sans-serif", overflowX: "hidden" }}>
      <LandingNav
        onSignIn={() => setAuthModal("login")}
        onSignUp={() => setAuthModal("register")}
      />
      <LandingHero
        onRegister={() => setAuthModal("register")}
        onLogin={() => setAuthModal("login")}
      />
      <ExtensionPreview />
      <LandingFeatures />
      <div id="how-it-works"><HowItWorks /></div>
      <LandingWhy onRegister={() => setAuthModal("register")} />
      <LandingFAQ />
      <LandingCTAFooter onRegister={() => setAuthModal("register")} />

      {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} />}
    </div>
  );
}
