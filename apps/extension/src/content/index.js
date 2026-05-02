// Block by exact hostname, not substring — avoids false matches like "bank" in unrelated URLs
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

let lastCaptured = null;

function handleCapture(text) {
  if (!text || text.length <= 5) return;
  if (isBlockedDomain(window.location.href)) return;
  if (text === lastCaptured) return; // dedup between copy event + keydown fallback
  lastCaptured = text;
  showToast(text, window.location.href);
}

// Standard copy event — works on Google, most normal sites
document.addEventListener("copy", () => {
  handleCapture(window.getSelection().toString());
});

// Fallback for Monaco-based editors (LeetCode, CodeSandbox, etc.)
// Monaco doesn't fire the native copy DOM event
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "c") {
    setTimeout(async () => {
      try {
        const text = await navigator.clipboard.readText();
        handleCapture(text);
      } catch {
        // clipboard-read permission not granted — silently skip
      }
    }, 100);
  }
});

function showToast(text, sourceUrl) {
  const existing = document.getElementById("flowclip-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "flowclip-toast";
  toast.innerHTML = `
    <div style="
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #1a1a1a;
      color: #f0f0f0;
      border: 1px solid #333;
      border-radius: 10px;
      padding: 12px 16px;
      font-family: -apple-system, sans-serif;
      font-size: 13px;
      max-width: 280px;
      z-index: 999999;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    ">
      <div style="margin-bottom:8px; color:#aaa; font-size:11px;">FlowClip captured</div>
      <div style="
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 10px;
        font-size: 13px;
      ">${text.slice(0, 60)}${text.length > 60 ? "…" : ""}</div>
      <div style="display:flex; gap:8px;">
        <button id="flowclip-save" style="
          flex:1; padding:6px; background:#2563eb; color:#fff;
          border:none; border-radius:6px; cursor:pointer; font-size:12px;
        ">✔ Save</button>
        <button id="flowclip-ignore" style="
          flex:1; padding:6px; background:#2a2a2a; color:#aaa;
          border:1px solid #333; border-radius:6px; cursor:pointer; font-size:12px;
        ">✕ Ignore</button>
      </div>
    </div>
  `;

  document.body.appendChild(toast);
  const timer = setTimeout(() => toast.remove(), 6000);

  document.getElementById("flowclip-save").addEventListener("click", () => {
    clearTimeout(timer);
    toast.remove();
    chrome.runtime.sendMessage({
      type: "SAVE_CONFIRMED",
      payload: { content: text, url: sourceUrl }
    });
  });

  document.getElementById("flowclip-ignore").addEventListener("click", () => {
    clearTimeout(timer);
    toast.remove();
    lastCaptured = null; // allow re-capture of same text after ignore
  });
}
