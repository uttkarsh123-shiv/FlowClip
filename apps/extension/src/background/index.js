// Convex URLs per environment
const CONVEX_URLS = {
  dev:  "https://fantastic-condor-84.eu-west-1.convex.site",  // local Next.js
  prod: "https://polished-peccary-13.convex.site",            // deployed Next.js (EC2 / Vercel)
};

// Map dashboard origins → which Convex deployment they use
const ORIGIN_ENV_MAP = {
  "http://localhost:3000":            "dev",
  "https://flow-clip-web.vercel.app": "prod",
};

const ALLOWED_DASHBOARD_ORIGINS = Object.keys(ORIGIN_ENV_MAP);

function getConvexUrl(origin) {
  const env = ORIGIN_ENV_MAP[origin] ?? "prod";
  return CONVEX_URLS[env];
}

// Default CONVEX_SITE_URL used by background-initiated saves (copy/screenshot).
// Background saves are not triggered by a dashboard origin, so we read the last
// known env from storage (set whenever the dashboard PINGs us).
let CONVEX_SITE_URL = CONVEX_URLS.prod;

chrome.storage.local.get(["activeEnv"], (data) => {
  CONVEX_SITE_URL = CONVEX_URLS[data.activeEnv ?? "prod"];
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PING") {
    const senderOrigin = sender.origin || sender.url?.split("/").slice(0, 3).join("/");
    if (!ALLOWED_DASHBOARD_ORIGINS.includes(senderOrigin)) return;

    chrome.storage.local.get(["accessToken", "accessTokenExpiresAt"], (data) => {
      const loggedIn = !!(data.accessToken && Date.now() < data.accessTokenExpiresAt - 30000);
      // Remember which env the dashboard is running in so background saves use the right URL
      const env = ORIGIN_ENV_MAP[senderOrigin] ?? "prod";
      chrome.storage.local.set({ activeEnv: env });
      CONVEX_SITE_URL = CONVEX_URLS[env];
      sendResponse({ status: "ok", loggedIn });
    });
    return true;
  }

  if (message.type === "COPY_DETECTED") {
    chrome.tabs.sendMessage(sender.tab.id, {
      type: "SHOW_CONFIRMATION",
      payload: message.payload
    });
    sendResponse({ status: "ok" });
  }

  if (message.type === "CAPTURE_SCREENSHOT") {
    const tabUrl = message.payload.url || "";
    if (tabUrl.startsWith("chrome://") || tabUrl.startsWith("chrome-extension://") || tabUrl.startsWith("edge://")) {
      return;
    }
    const windowId = sender.tab?.windowId;
    chrome.tabs.captureVisibleTab(windowId, { format: "jpeg", quality: 60 }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error("Screenshot failed:", chrome.runtime.lastError.message);
        return;
      }
      if (!dataUrl) return;
      chrome.tabs.sendMessage(sender.tab.id, {
        type: "SHOW_SCREENSHOT_CONFIRMATION",
        payload: { imageData: dataUrl, url: message.payload.url }
      });
    });
    return true;
  }

  if (message.type === "SAVE_SCREENSHOT_CONFIRMED") {
    saveScreenshotToConvex({
      imageData: message.payload.imageData,
      url: message.payload.url,
    });
    sendResponse({ status: "saved" });
  }

  if (message.type === "SAVE_CONFIRMED") {
    saveToConvex({
      content: message.payload.content,
      url: message.payload.url,
    });
    sendResponse({ status: "saved" });
  }

  if (message.type === "IGNORE_CONFIRMED") {
    sendResponse({ status: "ignored" });
  }

  return true;
});

async function getValidAccessToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["accessToken", "refreshToken", "accessTokenExpiresAt"], async (data) => {
      const { accessToken, refreshToken, accessTokenExpiresAt } = data;
      if (!refreshToken) { resolve(null); return; }

      if (accessToken && Date.now() < accessTokenExpiresAt - 30000) {
        resolve(accessToken);
        return;
      }

      try {
        const res = await fetch(`${CONVEX_SITE_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) { chrome.storage.local.clear(); resolve(null); return; }
        const newData = await res.json();
        chrome.storage.local.set({ accessToken: newData.accessToken, accessTokenExpiresAt: newData.accessTokenExpiresAt });
        resolve(newData.accessToken);
      } catch {
        resolve(null);
      }
    });
  });
}

async function saveToConvex(data) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) return;
  try {
    await fetch(`${CONVEX_SITE_URL}/clips`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
      body: JSON.stringify({ content: data.content, url: data.url }),
    });
  } catch (e) {
    console.error("Failed to save", e);
  }
}

async function saveScreenshotToConvex(data) {
  const accessToken = await getValidAccessToken();
  if (!accessToken) return;
  try {
    const urlRes = await fetch(`${CONVEX_SITE_URL}/storage/generate-upload-url`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${accessToken}` },
    });
    if (!urlRes.ok) throw new Error("Failed to get upload URL");
    const { uploadUrl } = await urlRes.json();

    const blob = dataUrlToBlob(data.imageData);
    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": blob.type },
      body: blob,
    });
    if (!uploadRes.ok) throw new Error("Failed to upload image");
    const { storageId } = await uploadRes.json();

    await fetch(`${CONVEX_SITE_URL}/clips`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
      body: JSON.stringify({
        type: "image",
        content: "Screenshot captured",
        url: data.url,
        imageStorageId: storageId,
      }),
    });
  } catch (e) {
    console.error("Failed to save screenshot", e);
  }
}

function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}
