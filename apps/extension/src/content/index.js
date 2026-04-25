// Listen for copy events
document.addEventListener("copy", () => {
  const text = window.getSelection().toString();
  if (text.length > 5) {
    chrome.runtime.sendMessage({
      type: "COPY_DETECTED",
      payload: { content: text, url: window.location.href }
    });
  }
});

// Listen for confirmation request from background
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SHOW_CONFIRMATION") {
    showToast(message.payload.content);
  }
});

function showToast(text) {
  // Remove existing toast
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

  // Auto-dismiss after 6 seconds
  const timer = setTimeout(() => toast.remove(), 6000);

  document.getElementById("flowclip-save").addEventListener("click", () => {
    clearTimeout(timer);
    toast.remove();
    chrome.runtime.sendMessage({ type: "SAVE_CONFIRMED" });
  });

  document.getElementById("flowclip-ignore").addEventListener("click", () => {
    clearTimeout(timer);
    toast.remove();
    chrome.runtime.sendMessage({ type: "IGNORE_CONFIRMED" });
  });
}
