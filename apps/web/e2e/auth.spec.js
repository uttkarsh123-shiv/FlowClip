import { test, expect } from "@playwright/test";

/**
 * E2E — Auth flow
 *
 * Prerequisites:
 *   - `npm run dev` is running on http://localhost:3000
 *   - A test account exists in Convex:
 *       email:    test@flowclip.dev
 *       password: Test1234!
 *
 * These tests drive a real Chromium browser against the live Next.js app.
 */

const TEST_EMAIL = "test@flowclip.dev";
const TEST_PASSWORD = "Test1234!";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Opens the login modal from the landing page nav. */
async function openLoginModal(page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Welcome back")).toBeVisible();
}

// ── Tests ────────────────────────────────────────────────────────────────────

test.describe("Landing page", () => {
  test("shows the FlowClip hero and nav on the landing page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/FlowClip/i);
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign up" })).toBeVisible();
  });
});

test.describe("Login modal", () => {
  test("opens the login modal when Sign in is clicked", async ({ page }) => {
    await openLoginModal(page);
    await expect(page.getByText("Sign in to your FlowClip account")).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" }).last()).toBeVisible();
  });

  test("shows an error message for invalid credentials", async ({ page }) => {
    await openLoginModal(page);

    await page.getByPlaceholder("you@example.com").fill("wrong@example.com");
    await page.getByPlaceholder("••••••••").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).last().click();

    // Error message should appear — exact text comes from Convex auth
    await expect(
      page.locator("p").filter({ hasText: /invalid|incorrect|wrong|not found/i })
    ).toBeVisible({ timeout: 10_000 });
  });

  test("closes the modal when the backdrop is clicked", async ({ page }) => {
    await openLoginModal(page);

    // Click the backdrop (the overlay div behind the modal card)
    await page.mouse.click(10, 10);
    await expect(page.getByText("Welcome back")).not.toBeVisible();
  });

  test("switches to the register form when Sign up link is clicked", async ({ page }) => {
    await openLoginModal(page);

    await page.getByRole("button", { name: "Sign up" }).last().click();
    await expect(page.getByText("Create account")).toBeVisible();
    await expect(page.getByPlaceholder("John Doe")).toBeVisible();
  });
});

test.describe("Login happy path", () => {
  test("logs in with valid credentials and lands on the dashboard", async ({ page }) => {
    await openLoginModal(page);

    await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
    await page.getByPlaceholder("••••••••").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).last().click();

    // Should navigate to /dashboard after successful login
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test("redirects already-logged-in users from landing to dashboard", async ({
    page,
    context,
  }) => {
    // Log in first
    await openLoginModal(page);
    await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL);
    await page.getByPlaceholder("••••••••").fill(TEST_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).last().click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    // Navigating back to "/" should redirect straight to dashboard
    await page.goto("/");
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });
});
