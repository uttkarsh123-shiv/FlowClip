import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateToken, validateEmail } from "@/lib/auth-helpers";

const RESET_TOKEN_TTL = 60 * 60 * 1000; // 1 hour

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true },
    });

    if (user) {
      // Delete any existing unused tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
      });

      const token     = generateToken();
      const expiresAt = Date.now() + RESET_TOKEN_TTL;

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: BigInt(expiresAt),
        },
      });

      const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
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
