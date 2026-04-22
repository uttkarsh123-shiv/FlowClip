// Handles events from content script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "COPY_DETECTED") {
    console.log("Copied:", message.payload);
    // TODO: forward to Convex via api.js
    sendResponse({ status: "ok" });
  }
});
