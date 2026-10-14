import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // 3. Hash password
    const passwordHash = await hashPassword(password);

    // 4. Insert new user
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: name?.trim() || null,
      },
      select: { id: true },
    });

    // 5. Generate tokens
    const accessToken  = generateToken();
    const refreshToken = generateToken();
    const now          = Date.now();
    const accessTokenExpiresAt  = now + ACCESS_TOKEN_TTL;
    const refreshTokenExpiresAt = now + REFRESH_TOKEN_TTL;

    // 6. Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        accessToken,
        refreshToken,
        accessTokenExpiresAt:  BigInt(accessTokenExpiresAt),
        refreshTokenExpiresAt: BigInt(refreshTokenExpiresAt),
      },
    });

    // 7. Return access token + set refresh token as HTTP-only cookie
    const response = NextResponse.json({
      accessToken,
      accessTokenExpiresAt,
      refreshToken,
      refreshTokenExpiresAt,
      user: { _id: user.id, email: normalizedEmail, name: name?.trim() || null },
    });
    setRefreshTokenCookie(response, refreshToken, refreshTokenExpiresAt);

    return response;
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
