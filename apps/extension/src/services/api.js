// Convex API calls
const CONVEX_URL = "https://your-convex-url.convex.cloud";

export async function saveClip(text) {
  const res = await fetch(`${CONVEX_URL}/api/clips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return res.json();
}

export async function getClips() {
  const res = await fetch(`${CONVEX_URL}/api/clips`);
  return res.json();
}
