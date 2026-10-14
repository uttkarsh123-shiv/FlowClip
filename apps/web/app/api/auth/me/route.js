import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request) {
  try {
    // 1. Read access token from Authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = authHeader.slice(7);

    // 2. Find session + user in one query using relation
    const session = await prisma.session.findFirst({
      where: {
        accessToken,
        accessTokenExpiresAt: { gt: BigInt(Date.now()) },
      },
      select: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      _id:   session.user.id,
      email: session.user.email,
      name:  session.user.name,
    });
  } catch (e) {
    console.error("[me]", e);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
