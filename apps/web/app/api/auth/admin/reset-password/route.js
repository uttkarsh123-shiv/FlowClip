import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword, validatePassword } from "@/lib/auth-helpers";

export async function POST(request) {
  try {
    // Verify admin secret
    const authHeader = request.headers.get("authorization") || "";
    const secret = authHeader.replace("Bearer ", "").trim();

    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, newPassword } = await request.json();

    if (!email || !validatePassword(newPassword)) {
      return NextResponse.json(
        { error: "Valid email and password (8-128 chars) required" },
        { status: 400 }
      );
    }

    const [user] = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1
    `;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const passwordHash = await hashPassword(newPassword);

    // Update password + invalidate all sessions
    await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${user.id}`;
    await sql`DELETE FROM sessions WHERE user_id = ${user.id}`;

    return NextResponse.json({ ok: true, message: "Password reset. All sessions revoked." });
  } catch (e) {
    console.error("[admin/reset-password]", e);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
