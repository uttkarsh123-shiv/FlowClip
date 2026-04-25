"use client";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const typeIcon = { text: "📝", link: "🔗", image: "🖼️" };

export default function Home() {
  const items = useQuery(api.items.getItems, {});

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white px-4 py-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold tracking-tight">FlowClip</h1>
        <span className="text-xs text-zinc-500">{items?.length ?? 0} items</span>
      </div>

      {!items && (
        <p className="text-zinc-600 text-sm">Loading...</p>
      )}

      {items?.length === 0 && (
        <p className="text-zinc-600 text-sm">No clips yet. Start copying.</p>
      )}

      <div className="flex flex-col gap-3">
        {items?.map((item) => (
          <div
            key={item._id}
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#3a3a3a] transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="text-base mt-0.5">{typeIcon[item.type] ?? "📋"}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-200 break-words leading-relaxed">
                  {item.content}
                </p>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-zinc-500 hover:text-zinc-300 truncate block mt-1"
                  >
                    {item.url}
                  </a>
                )}
                <p className="text-xs text-zinc-600 mt-2">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
