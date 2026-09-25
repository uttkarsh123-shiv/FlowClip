const APP_URLS = {
  dev:  "http://localhost:3000",
  prod: "https://flow-clip-web.vercel.app",
};

const ALLOWED_DASHBOARD_ORIGINS = Object.values(APP_URLS);

function getAppUrl(origin) {
  if (origin === APP_URLS.dev) return APP_URLS.dev;
  return APP_URLS.prod;
}

// Default to prod — updated when dashboard PINGs the extension
let APP_URL = APP_URLS.prod;

chrome.storage.local.get(["activeEnv"], (data) => {
  APP_URL = APP_URLS[data.activeEnv ?? "prod"];
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.type === "PING") {
    const senderOrigin = sender.origin || sender.url?.split("/").slice(0, 3).join("/");
    if (!ALLOWED_DASHBOARD_ORIGINS.includes(senderOrigin)) return;

    chrome.storage.local.get(["accessToken", "accessTokenExpiresAt"], (data) => {
      const loggedIn = !!(data.accessToken && Date.now() < data.accessTokenExpiresAt - 30000);
      const env = senderOrigin === APP_URLS.dev ? "dev" : "prod";
      chrome.storage.local.set({ activeEnv: env });
      APP_URL = APP_URLS[env];
      sendResponse({ status: "ok", loggedIn });
    });
    return true;
  }

  if (message.type === "CAPTURE_SCREENSHOT") {
    const tabUrl = message.payload.url || "";
    if (tabUrl.startsWith("chrome://") || tabUrl.startsWith("chrome-extension://") || tabUrl.startsWith("edge://")) return;

    const windowId = sender.tab?.windowId;
    chrome.tabs.captureVisibleTab(windowId, { format: "jpeg", quality: 60 }, (dataUrl) => {
      if (chrome.runtime.lastError || !dataUrl) return;
      chrome.tabs.sendMessage(sender.tab.id, {
        type: "SHOW_SCREENSHOT_CONFIRMATION",
        payload: { imageData: dataUrl, url: message.payload.url },
      });
    });
    return true;
  }

  if (message.type === "SAVE_CONFIRMED") {
    saveClip({ content: message.payload.content, url: message.payload.url });
    sendResponse({ status: "saved" });
  }

  if (message.type === "SAVE_SCREENSHOT_CONFIRMED") {
    saveScreenshot({ imageData: message.payload.imageData, url: message.payload.url });
    sendResponse({ status: "saved" });
  }

  return true;
});

// ─── Token management ─────────────────────────────────────────────────────────
async function getValidAccessToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["accessToken", "refreshToken", "accessTokenExpiresAt"], async (data) => {
      const { accessToken, refreshToken, accessTokenExpiresAt } = data;
      if (!refreshToken) { resolve(null); return; }

      // Token still valid
      if (accessToken && Date.now() < accessTokenExpiresAt - 30000) {
        resolve(accessToken);
        return;
      }

      // Token expired — refresh via Next.js API route
      // Extension can't use HTTP-only cookies directly
      // So we store refresh token in chrome.storage and send it in body
      try {
        const res = await fetch(`${APP_URL}/api/auth/refresh-with-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) {
          chrome.storage.local.clear();
          resolve(null);
          return;
        }

        const newData = await res.json();
        chrome.storage.local.set({
          accessToken: newData.accessToken,
          accessTokenExpiresAt: newData.accessTokenExpiresAt,
        });
        resolve(newData.accessToken);
      } catch {
        resolve(null);
      }
    });
  });
}

// ─── Save text/link clip ──────────────────────────────────────────────────────
async function saveClip(data) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) return;

  try {
    const type = /^https?:\/\//i.test(data.content?.trim()) ? "link" : "text";
    await fetch(`${APP_URL}/api/clips`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ type, content: data.content, url: data.url }),
    });
  } catch (e) {
    console.error("[saveClip] failed:", e);
  }
}

// ─── Save screenshot ──────────────────────────────────────────────────────────
async function saveScreenshot(data) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) return;

  try {
    // 1. Get upload URL from Next.js storage route
    const urlRes = await fetch(`${APP_URL}/api/storage/upload-url`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${accessToken}` },
    });
    if (!urlRes.ok) throw new Error("Failed to get upload URL");
    const { uploadUrl, imageUrl } = await urlRes.json();

    // 2. Upload image blob
    const blob = dataUrlToBlob(data.imageData);
    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": blob.type },
      body: blob,
    });

    // 3. Save clip with image URL
    await fetch(`${APP_URL}/api/clips`, {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        type: "image",
        content: "Screenshot captured",
        url: data.url,
        imageUrl,
      }),
    });
  } catch (e) {
    console.error("[saveScreenshot] failed:", e);
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(",");
  const mime   = header.match(/:(.*?);/)[1];
  const binary = atob(base64);
  const bytes  = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
