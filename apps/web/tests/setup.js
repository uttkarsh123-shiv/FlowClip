import "@testing-library/jest-dom";

// Mock EventSource — not available in jsdom (browser-only API used for SSE)
global.EventSource = class MockEventSource {
  constructor(url) { this.url = url; }
  addEventListener() {}
  removeEventListener() {}
  close() {}
  set onerror(_) {}
};
