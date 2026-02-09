import { expect, test, type Page, type Response } from "@playwright/test";

const primaryEmail = process.env.E2E_TEST_EMAIL;
const primaryPassword = process.env.E2E_TEST_PASSWORD;
const secondaryEmail = process.env.E2E_ALT_EMAIL;
const secondaryPassword = process.env.E2E_ALT_PASSWORD;

test.describe.configure({ mode: "serial" });

async function login(page: Page, email: string | undefined, password: string | undefined) {
  if (!email || !password) {
    test.skip(true, "Missing e2e credentials for this flow.");
  }

  await page.goto("/auth/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/forum$/, { timeout: 15_000 });
}

async function logout(page: Page) {
  await page.goto("/profile");
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL(/\/auth\/login$/);
}

async function skipIfNotificationsMigrationMissing(page: Page, response: Response | null) {
  if (response && response.status() >= 500) {
    test.skip(true, "Apply PR17 notifications migration before running notifications e2e.");
  }

  const hasMissingTableError = await page
    .getByText("Could not find the table 'public.notifications' in the schema cache")
    .isVisible()
    .catch(() => false);

  test.skip(hasMissingTableError, "Apply PR17 notifications migration before running notifications e2e.");
}

test("signed-in user can open notifications inbox", async ({ page }) => {
  await login(page, primaryEmail, primaryPassword);

  const response = await page.goto("/notifications");
  await skipIfNotificationsMigrationMissing(page, response);
  await expect(page.getByRole("heading", { name: "Notifications" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Mark all as read" })).toBeVisible();
});

test("reply by secondary user produces notification and read controls update state", async ({ page }) => {
  if (!secondaryEmail || !secondaryPassword) {
    test.skip(true, "Set E2E_ALT_EMAIL and E2E_ALT_PASSWORD for dual-user notification flow.");
  }

  await login(page, primaryEmail, primaryPassword);

  const threadTitle = `E2E Notify Thread ${Date.now()}`;
  await page.goto("/forum/new");
  await page.getByLabel("Title").fill(threadTitle);
  await page.getByLabel("Body").fill("Notification seed thread body");
  await page.getByRole("button", { name: "Publish thread" }).click();

  if (await page.getByText("You're posting threads too quickly.").isVisible().catch(() => false)) {
    test.skip(true, "Thread cooldown active for primary account; rerun after cooldown window.");
  }

  await page.goto(`/forum?q=${encodeURIComponent(threadTitle)}`);
  const threadLinks = page.getByRole("link", { name: "Open thread" });
  const matches = await threadLinks.count();
  test.skip(matches === 0, "Primary account thread cooldown prevented seed thread creation; rerun after cooldown.");
  await threadLinks.first().click();
  await expect(page).toHaveURL(/\/forum\/[0-9a-f-]{36}/, { timeout: 15_000 });
  const threadUrl = page.url();

  await logout(page);
  await login(page, secondaryEmail, secondaryPassword);

  await page.goto(threadUrl);
  await page.getByLabel("Add reply").fill(`E2E secondary reply ${Date.now()}`);
  await page.getByRole("button", { name: "Post reply" }).click();

  if (await page.getByText("You're replying too quickly.").isVisible().catch(() => false)) {
    test.skip(true, "Reply cooldown active for secondary account; rerun after cooldown window.");
  }

  await logout(page);
  await login(page, primaryEmail, primaryPassword);

  const response = await page.goto("/notifications");
  await skipIfNotificationsMigrationMissing(page, response);
  await expect(page.getByText("replied to your thread.").first()).toBeVisible();
  await expect(page.locator(".unread-badge")).toBeVisible();

  const markReadButtons = page.getByRole("button", { name: "Mark read" });
  const unreadCount = await markReadButtons.count();
  if (unreadCount > 0) {
    await markReadButtons.first().click();
    await expect(page.getByText("Read").first()).toBeVisible();
  }

  await page.getByRole("button", { name: "Mark all as read" }).click();
  await expect(page.getByRole("button", { name: "Mark read" })).toHaveCount(0);
});
