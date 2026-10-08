import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { hashPassword, validatePassword } from "@/lib/auth-helpers";

export async function POST(request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    if (!validatePassword(newPassword)) {
      return NextResponse.json(
        { error: "Password must be 8-128 characters" },
        { status: 400 }
      );
    }

    // Look up token — must be unused and not expired
    const [resetToken] = await sql`
      SELECT id, user_id, expires_at, used_at
      FROM password_reset_tokens
      WHERE token = ${token}
      LIMIT 1
    `;

    if (!resetToken) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    if (resetToken.used_at !== null) {
      return NextResponse.json({ error: "This reset link has already been used" }, { status: 400 });
    }

    if (Date.now() > resetToken.expires_at) {
      return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);

    // Update password, mark token as used, and revoke all active sessions atomically
    await sql`UPDATE users SET password_hash = ${passwordHash} WHERE id = ${resetToken.user_id}`;
    await sql`UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ${resetToken.id}`;
    await sql`DELETE FROM sessions WHERE user_id = ${resetToken.user_id}`;

    return NextResponse.json({ ok: true, message: "Password updated. Please sign in with your new password." });
  } catch (e) {
    console.error("[reset-password]", e);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
