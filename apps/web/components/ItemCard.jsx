"use client";
import { useQuery, useMutation } from "convex/react";
import { useState, useEffect } from "react";
import { api } from "../../../convex/_generated/api";
import KebabIcon from "./KebabIcon.jsx";
import ImageModal from "./ImageModal.jsx";
import { useAuth } from "@/hooks/useAuth";

const typeLabel = { text: "Text", link: "Link", image: "Image" };
const typeColor = {
  text:  { bg: "#eff6ff", color: "#2563eb" },
  link:  { bg: "#f0fdf4", color: "#16a34a" },
  image: { bg: "#fff7ed", color: "#ea580c" },
};

export default function ItemCard({activeType, searchQuery = "", onCountChange}) {
  const { user } = useAuth();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const items = useQuery(api.items.getItems, user ? { userId: user._id } : "skip");
  const deleteItem = useMutation(api.items.deleteItem);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.kebab-container')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const filteredItems = items
    ?.filter((item) => activeType === "all" || item.type === activeType)
    ?.filter((item) => !searchQuery || item.content?.toLowerCase().includes(searchQuery.toLowerCase()));

  // Report count to parent
  useEffect(() => {
    if (items && onCountChange) onCountChange(items.length);
  }, [items?.length]);

  const handleDelete = (id) => {
    deleteItem({ id });
    setOpenMenuId(null);
  }
  return (
    <div style={{
      padding: "24px 28px",
      background: "#fafafa",
      minHeight: "120vh",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>

      {/* Loading / empty states */}
      {!items && (
        <p style={{ color: "#aaa", fontSize: 13, marginTop: 40, textAlign: "center" }}>
          Loading...
        </p>
      )}
      {items?.length === 0 && (
        <p style={{ color: "#aaa", fontSize: 13, marginTop: 40, textAlign: "center" }}>
          No clips yet. Start copying.
        </p>
      )}

      {/* Masonry-style grid */}
      <div style={{
        columns: "3 320px",
        columnGap: 16,
      }}>
        {filteredItems?.map((item) => {
          const tag = typeColor[item.type] ?? { bg: "#f5f5f5", color: "#666" };
          return (
            <div key={item._id} style={{
              breakInside: "avoid",
              marginBottom: 16,
              background: "#fff",
              border: "1px solid #ebebeb",
              borderRadius: 12,
              padding: "16px",
              cursor: "default",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}>
              {/* Header: badge + kebab */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                  background: tag.bg,
                  color: tag.color,
                  borderRadius: 4,
                  padding: "3px 8px",
                }}>
                  {typeLabel[item.type] ?? "Clip"}
                </span>

                <div className="kebab-container" style={{ position: "relative" }}>
                  <button 
                    onClick={() => setOpenMenuId(openMenuId === item._id ? null : item._id)}
                    style={{ background: "none", border: "none", padding: 4, cursor: "pointer", color: "#bbb" }}
                  >
                    <KebabIcon />
                  </button>
                  {openMenuId === item._id && (
                    <div style={{ position: "absolute", right: 0, bottom: "100%", background: "#fff", border: "1px solid #e0e0e0", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 10, minWidth: 100, marginBottom: 4 }}>
                      <button 
                        onClick={() => handleDelete(item._id)}
                        style={{ display: "block", width: "100%", padding: "10px 16px", border: "none", background: "none", textAlign: "left", cursor: "pointer", fontSize: 13, color: "#dc2626" }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              {item.type === "image" && item.imageData ? (
                <img 
                  src={item.imageData} 
                  alt="Screenshot"
                  onClick={() => setSelectedImage(item.imageData)}
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    maxHeight: 180,
                    objectFit: "cover",
                    cursor: "pointer",
                    display: "block",
                  }}
                />
              ) : item.type === "link" ? (
                <a href={item.content} target="_blank" rel="noreferrer" style={{
                  display: "block",
                  fontSize: 15,
                  color: "#2563eb",
                  wordBreak: "break-all",
                  lineHeight: 1.6,
                  textDecoration: "none",
                }}>
                  {item.content}
                </a>
              ) : (
                <p style={{
                  fontSize: 15,
                  color: "#1a1a1a",
                  lineHeight: 1.7,
                  wordBreak: "break-word",
                  margin: 0,
                  display: "-webkit-box",
                  WebkitLineClamp: 6,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}>
                  {item.content}
                </p>
              )}

              {/* Source URL (only for non-link types) */}
              {item.url && item.type !== "link" && (
                <a href={item.url} target="_blank" rel="noreferrer" style={{
                  display: "block",
                  marginTop: 10,
                  fontSize: 11,
                  color: "#aaa",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textDecoration: "none",
                }}>
                  🔗 {item.url}
                </a>
              )}

              {/* Timestamp */}
              <p style={{ marginTop: 12, fontSize: 12, color: "#ccc", borderTop: "1px solid #f5f5f5", paddingTop: 10, margin: "12px 0 0" }}>
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
