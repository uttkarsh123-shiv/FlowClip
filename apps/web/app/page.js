"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ItemCard from "@/components/ItemCard";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/auth";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeType, setActiveType] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  // Show nothing while checking auth
  if (loading) return null;
  if (!user) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar onMenuClick={() => setSidebarOpen((o) => !o)} onLogout={handleLogout} user={user} />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar active={activeType} onChange={setActiveType} isOpen={sidebarOpen} />
        <main style={{ flex: 1, background: "#fafafa" }}>
          <ItemCard activeType={activeType} />
        </main>
      </div>
    </div>
  );
}
