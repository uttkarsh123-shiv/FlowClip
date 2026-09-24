import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(request) {
  try {
    // 1. Read access token from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = authHeader.slice(7);

    // 2. Find session + user in one JOIN query
    const [result] = await sql`
      SELECT u.id, u.email, u.name
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.access_token = ${accessToken}
        AND s.access_token_expires_at > ${Date.now()}
      LIMIT 1
    `;

    if (!result) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      _id:   result.id,
      email: result.email,
      name:  result.name,
    });
  } catch (e) {
    console.error("[me]", e);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
