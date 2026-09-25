import { eventBus } from "@/lib/event-bus";

// ─── GET /api/clips/stream ────────────────────────────────────────────────────
// SSE endpoint — pushes new clip events to dashboard in real-time
// Works on EC2/persistent server where all routes share the same process

export async function GET(request) {
  // EventSource doesn't support headers — token passed as query param
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Validate token against DB
  const { sql } = await import("@/lib/db");
  const [session] = await sql`
    SELECT user_id FROM sessions
    WHERE access_token = ${token}
      AND access_token_expires_at > ${Date.now()}
    LIMIT 1
  `;

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user_id;

  let cleanup;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Helper to send SSE formatted event
      function send(event, data) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      // Send initial connection confirmation
      send("connected", { userId, timestamp: Date.now() });

      // Listen for new clips for this specific user
      function onNewClip(clip) {
        send("new_clip", clip);
      }

      eventBus.on(`clips:${userId}`, onNewClip);

      // Keep-alive ping every 30 seconds
      // Prevents proxy/load balancer from closing idle connections
      const keepAlive = setInterval(() => {
        try {
          send("ping", { timestamp: Date.now() });
        } catch {
          clearInterval(keepAlive);
        }
      }, 30000);

      // Cleanup when client disconnects
      cleanup = () => {
        clearInterval(keepAlive);
        eventBus.off(`clips:${userId}`, onNewClip);
        try { controller.close(); } catch {}
      };

      // Detect client disconnect via AbortSignal
      request.signal.addEventListener("abort", cleanup);
    },

    cancel() {
      if (cleanup) cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":                "text/event-stream",
      "Cache-Control":               "no-cache, no-transform",
      "Connection":                  "keep-alive",
      "X-Accel-Buffering":           "no", // disables Nginx buffering on EC2
      "Access-Control-Allow-Origin": "*",
    },
  });
}
