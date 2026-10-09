"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/dashboard/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import ItemCard from "@/components/dashboard/ItemCard";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/auth";

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [activeType, setActiveType] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [clipCount, setClipCount] = useState(0);

  useEffect(() => {
    if (!loading && user === false) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  // Show nothing only when we know for sure there's no user (not logged in)
  // During initial load — render the shell optimistically, redirect if auth fails
  if (user === false) return null;

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
