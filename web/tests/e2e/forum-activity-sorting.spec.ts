import { expect, test, type Page } from "@playwright/test";

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;

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

test("reply bumps thread ordering to top on activity sort", async ({ page }) => {
  await loginDirect(page);
  await page.goto("/forum?sort=activity");

  const openThreadLinks = page.getByRole("link", { name: "Open thread" });
  const threadCount = await openThreadLinks.count();
  test.skip(threadCount < 2, "Need at least two threads to verify activity ordering.");

  const titleNodes = page.locator(".thread-item h3");
  const initialFirstTitle = (await titleNodes.nth(0).textContent())?.trim() ?? "";
  const secondTitle = (await titleNodes.nth(1).textContent())?.trim() ?? "";
  test.skip(!initialFirstTitle || !secondTitle, "Could not read thread titles for ordering assertion.");

  await openThreadLinks.nth(1).click();

  const replyField = page.getByLabel("Add reply");
  const canReply = await replyField.isVisible().catch(() => false);
  test.skip(!canReply, "Second thread is not replyable (likely locked). Rerun with different seed data.");

  await replyField.fill(`E2E activity bump reply ${Date.now()}`);
  await page.getByRole("button", { name: "Post reply" }).click();

  if (await page.getByText("You're replying too quickly.").isVisible().catch(() => false)) {
    test.skip(true, "Reply cooldown active for this account; rerun after cooldown window.");
  }

  await page.goto("/forum?sort=activity");
  const bumpedFirstTitle = (await page.locator(".thread-item h3").nth(0).textContent())?.trim() ?? "";
  expect(bumpedFirstTitle).toBe(secondTitle);
});
