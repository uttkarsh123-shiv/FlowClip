import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { generateToken, validateEmail } from "@/lib/auth-helpers";

const RESET_TOKEN_TTL = 60 * 60 * 1000; // 1 hour

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const [user] = await sql`
      SELECT id, name FROM users
      WHERE email = ${normalizedEmail}
      LIMIT 1
    `;

    if (user) {
      // Delete any existing unused tokens for this user
      await sql`
        DELETE FROM password_reset_tokens
        WHERE user_id = ${user.id}
        AND used_at IS NULL
      `;

      const token = generateToken();
      const expiresAt = Date.now() + RESET_TOKEN_TTL;

      await sql`
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES (${user.id}, ${token}, ${expiresAt})
      `;

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const resetUrl = `${appUrl}/reset-password?token=${token}`;

      // Log the reset link to server console — check your server logs to get the link
      console.log(`[forgot-password] Reset link for ${normalizedEmail}: ${resetUrl}`);
    }

    // Always return 200 to prevent user enumeration
    return NextResponse.json({
      ok: true,
      message: "If that email is registered you'll receive a reset link shortly.",
    });
  } catch (e) {
    console.error("[forgot-password]", e);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
