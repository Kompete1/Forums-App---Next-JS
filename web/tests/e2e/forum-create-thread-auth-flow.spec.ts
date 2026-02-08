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
  await expect(page).toHaveURL(/\/profile$/, { timeout: 15_000 });
}

test("guest category create CTA redirects to login then back to /forum/new", async ({ page }) => {
  await page.goto(`/forum/category/${categorySlug}`);
  await page.getByRole("link", { name: "Login to create thread" }).click();

  await expect(page).toHaveURL(/\/auth\/login\?next=/);
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

test("direct login then profile back-to-forum stays signed in", async ({ page }) => {
  await loginDirect(page);

  await page.getByRole("link", { name: "Back to forum" }).click();

  await expect(page).toHaveURL(/\/forum$/, { timeout: 15_000 });
  await expect(page.getByText("Browsing as guest. Sign in to post and reply.")).toHaveCount(0);
  await expect(page.getByText(/^Signed in as /)).toBeVisible();
});
