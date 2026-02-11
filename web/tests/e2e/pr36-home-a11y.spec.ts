import { expect, test, type Page } from "@playwright/test";

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;

async function login(page: Page) {
  if (!email || !password) {
    test.skip(true, "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run signed-in home checks.");
  }

  await page.goto("/auth/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/forum$/, { timeout: 15_000 });
}

test("guest home shows CTA module and hides signed-in activity module", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Join the Community" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Your recent activity" })).toHaveCount(0);
});

test("category cards include thread-count badges on home and categories pages", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".category-thread-count").first()).toBeVisible();
  await expect(page.locator(".category-thread-count").first()).toContainText(/threads$/);

  await page.goto("/categories");
  await expect(page.locator(".category-thread-count").first()).toBeVisible();
  await expect(page.locator(".category-thread-count").first()).toContainText(/threads$/);
});

test("skip link receives focus and targets main content container", async ({ page }) => {
  await page.goto("/");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to main content" });
  await expect(skipLink).toBeFocused();

  await skipLink.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});

test("theme toggle has stable accessible label", async ({ page }) => {
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Switch theme" });
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-label", "Switch theme");

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-label", "Switch theme");
});

test("signed-in home shows recent activity module", async ({ page }) => {
  await login(page);
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Your recent activity" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Guest account call to action" })).toHaveCount(0);
});
