// Shared middleware for Next.js API routes
import { sql } from "@/lib/db";

// Validates Bearer token and returns userId
// Returns null if token is missing, invalid, or expired
export async function getUserIdFromRequest(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const accessToken = authHeader.slice(7);

  const [session] = await sql`
    SELECT user_id
    FROM sessions
    WHERE access_token = ${accessToken}
      AND access_token_expires_at > ${Date.now()}
    LIMIT 1
  `;

  return session?.user_id ?? null;
}
