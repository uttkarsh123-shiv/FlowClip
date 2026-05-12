"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ItemCard from "@/components/ItemCard";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/auth";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeType, setActiveType] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [clipCount, setClipCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  if (loading || !user) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#fff" }}>
      <Navbar
        onMenuClick={() => setSidebarOpen((o) => !o)}
        onLogout={handleLogout}
        user={user}
        searchQuery={searchQuery}
        onSearch={setSearchQuery}
        clipCount={clipCount}
      />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar active={activeType} onChange={setActiveType} isOpen={sidebarOpen} />
        <main style={{ flex: 1, background: "#fff" }}>
          <ItemCard activeType={activeType} searchQuery={searchQuery} onCountChange={setClipCount} />
        </main>
      </div>
    </div>
  );
}
