// Detects copy events and sends data to background
document.addEventListener("copy", () => {
  const text = window.getSelection()?.toString();
  if (!text) return;

  chrome.runtime.sendMessage({ type: "COPY_DETECTED", payload: text });
});
