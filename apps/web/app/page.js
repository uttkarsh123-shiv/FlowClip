"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import ItemCard from "@/components/ItemCard";

export default function Home() {
  const [activeType, setActiveType] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar onMenuClick={() => setSidebarOpen((o) => !o)} />
      <div style={{ display: "flex", flex: 1 }}>
        <Sidebar active={activeType} onChange={setActiveType} isOpen={sidebarOpen} />
        <main style={{ flex: 1, background: "#fafafa" }}>
          <ItemCard />
        </main>
      </div>
    </div>
  );
}
