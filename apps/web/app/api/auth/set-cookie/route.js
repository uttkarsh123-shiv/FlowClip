import { NextResponse } from "next/server";

export async function POST(req) {
  const { refreshToken, refreshTokenExpiresAt } = await req.json();

  const res = NextResponse.json({ ok: true });
  res.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    expires: new Date(refreshTokenExpiresAt),
  });

  return res;
}
