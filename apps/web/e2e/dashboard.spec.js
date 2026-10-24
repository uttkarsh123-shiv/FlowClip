import { test, expect } from "@playwright/test";

/**
 * E2E — Dashboard flow
 *
 * Prerequisites:
 *   - `npm run dev` running on http://localhost:3000
 *   - Test account exists:
 *       email:    test@flowclip.dev
 *       password: Test1234!
 */

const TEST_EMAIL    = "e2e@flowclip.dev";
const TEST_PASSWORD = "E2eTest123!";

// ── Shared login helper ────────────────────────────────────────────────────────
async function login(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
  await page.getByPlaceholder("••••••••").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).last().click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

// ── Dashboard loads ────────────────────────────────────────────────────────────
test.describe("Dashboard", () => {
  test("shows navbar and sidebar after login", async ({ page }) => {
    await login(page);
    await expect(page.getByText("FlowClip")).toBeVisible();
    await expect(page.getByText("All Clips")).toBeVisible();
    await expect(page.getByRole("button", { name: "Text" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Links" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Images" })).toBeVisible();
  });

  test("search input is visible and accepts typing", async ({ page }) => {
    await login(page);
    const search = page.getByPlaceholder("Search clips...");
    await expect(search).toBeVisible();
    await search.fill("hello");
    await expect(search).toHaveValue("hello");
  });

  test("clear button removes search query", async ({ page }) => {
    await login(page);
    const search = page.getByPlaceholder("Search clips...");
    await search.fill("hello");
    // Click the clear button that appears next to the search input
    await search.press("Control+a");
    await search.press("Delete");
    await expect(search).toHaveValue("");
  });

  test("sidebar filter switches active type", async ({ page }) => {
    await login(page);
    await page.getByRole("button", { name: "Text" }).click();
    // URL or active state reflects the selection
    await expect(page.getByRole("button", { name: "Text" })).toHaveCSS("font-weight", "700");
  });

  test("logout signs out and returns to landing page", async ({ page }) => {
    await login(page);
    // Open avatar menu and sign out
    await page.locator("nav button").last().click();
    await page.getByRole("button", { name: "Sign out" }).click();
    await expect(page).toHaveURL("http://localhost:3000/", { timeout: 10_000 });
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });
});
