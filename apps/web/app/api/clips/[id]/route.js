import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/api-middleware";

// ─── DELETE /api/clips/:id ────────────────────────────────────────────────────
export async function DELETE(request, { params }) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Delete only if the clip belongs to the requesting user
    // Prevents users from deleting other users' clips
    const [deleted] = await sql`
      DELETE FROM items
      WHERE id = ${id}
        AND user_id = ${userId}
      RETURNING id
    `;

    if (!deleted) {
      return NextResponse.json({ error: "Clip not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[DELETE /api/clips/:id]", e);
    return NextResponse.json({ error: "Failed to delete clip" }, { status: 500 });
  }
}
