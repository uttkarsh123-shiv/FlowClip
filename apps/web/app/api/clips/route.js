import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/api-middleware";
import { sanitizeText, sanitizeUrl } from "@/lib/sanitize";
import { getEmbedding } from "@/lib/embeddings";
import { emitNewClip } from "@/lib/event-bus";

// ─── GET /api/clips ───────────────────────────────────────────────────────────
// Cursor-based pagination — returns 20 clips at a time
// Query params: ?cursor=<timestamp>&pageSize=<n>
export async function GET(request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") ?? "20"), 50);
    const cursor   = searchParams.get("cursor"); // ISO timestamp of last item

    // Cursor-based pagination using created_at
    // Fetches clips older than the cur*+sor — compound index on (user_id, created_at)
    const clips = cursor
      ? await sql`
          SELECT id, type, content, url, image_url, created_at
          FROM items
          WHERE user_id = ${userId}
            AND created_at < ${new Date(cursor)}
          ORDER BY created_at DESC
          LIMIT ${pageSize + 1}
        `
      : await sql`
          SELECT id, type, content, url, image_url, created_at
          FROM items
          WHERE user_id = ${userId}
          ORDER BY created_at DESC
          LIMIT ${pageSize + 1}
        `;

    // Fetch one extra to determine if there's a next page
    const hasMore     = clips.length > pageSize;
    const page        = hasMore ? clips.slice(0, pageSize) : clips;
    const nextCursor  = hasMore ? page[page.length - 1].created_at.toISOString() : null;

    return NextResponse.json({
      clips: page,
      nextCursor,   // pass this back as ?cursor= for next page
      hasMore,
    });
  } catch (e) {
    console.error("[GET /api/clips]", e);
    return NextResponse.json({ error: "Failed to fetch clips" }, { status: 500 });
  }
}

// ─── POST /api/clips ──────────────────────────────────────────────────────────
// Create a new clip
export async function POST(request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, content, url, imageUrl } = body;

    // Validate type
    if (!["text", "link", "image"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedContent = sanitizeText(content);
    const sanitizedUrl     = url ? sanitizeUrl(url) : null;

    if (!sanitizedContent) {
      return NextResponse.json({ error: "Content cannot be empty" }, { status: 400 });
    }

    // Auto-detect type if not image
    const resolvedType = type === "image"
      ? "image"
      : /^https?:\/\//i.test(sanitizedContent) ? "link" : "text";

    const [clip] = await sql`
      INSERT INTO items (user_id, type, content, url, image_url)
      VALUES (${userId}, ${resolvedType}, ${sanitizedContent}, ${sanitizedUrl}, ${imageUrl ?? null})
      RETURNING id, type, content, url, image_url, created_at
    `;

    // Generate embedding for text/link clips asynchronously
    // Don't block the response — fire and forget
    if (resolvedType !== "image") {
      getEmbedding(sanitizedContent)
        .then((embedding) => sql`
          UPDATE items
          SET embedding = ${JSON.stringify(embedding)}
          WHERE id = ${clip.id}
        `)
        .catch((e) => console.error("[embedding generation failed]", e));
    }

    // Notify all connected SSE clients for this user
    emitNewClip(userId, clip);

    return NextResponse.json(clip, { status: 201 });
  } catch (e) {
    console.error("[POST /api/clips]", e);
    return NextResponse.json({ error: "Failed to create clip" }, { status: 500 });
  }
}
