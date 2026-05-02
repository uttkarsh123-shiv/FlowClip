"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const typeIcon = { text: "📝", link: "🔗", image: "🖼️" };

const s = {
  page: {
    minHeight: "100vh",
    background: "#0f0f0f",
    color: "#f0f0f0",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: "32px 16px",
  },
  inner: { maxWidth: 640, margin: "0 auto" },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  title: { fontSize: 20, fontWeight: 600, letterSpacing: "-0.3px" },
  count: { fontSize: 12, color: "#555" },
  empty: { fontSize: 13, color: "#444", marginTop: 40, textAlign: "center" },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  card: {
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: 12,
    padding: "14px 16px",
    cursor: "default",
  },
  cardRow: { display: "flex", gap: 12, alignItems: "flex-start" },
  icon: { fontSize: 16, marginTop: 1, flexShrink: 0 },
  content: { fontSize: 13, color: "#e0e0e0", lineHeight: 1.6, wordBreak: "break-word" },
  sourceUrl: {
    fontSize: 11,
    color: "#555",
    marginTop: 4,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "block",
    maxWidth: 400,
  },
  time: { fontSize: 11, color: "#444", marginTop: 6 },
};

export default function ItemCard() {
  const items = useQuery(api.items.getItems, {});

  return (
    <div style={s.page}>
      <div style={s.inner}>
        <div style={s.header}>
          <span style={s.title}>FlowClip</span>
          <span style={s.count}>{items?.length ?? 0} items</span>
        </div>

        {!items && <p style={s.empty}>Loading...</p>}
        {items?.length === 0 && <p style={s.empty}>No clips yet. Start copying.</p>}

        <div style={s.list}>
          {items?.map((item) => (
            <div key={item._id} style={s.card}>
              <div style={s.cardRow}>
                <span style={s.icon}>{typeIcon[item.type] ?? "📋"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={s.content}>{item.content}</p>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer" style={s.sourceUrl}>
                      {item.url}
                    </a>
                  )}
                  <p style={s.time}>
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
