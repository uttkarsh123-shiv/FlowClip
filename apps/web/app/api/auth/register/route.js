import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  hashPassword,
  generateToken,
  validateEmail,
  validatePassword,
  setRefreshTokenCookie,
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
} from "@/lib/auth-helpers";

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    // 1. Validate inputs
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }
    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: "Password must be 8-128 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if email already exists
    // Raw SQL — SELECT with WHERE clause
    const existing = await sql`
      SELECT id FROM users
      WHERE email = ${normalizedEmail}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // 3. Hash password
    const passwordHash = await hashPassword(password);

    // 4. Insert new user
    // RETURNING gives us back the inserted row
    const [user] = await sql`
      INSERT INTO users (email, password_hash, name)
      VALUES (${normalizedEmail}, ${passwordHash}, ${name?.trim() || null})
      RETURNING id
    `;

    // 5. Generate tokens
    const accessToken  = generateToken();
    const refreshToken = generateToken();
    const now          = Date.now();
    const accessTokenExpiresAt  = now + ACCESS_TOKEN_TTL;
    const refreshTokenExpiresAt = now + REFRESH_TOKEN_TTL;

    // 6. Create session
    await sql`
      INSERT INTO sessions (
        user_id,
        access_token,
        refresh_token,
        access_token_expires_at,
        refresh_token_expires_at
      ) VALUES (
        ${user.id},
        ${accessToken},
        ${refreshToken},
        ${accessTokenExpiresAt},
        ${refreshTokenExpiresAt}
      )
    `;

    // 7. Return access token + set refresh token as HTTP-only cookie
    const response = NextResponse.json({
      accessToken,
      accessTokenExpiresAt,
    });
    setRefreshTokenCookie(response, refreshToken, refreshTokenExpiresAt);

    return response;
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
