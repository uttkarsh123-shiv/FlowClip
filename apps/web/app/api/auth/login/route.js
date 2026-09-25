import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  verifyPassword,
  generateToken,
  validateEmail,
  validatePassword,
  setRefreshTokenCookie,
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL,
} from "@/lib/auth-helpers";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // 1. Validate inputs
    if (!validateEmail(email) || !validatePassword(password)) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Find user by email
    // Raw SQL — indexed lookup on users.email
    const [user] = await sql`
      SELECT id, email, password_hash, name
      FROM users
      WHERE email = ${normalizedEmail}
      LIMIT 1
    `;

    // 3. Verify password — same error message whether user exists or not
    //    prevents user enumeration attacks
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 4. Generate new tokens
    const accessToken  = generateToken();
    const refreshToken = generateToken();
    const now          = Date.now();
    const accessTokenExpiresAt  = now + ACCESS_TOKEN_TTL;
    const refreshTokenExpiresAt = now + REFRESH_TOKEN_TTL;

    // 5. Clean up old sessions for this user, then create new one
    // Prevents unbounded session accumulation per user
    await sql`
      DELETE FROM sessions
      WHERE user_id = ${user.id}
      AND refresh_token_expires_at < ${Date.now()}
    `;

    // Create new session
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

    // Return access token + set refresh token as HTTP-only cookie
    // Also include refreshToken in response body for extension (can't read cookies)
    const response = NextResponse.json({
      accessToken,
      accessTokenExpiresAt,
      refreshToken,          // extension stores this in chrome.storage
      refreshTokenExpiresAt,
    });
    setRefreshTokenCookie(response, refreshToken, refreshTokenExpiresAt);

    return response;
  } catch (e) {
    console.error("[login]", e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
