"use client";
import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
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

export default function ItemCard({ activeType, searchQuery = "", onCountChange }) {
  const { user } = useAuth();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [hoveredUrl, setHoveredUrl] = useState(null);
  const items = useQuery(api.items.getItems, user ? { userId: user._id } : "skip");
  const deleteItem = useMutation(api.items.deleteItem);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".kebab-container")) setOpenMenuId(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const filteredItems = items
    ?.filter((item) => activeType === "all" || item.type === activeType)
    ?.filter((item) => !searchQuery || item.content?.toLowerCase().includes(searchQuery.toLowerCase()));

  useEffect(() => {
    if (items && onCountChange) onCountChange(items.length);
  }, [items?.length]);

  const handleDelete = (id) => { deleteItem({ id }); setOpenMenuId(null); };

  return (
    <div style={{ padding: "32px 40px", background: "#fff", minHeight: "calc(100vh - 72px)", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

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

      <div style={{ columns: "3 320px", columnGap: 24 }}>
        {filteredItems?.map((item) => {
          const badge = typeBadge[item.type] ?? typeBadge.text;
          return (
            <div key={item._id} style={{
              breakInside: "avoid",
              marginBottom: 24,
              background: "#f9fafb",
              border: "1px solid #f0f0f0",
              borderRadius: 14,
              padding: "20px",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#10b981"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(16, 185, 129, 0.08)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#f0f0f0"; e.currentTarget.style.boxShadow = "none"; }}>

              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", background: badge.bg, color: badge.color, borderRadius: 4, padding: "4px 8px" }}>
                  {typeLabel[item.type] ?? "Clip"}
                </span>
                <div className="kebab-container" style={{ position: "relative" }}>
                  <button onClick={() => setOpenMenuId(openMenuId === item._id ? null : item._id)}
                    style={{ background: "none", border: "none", padding: 6, cursor: "pointer", color: "#ccc", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.target.style.color = "#999"; }}
                    onMouseLeave={(e) => { e.target.style.color = "#ccc"; }}>
                    <KebabIcon />
                  </button>
                  {openMenuId === item._id && (
                    <div style={{ position: "absolute", right: 0, bottom: "100%", background: "#fff", border: "1px solid #e5e5e5", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", zIndex: 10, minWidth: 110, marginBottom: 6, overflow: "hidden" }}>
                      <button onClick={() => handleDelete(item._id)}
                        style={{ display: "block", width: "100%", padding: "10px 14px", border: "none", background: "none", textAlign: "left", cursor: "pointer", fontSize: 13, color: "#dc2626", fontWeight: 600 }}
                        onMouseEnter={(e) => { e.target.style.background = "#fef2f2"; }}
                        onMouseLeave={(e) => { e.target.style.background = "none"; }}>
                        Delete
                      </button>
                    </div>
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
              <p style={{ marginTop: 12, fontSize: 11, color: "#bbb", borderTop: "1px solid #f0f0f0", paddingTop: 10, margin: "12px 0 0" }}>
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
