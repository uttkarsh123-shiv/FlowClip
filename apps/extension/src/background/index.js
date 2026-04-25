const CONVEX_SITE_URL = "https://fantastic-condor-84.eu-west-1.convex.site";

let pendingCapture = null;

// Listen for copy events from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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

async function saveToConvex(data) {
  try {
    await fetch(`${CONVEX_SITE_URL}/clips`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: data.content, url: data.url }),
    });
    console.log("Saved to Convex");
  } catch (e) {
    console.error("Failed to save", e);
  }
}
