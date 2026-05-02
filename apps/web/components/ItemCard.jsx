"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const typeLabel = { text: "Text", link: "Link", image: "Image" };
const typeColor = {
  text:  { bg: "#f0f4ff", color: "#3b5bdb" },
  link:  { bg: "#f0fdf4", color: "#2f9e44" },
  image: { bg: "#fff4e6", color: "#e8590c" },
};

export default function ItemCard({activeType}) {
  const items = useQuery(api.items.getItems, {});

  const filteredItems = 
  activeType === "all" 
  ? items 
  : items?.filter((item) => item.type === activeType);
  return (
    <div style={{
      padding: "24px 28px",
      background: "#fafafa",
      minHeight: "calc(100vh - 64px)",
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
              border: "1px solid #e8e8e8",
              borderRadius: 10,
              padding: "18px 20px",
              cursor: "default",
            }}>
              {/* Type badge */}
              <span style={{
                display: "inline-block",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                background: tag.bg,
                color: tag.color,
                borderRadius: 4,
                padding: "3px 9px",
                marginBottom: 12,
              }}>
                {typeLabel[item.type] ?? "Clip"}
              </span>

              {/* Content */}
              <p style={{
                fontSize: 15,
                color: "#1a1a1a",
                lineHeight: 1.7,
                wordBreak: "break-word",
                margin: 0,
              }}>
                {item.content}
              </p>

              {/* Source URL */}
              {item.url && (
                <a href={item.url} target="_blank" rel="noreferrer" style={{
                  display: "block",
                  marginTop: 12,
                  fontSize: 12,
                  color: "#888",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textDecoration: "none",
                }}>
                  🔗 {item.url}
                </a>
              )}

              {/* Timestamp */}
              <p style={{
                marginTop: 12,
                fontSize: 12,
                color: "#bbb",
                borderTop: "1px solid #f0f0f0",
                paddingTop: 10,
              }}>
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
