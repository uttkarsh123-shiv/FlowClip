import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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

    // 2. Find user by email — indexed lookup
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, passwordHash: true, name: true },
    });

    // 3. Verify password — same error whether user exists or not (prevents enumeration)
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
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

    // 5. Clean up expired sessions for this user, then create new one
    await prisma.session.deleteMany({
      where: {
        userId: user.id,
        refreshTokenExpiresAt: { lt: BigInt(Date.now()) },
      },
    });

    await prisma.session.create({
      data: {
        userId: user.id,
        accessToken,
        refreshToken,
        accessTokenExpiresAt:  BigInt(accessTokenExpiresAt),
        refreshTokenExpiresAt: BigInt(refreshTokenExpiresAt),
      },
    });

    const response = NextResponse.json({
      accessToken,
      accessTokenExpiresAt,
      refreshToken,
      refreshTokenExpiresAt,
      user: { _id: user.id, email: user.email, name: user.name },
    });
    setRefreshTokenCookie(response, refreshToken, refreshTokenExpiresAt);

    return response;
  } catch (e) {
    console.error("[login]", e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
