import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const CONVEX_SITE_URL = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken) return NextResponse.json({ error: "No refresh token" }, { status: 401 });

  const res = await fetch(`${CONVEX_SITE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await res.json();
  if (!res.ok) {
    const out = NextResponse.json({ error: data.error }, { status: 401 });
    out.cookies.set("refreshToken", "", { expires: new Date(0), path: "/" });
    return out;
  }

  return NextResponse.json(data);
}
