const CONVEX_SITE_URL = "https://fantastic-condor-84.eu-west-1.convex.site";

let pendingCapture = null;
let pendingScreenshot = null;

// Listen for copy events from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Health check from web dashboard — responds with login status
  if (message.type === "PING") {
    chrome.storage.local.get(["accessToken", "accessTokenExpiresAt"], (data) => {
      const loggedIn = !!(data.accessToken && Date.now() < data.accessTokenExpiresAt - 30000);
      sendResponse({ status: "ok", loggedIn });
    });
    return true; // keep channel open for async response
  }
  if (message.type === "COPY_DETECTED") {
    pendingCapture = {
      content: message.payload.content,
      url: message.payload.url,
      tabId: sender.tab.id
    };
    
    // Show confirmation popup in the page
    chrome.tabs.sendMessage(sender.tab.id, {
      type: "SHOW_CONFIRMATION",
      payload: message.payload
    });
    
    sendResponse({ status: "ok" });
  }
  
  // Handle screenshot capture
  if (message.type === "CAPTURE_SCREENSHOT") {
    const tabUrl = message.payload.url || "";
    if (tabUrl.startsWith("chrome://") || tabUrl.startsWith("chrome-extension://") || tabUrl.startsWith("edge://")) {
      return;
    }
    // Use the sender tab's windowId to capture the correct window
    const windowId = sender.tab?.windowId;
    chrome.tabs.captureVisibleTab(windowId, { format: "jpeg", quality: 60 }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.error("Screenshot failed:", chrome.runtime.lastError.message);
        return;
      }
      if (!dataUrl) return;
      pendingScreenshot = {
        imageData: dataUrl,
        url: message.payload.url,
        tabId: sender.tab.id
      };
      chrome.tabs.sendMessage(sender.tab.id, {
        type: "SHOW_SCREENSHOT_CONFIRMATION",
        payload: { imageData: dataUrl, url: message.payload.url }
      });
    });
    return true;
  }
  
  // User clicked Save on screenshot
  if (message.type === "SAVE_SCREENSHOT_CONFIRMED" && pendingScreenshot) {
    saveScreenshotToConvex(pendingScreenshot);
    pendingScreenshot = null;
    sendResponse({ status: "saved" });
  }
  
  // User clicked Save
  if (message.type === "SAVE_CONFIRMED" && pendingCapture) {
    saveToConvex(pendingCapture);
    pendingCapture = null;
    sendResponse({ status: "saved" });
  }
  
  // User clicked Ignore
  if (message.type === "IGNORE_CONFIRMED") {
    pendingCapture = null;
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

      // Refresh
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
    await fetch(`${CONVEX_SITE_URL}/clips`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${accessToken}` },
      body: JSON.stringify({
        type: "image",
        content: "Screenshot captured",
        url: data.url,
        imageData: data.imageData,
      }),
    });
  } catch (e) {
    console.error("Failed to save screenshot", e);
  }
}
