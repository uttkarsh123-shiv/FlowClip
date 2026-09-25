import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./tests/setup.js",
    // Exclude Playwright e2e tests — those run via `npm run test:e2e`
    exclude: ["e2e/**", "**/node_modules/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
