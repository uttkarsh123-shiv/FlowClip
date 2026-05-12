"use client";
import { useQuery, useMutation } from "convex/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { api } from "../../../convex/_generated/api";
import KebabIcon from "./KebabIcon.jsx";
import ImageModal from "./ImageModal.jsx";
import { useAuth } from "@/hooks/useAuth";

const typeLabel = { text: "Text", link: "Link", image: "Image" };
const typeBadge = {
  text:  { bg: "#000",     color: "#fff" },
  link:  { bg: "#10b981",  color: "#fff" },
  image: { bg: "#6366f1",  color: "#fff" },
};

// Dropdown rendered via portal — zero layout impact
function KebabMenu({ anchorRef, onDelete, onClose }) {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 6,
        left: rect.right + window.scrollX - 120,
      });
    }
  }, [anchorRef]);

  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest(".kebab-portal")) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return createPortal(
    <div className="kebab-portal" style={{
      position: "absolute",
      top: pos.top,
      left: pos.left,
      background: "#fff",
      border: "1px solid #e5e5e5",
      borderRadius: 8,
      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      zIndex: 9999,
      minWidth: 120,
      overflow: "hidden",
    }}>
      <button
        onClick={onDelete}
        style={{ display: "block", width: "100%", padding: "11px 16px", border: "none", background: "none", textAlign: "left", cursor: "pointer", fontSize: 13, color: "#dc2626", fontWeight: 600 }}
        onMouseEnter={(e) => { e.target.style.background = "#fef2f2"; }}
        onMouseLeave={(e) => { e.target.style.background = "none"; }}
      >
        Delete
      </button>
    </div>,
    document.body
  );
}

export default function ItemCard({ activeType, searchQuery = "", onCountChange }) {
  const { user } = useAuth();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [hoveredUrl, setHoveredUrl] = useState(null);
  const kebabRefs = useRef({});
  const items = useQuery(api.items.getItems, user ? { userId: user._id } : "skip");
  const deleteItem = useMutation(api.items.deleteItem);

  useEffect(() => {
    if (items && onCountChange) onCountChange(items.length);
  }, [items?.length]);

  const filteredItems = items
    ?.filter((item) => activeType === "all" || item.type === activeType)
    ?.filter((item) => !searchQuery || item.content?.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleDelete = (id) => { deleteItem({ id }); setOpenMenuId(null); };

  return (
    <div style={{ padding: "48px 56px", background: "#fff", minHeight: "calc(100vh - 80px)", fontFamily: "var(--font-sans), 'Plus Jakarta Sans', sans-serif" }}>

      {!items && (
        <p style={{ color: "#999", fontSize: 14, marginTop: 60, textAlign: "center" }}>Loading...</p>
      )}

      {items?.length === 0 && (
        <div style={{ textAlign: "center", marginTop: 80 }}>
          <div style={{ width: 64, height: 64, background: "#ecfdf5", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>📋</div>
          <p style={{ color: "#000", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No clips yet</p>
          <p style={{ color: "#999", fontSize: 14, fontWeight: 400 }}>Press Shift+S to start capturing</p>
        </div>
      )}

      <div style={{ columns: "3 340px", columnGap: 28 }}>
        {filteredItems?.map((item) => {
          const badge = typeBadge[item.type] ?? typeBadge.text;
          return (
            <div key={item._id} style={{
              breakInside: "avoid",
              marginBottom: 28,
              background: "#f9fafb",
              border: "1px solid #f0f0f0",
              borderRadius: 16,
              padding: "28px 28px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(16, 185, 129, 0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#f0f0f0"; e.currentTarget.style.boxShadow = "none"; }}>

              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", background: badge.bg, color: badge.color, borderRadius: 5, padding: "5px 10px" }}>
                  {typeLabel[item.type] ?? "Clip"}
                </span>
                <div style={{ position: "relative" }}>
                  <button
                    ref={(el) => { if (el) kebabRefs.current[item._id] = el; }}
                    onClick={() => setOpenMenuId(openMenuId === item._id ? null : item._id)}
                    style={{ background: "none", border: "none", padding: 6, cursor: "pointer", color: "#ccc", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.target.style.color = "#999"; }}
                    onMouseLeave={(e) => { e.target.style.color = "#ccc"; }}>
                    <KebabIcon />
                  </button>
                  {openMenuId === item._id && (
                    <KebabMenu
                      anchorRef={{ current: kebabRefs.current[item._id] }}
                      onDelete={() => handleDelete(item._id)}
                      onClose={() => setOpenMenuId(null)}
                    />
                  )}
                </div>
              </div>

              {/* Content */}
              {item.type === "image" && item.imageData ? (
                <img src={item.imageData} alt="Screenshot" onClick={() => setSelectedImage(item.imageData)}
                  style={{ width: "100%", borderRadius: 8, maxHeight: 200, objectFit: "cover", cursor: "pointer", display: "block" }} />
              ) : item.type === "link" ? (
                <a href={item.content} target="_blank" rel="noreferrer"
                  style={{ display: "block", fontSize: 13, color: "#10b981", wordBreak: "break-all", lineHeight: 1.6, textDecoration: "none", fontWeight: 500 }}
                  onMouseEnter={(e) => { e.target.style.textDecoration = "underline"; }}
                  onMouseLeave={(e) => { e.target.style.textDecoration = "none"; }}>
                  {item.content}
                </a>
              ) : (
                <p style={{ fontSize: 13, color: "#000", lineHeight: 1.6, wordBreak: "break-word", margin: 0, display: "-webkit-box", WebkitLineClamp: 6, WebkitBoxOrient: "vertical", overflow: "hidden", fontWeight: 400 }}>
                  {item.content}
                </p>
              )}

              {/* Source URL */}
              {item.url && item.type !== "link" && (
                <a href={item.url} target="_blank" rel="noreferrer"
                  style={{ display: "block", marginTop: 12, fontSize: 11, color: hoveredUrl === item._id ? "#666" : "#bbb", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textDecoration: "none", transition: "all 0.2s" }}
                  onMouseEnter={() => setHoveredUrl(item._id)}
                  onMouseLeave={() => setHoveredUrl(null)}>
                  {item.url}
                </a>
              )}

              {/* Timestamp */}
              <p style={{ marginTop: 16, fontSize: 12, color: "#bbb", borderTop: "1px solid #f0f0f0", paddingTop: 14, margin: "16px 0 0" }}>
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
      <ImageModal imageData={selectedImage} onClose={() => setSelectedImage(null)} />
    </div>
  );
}
