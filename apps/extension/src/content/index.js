// Track double S press for screenshot
let lastSPress = 0;
let lastCaptured = null;

// Safe message sender — guards against invalidated extension context
function sendMsg(payload) {
  if (!chrome?.runtime?.id) return;
  try {
    chrome.runtime.sendMessage(payload);
  } catch {
    // extension context invalidated — silently ignore
  }
}

// Block financial/crypto domains
const BLOCKED_HOSTNAMES = [
  "chase.com", "wellsfargo.com", "bankofamerica.com", "citibank.com",
  "barclays.co.uk", "hsbc.com", "lloydsbank.com", "santander.com",
  "capitalone.com", "usbank.com", "tdbank.com",
  "paypal.com", "stripe.com", "square.com", "venmo.com", "cash.app",
  "zelle.com", "wise.com", "revolut.com", "skrill.com",
  "coinbase.com", "binance.com", "kraken.com", "blockchain.com",
];

function isBlockedDomain(url) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return BLOCKED_HOSTNAMES.some((h) => hostname === h || hostname.endsWith("." + h));
  } catch {
    return false;
  }
}

// ── Screenshot ────────────────────────────────────────────────────────────────

function captureScreenshot() {
  if (isBlockedDomain(window.location.href)) return;
  sendMsg({ type: "CAPTURE_SCREENSHOT", payload: { url: window.location.href } });
}

function showScreenshotToast(imageData, sourceUrl) {
  const existing = document.getElementById("flowclip-screenshot-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "flowclip-screenshot-toast";
  toast.innerHTML = `
    <div style="
      position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
      background:#fff; border:1px solid #e5e5e5; border-radius:16px;
      padding:20px; font-family:'Plus Jakarta Sans',-apple-system,sans-serif;
      font-size:13px; z-index:999999; box-shadow:0 12px 48px rgba(0,0,0,0.15);
      width:360px;
    ">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;">
        <div style="width:24px;height:24px;background:#000;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:900;color:#fff;flex-shrink:0;">F</div>
        <span style="font-size:12px;font-weight:700;color:#38d091;text-transform:uppercase;letter-spacing:0.5px;">Screenshot captured</span>
      </div>
      <img src="${imageData}" style="width:100%;max-height:180px;object-fit:cover;border-radius:10px;margin-bottom:14px;border:1px solid #f0f0f0;display:block;" />
      <div style="display:flex;gap:8px;">
        <button id="flowclip-screenshot-save" style="flex:1;padding:10px;background:#38d091;color:#fff;border:none;border-radius:9px;cursor:pointer;font-size:13px;font-weight:700;font-family:inherit;">Save</button>
        <button id="flowclip-screenshot-ignore" style="flex:1;padding:10px;background:#f5f5f5;color:#666;border:none;border-radius:9px;cursor:pointer;font-size:13px;font-weight:600;font-family:inherit;">Ignore</button>
      </div>
    </div>
  `;

  const backdrop = document.createElement("div");
  backdrop.id = "flowclip-backdrop";
  backdrop.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);z-index:999998;";

  document.body.appendChild(backdrop);
  document.body.appendChild(toast);

  const cleanup = () => { toast.remove(); backdrop.remove(); };
  const timer = setTimeout(cleanup, 10000);

  document.getElementById("flowclip-screenshot-save").addEventListener("click", () => {
    clearTimeout(timer); cleanup();
    sendMsg({ type: "SAVE_SCREENSHOT_CONFIRMED", payload: { imageData, url: sourceUrl } });
  });
  document.getElementById("flowclip-screenshot-ignore").addEventListener("click", () => { clearTimeout(timer); cleanup(); });
  backdrop.addEventListener("click", () => { clearTimeout(timer); cleanup(); });
}

// ── Copy capture ──────────────────────────────────────────────────────────────

function handleCapture(text) {
  if (!text || text.length <= 5) return;
  if (isBlockedDomain(window.location.href)) return;
  if (text === lastCaptured) return;
  lastCaptured = text;
  sendMsg({ type: "COPY_DETECTED", payload: { content: text, url: window.location.href } });
  showToast(text, window.location.href);
}

function showToast(text, sourceUrl) {
  const existing = document.getElementById("flowclip-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "flowclip-toast";
  toast.innerHTML = `
    <div style="
      position:fixed; bottom:24px; right:24px;
      background:#fff; border:1px solid #e5e5e5; border-radius:14px;
      padding:14px 16px; font-family:'Plus Jakarta Sans',-apple-system,sans-serif;
      font-size:13px; max-width:300px; z-index:999999;
      box-shadow:0 8px 32px rgba(0,0,0,0.12);
    ">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <div style="width:22px;height:22px;background:#000;border-radius:5px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:#fff;flex-shrink:0;">F</div>
        <span style="font-size:12px;font-weight:700;color:#38d091;text-transform:uppercase;letter-spacing:0.5px;">FlowClip captured</span>
      </div>
      <div style="font-size:13px;color:#000;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:12px;padding:8px 10px;background:#f9fafb;border-radius:8px;border:1px solid #f0f0f0;">
        ${text.slice(0, 60)}${text.length > 60 ? "…" : ""}
      </div>
      <div style="display:flex;gap:8px;">
        <button id="flowclip-save" style="flex:1;padding:8px;background:#38d091;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:700;font-family:inherit;">Save</button>
        <button id="flowclip-ignore" style="flex:1;padding:8px;background:#f5f5f5;color:#666;border:none;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;font-family:inherit;">Ignore</button>
      </div>
    </div>
  `;

  document.body.appendChild(toast);
  const timer = setTimeout(() => toast.remove(), 6000);

  document.getElementById("flowclip-save").addEventListener("click", () => {
    clearTimeout(timer); toast.remove();
    sendMsg({ type: "SAVE_CONFIRMED", payload: { content: text, url: sourceUrl } });
  });
  document.getElementById("flowclip-ignore").addEventListener("click", () => {
    clearTimeout(timer); toast.remove();
    lastCaptured = null;
  });
}

// ── Event listeners ───────────────────────────────────────────────────────────

document.addEventListener("copy", () => {
  handleCapture(window.getSelection().toString());
});

document.addEventListener("keydown", (e) => {
  const tag = document.activeElement?.tagName;
  const isEditable = document.activeElement?.isContentEditable;
  if (tag === "INPUT" || tag === "TEXTAREA" || isEditable) return;

  if (e.key === "s" || e.key === "S") {
    const now = Date.now();
    if (now - lastSPress < 2000) {
      captureScreenshot();
      lastSPress = 0;
    } else {
      lastSPress = now;
    }
    return;
  }

  if ((e.ctrlKey || e.metaKey) && e.key === "c") {
    setTimeout(async () => {
      try {
        const text = await navigator.clipboard.readText();
        handleCapture(text);
      } catch {
        // clipboard-read permission not granted
      }
    }, 100);
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SHOW_SCREENSHOT_CONFIRMATION") {
    showScreenshotToast(message.payload.imageData, message.payload.url);
  }
});
