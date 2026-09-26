import { NextResponse } from "next/server";
import { embeddingCache, semanticCache, resultCache } from "@/lib/cache";

// Internal-only route for benchmark tooling
// Flushes all search caches so benchmark can measure a true cold path
// NOT exposed in production — guarded by ADMIN_SECRET
export async function POST(request) {
  const auth = request.headers.get("authorization") || "";
  if (auth.replace("Bearer ", "").trim() !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const before = {
    embedding: embeddingCache.stats(),
    semantic:  semanticCache.stats(),
    result:    resultCache.stats(),
  };

  embeddingCache.map.clear();
  semanticCache.map.clear();
  resultCache.map.clear();

  return NextResponse.json({
    ok: true,
    flushed: before,
    after: {
      embedding: embeddingCache.stats(),
      semantic:  semanticCache.stats(),
      result:    resultCache.stats(),
    },
  });
}
