import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
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
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      select: { id: true, userId: true, expiresAt: true, usedAt: true },
    });

    if (!resetToken) {
      return NextResponse.json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    if (resetToken.usedAt !== null) {
      return NextResponse.json({ error: "This reset link has already been used" }, { status: 400 });
    }

    if (Date.now() > Number(resetToken.expiresAt)) {
      return NextResponse.json({ error: "This reset link has expired. Please request a new one." }, { status: 400 });
    }

    const passwordHash = await hashPassword(newPassword);

    // Update password, mark token as used, and revoke all active sessions
    await prisma.user.update({
      where: { id: resetToken.userId },
      data:  { passwordHash },
    });

    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data:  { usedAt: new Date() },
    });

    await prisma.session.deleteMany({
      where: { userId: resetToken.userId },
    });

    return NextResponse.json({ ok: true, message: "Password updated. Please sign in with your new password." });
  } catch (e) {
    console.error("[reset-password]", e);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
