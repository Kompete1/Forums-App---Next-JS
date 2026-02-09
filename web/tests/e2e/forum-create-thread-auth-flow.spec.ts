import { expect, test, type Page } from "@playwright/test";

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;
const categorySlug = "general-paddock";

async function loginFromCurrentPage(page: Page) {
  if (!email || !password) {
    test.skip(true, "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run auth e2e tests.");
  }

  const emailInput = page.locator("#email");
  const passwordInput = page.locator("#password");
  await expect(emailInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  await emailInput.fill(email!);
  await passwordInput.fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
}

async function loginDirect(page: Page) {
  if (!email || !password) {
    test.skip(true, "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run auth e2e tests.");
  }

  await page.goto("/auth/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/forum$/, { timeout: 15_000 });
}

test("guest category create CTA redirects to login then back to /forum/new", async ({ page }) => {
  await page.goto(`/forum/category/${categorySlug}`);
  await page.getByRole("link", { name: "Login to create thread" }).click();

  await expect(page).toHaveURL(/\/auth\/login\?returnTo=/);
  await loginFromCurrentPage(page);

  await expect(page).toHaveURL(new RegExp(`/forum/new\\?category=${categorySlug}`), { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Create a discussion" })).toBeVisible();
});

test("signed-in user category create CTA opens /forum/new without login bounce", async ({ page }) => {
  await loginDirect(page);

  await page.goto(`/forum/category/${categorySlug}`);
  await page.getByRole("link", { name: "Create thread in this category" }).click();

  await expect(page).toHaveURL(new RegExp(`/forum/new\\?category=${categorySlug}`), { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "Create a discussion" })).toBeVisible();
});

test("direct login lands on forum signed-in state", async ({ page }) => {
  await loginDirect(page);
  await expect(page.getByText("Browsing as guest. Sign in to post and reply.")).toHaveCount(0);
  await expect(page.getByText(/^Signed in as /)).toBeVisible();
});

test("explicit profile logout signs out and forum renders guest state", async ({ page }) => {
  await loginDirect(page);
  await page.goto("/profile");

  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL(/\/auth\/login$/, { timeout: 15_000 });

  await page.goto("/forum");
  await expect(page.getByText("Browsing as guest. Sign in to post and reply.")).toBeVisible();
  await expect(page.getByText(/^Signed in as /)).toHaveCount(0);
});

test("guest reply CTA redirects to login then back to the same thread", async ({ page }) => {
  await page.goto("/forum");
  const threadLinks = page.getByRole("link", { name: "Open thread" });
  const threadCount = await threadLinks.count();
  test.skip(threadCount === 0, "No thread available for reply redirect test.");

  await threadLinks.first().click();
  const loginToReply = page.getByRole("link", { name: "Login to reply" });
  const hasReplyLogin = await loginToReply.isVisible().catch(() => false);
  test.skip(!hasReplyLogin, "Selected thread is locked or reply CTA unavailable.");

  const targetUrl = page.url();
  await loginToReply.click();
  await expect(page).toHaveURL(/\/auth\/login\?returnTo=/);
  await loginFromCurrentPage(page);

  await expect(page).toHaveURL(new RegExp(targetUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), { timeout: 15_000 });
  await expect(page.getByLabel("Add reply")).toBeVisible();
});
