"use client";
import { useQuery, useMutation } from "convex/react";
import { useState, useEffect, useRef, useCallback } from "react";
import debounce from "lodash/debounce";
import { api } from "../../../../convex/_generated/api";
import KebabIcon from "./KebabIcon.jsx";
import ImageModal from "./ImageModal.jsx";
import KebabMenu from "./KebabMenu.jsx";
import { useAuth } from "@/hooks/useAuth";
import { getValidAccessToken } from "@/lib/auth";

const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

const typeLabel = { text: "Text", link: "Link", image: "Image" };
const typeBadge = {
  text:  { bg: "#000",     color: "#fff" },
  link:  { bg: "#38d091",  color: "#fff" },
  image: { bg: "#6366f1",  color: "#fff" },
};

export default function ItemCard({ activeType, searchQuery = "", onCountChange }) {
  const { user } = useAuth();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [hoveredUrl, setHoveredUrl] = useState(null);
  const [selectedText, setSelectedText] = useState(null);
  const [copied, setCopied] = useState(false);
  const [semanticResults, setSemanticResults] = useState(null); // null = not searching
  const [searchLoading, setSearchLoading] = useState(false);
  const kebabRefs = useRef({});
  const items = useQuery(api.items.getItems, user ? { userId: user._id } : "skip");
  const deleteItem = useMutation(api.items.deleteItem);

  useEffect(() => {
    if (items && onCountChange) onCountChange(items.length);
  }, [items?.length]);

  const runSearch = useCallback(
    debounce(async (query, currentUser) => {
      if (!query.trim() || !currentUser) {
        setSemanticResults(null);
        return;
      }
      setSearchLoading(true);
      try {
        const accessToken = await getValidAccessToken();
        if (!accessToken) return;

        const res = await fetch(`${CONVEX_SITE_URL}/clips/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ query: query.trim() }),
        });

        if (!res.ok) throw new Error("Search failed");
        const results = await res.json();
        setSemanticResults(results);
      } catch {
        setSemanticResults(null);
      } finally {
        setSearchLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (!searchQuery.trim() || !user) {
      runSearch.cancel();
      setSemanticResults(null);
      return;
    }
    runSearch(searchQuery, user);
    return () => runSearch.cancel();
  }, [searchQuery, user]);

  const baseItems = searchQuery.trim() && semanticResults !== null ? semanticResults : items;

  const filteredItems = baseItems
    ?.filter((item) => activeType === "all" || item.type === activeType)
    ?.filter((item) => {
      if (searchQuery.trim() && semanticResults !== null) return true; 
      return !searchQuery || item.content?.toLowerCase().includes(searchQuery.toLowerCase());
    });

  const handleDelete = (id) => { deleteItem({ id }); setOpenMenuId(null); };

  return (
    <div style={{ padding: "48px 56px", background: "#fff", minHeight: "calc(100vh - 80px)", fontFamily: "var(--font-sans), 'Plus Jakarta Sans', sans-serif" }}>

      {/* Search mode indicator */}
      {searchQuery.trim() && (
        <div style={{ marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
          {searchLoading ? (
            <span style={{ fontSize: 13, color: "#999" }}>Searching...</span>
          ) : semanticResults !== null ? (
            <>
              <span style={{ fontSize: 11, fontWeight: 700, background: "#38d091", color: "#fff", padding: "3px 8px", borderRadius: 4, letterSpacing: "0.4px" }}>SEMANTIC</span>
              <span style={{ fontSize: 13, color: "#999" }}>{filteredItems?.length ?? 0} result{filteredItems?.length !== 1 ? "s" : ""} for "{searchQuery}"</span>
            </>
          ) : (
            <span style={{ fontSize: 13, color: "#999" }}>{filteredItems?.length ?? 0} result{filteredItems?.length !== 1 ? "s" : ""}</span>
          )}
        </div>
      )}

      {!items && (
        <p style={{ color: "#999", fontSize: 14, marginTop: 60, textAlign: "center" }}>Loading...</p>
      )}

      {items?.length === 0 && (
        <div style={{ textAlign: "center", marginTop: 80 }}>
          <div style={{ width: 64, height: 64, background: "#f4f4f5", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <line x1="9" y1="12" x2="15" y2="12"/>
              <line x1="9" y1="16" x2="13" y2="16"/>
            </svg>
          </div>
          <p style={{ color: "#000", fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No clips saved yet</p>
          <p style={{ color: "#999", fontSize: 14, fontWeight: 400 }}>Copy text or press S twice to capture a screenshot</p>
        </div>
      )}

      {searchQuery.trim() && !searchLoading && filteredItems?.length === 0 && items?.length > 0 && (
        <div style={{ textAlign: "center", marginTop: 60 }}>
          <p style={{ color: "#000", fontSize: 15, fontWeight: 700, marginBottom: 8 }}>No results found</p>
          <p style={{ color: "#999", fontSize: 13 }}>Try different keywords or clear the search</p>
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
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#38d091"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(16, 185, 129, 0.08)"; }}
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
              {item.type === "image" && (item.imageUrl || item.imageData) ? (
                <img src={item.imageUrl || item.imageData} alt="Screenshot" onClick={() => setSelectedImage(item.imageUrl || item.imageData)}
                  style={{ width: "100%", borderRadius: 8, maxHeight: 200, objectFit: "cover", cursor: "pointer", display: "block" }} />
              ) : item.type === "link" ? (
                <a href={item.content} target="_blank" rel="noreferrer"
                  style={{ display: "block", fontSize: 13, color: "#38d091", wordBreak: "break-all", lineHeight: 1.6, textDecoration: "none", fontWeight: 500 }}
                  onMouseEnter={(e) => { e.target.style.textDecoration = "underline"; }}
                  onMouseLeave={(e) => { e.target.style.textDecoration = "none"; }}>
                  {item.content}
                </a>
              ) : (
                <>
                  <p style={{ fontSize: 13, color: "#000", lineHeight: 1.6, wordBreak: "break-word", margin: 0, whiteSpace: "pre-wrap", fontWeight: 400, display: "-webkit-box", WebkitLineClamp: 6, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {item.content}
                  </p>
                  {(item.content?.split("\n").length > 6 || item.content?.length > 300) && (
                    <button
                      onClick={() => setSelectedText(item.content)}
                      style={{ marginTop: 8, background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#38d091", fontWeight: 600, padding: 0, fontFamily: "inherit" }}>
                      Show more ↗
                    </button>
                  )}
                </>
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
      {selectedText && (
        <div onClick={() => { setSelectedText(null); setCopied(false); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 680, maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 8px 40px rgba(0,0,0,0.2)", fontFamily: "var(--font-sans), 'Plus Jakarta Sans', sans-serif" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderBottom: "1px solid #f0f0f0" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#000" }}>Full content</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{ fontSize: 12, fontWeight: 600, color: copied ? "#fff" : "#38d091", background: copied ? "#38d091" : "none", border: "1px solid #38d091", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
                  {copied ? "Copied ✓" : "Copy"}
                </button>
                <button onClick={() => { setSelectedText(null); setCopied(false); }}
                  style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#aaa", lineHeight: 1, padding: "0 4px" }}>
                  ×
                </button>
              </div>
            </div>
            {/* Content */}
            <pre style={{ margin: 0, padding: "24px", overflowY: "auto", fontSize: 13, lineHeight: 1.7, color: "#000", whiteSpace: "pre-wrap", wordBreak: "break-word", fontFamily: "inherit" }}>
              {selectedText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
