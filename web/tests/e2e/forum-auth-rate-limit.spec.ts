import { expect, test, type Page } from "@playwright/test";

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;

test.describe.configure({ mode: "serial" });

async function login(page: Page) {
  if (!email || !password) {
    test.skip(true, "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run auth e2e tests.");
  }

  await page.goto("/auth/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/profile$/, { timeout: 15_000 });
}

test("authenticated user create thread and immediate second thread shows cooldown", async ({ page }) => {
  await login(page);

  const threadTitleA = `E2E Thread ${Date.now()} A`;
  const threadTitleB = `E2E Thread ${Date.now()} B`;

  await page.goto("/forum/new");
  await page.getByLabel("Title").fill(threadTitleA);
  await page.getByLabel("Body").fill("E2E body A");
  await page.getByRole("button", { name: "Publish thread" }).click();

  await expect(page).toHaveURL(/\/forum\//);

  await page.goto("/forum/new");
  await page.getByLabel("Title").fill(threadTitleB);
  await page.getByLabel("Body").fill("E2E body B");
  await page.getByRole("button", { name: "Publish thread" }).click();

  await expect(page.getByText("You're posting threads too quickly.")).toBeVisible();
});

test("authenticated user reply and immediate second reply shows cooldown", async ({ page }) => {
  await login(page);

  await page.goto("/forum");
  const threadLinks = page.getByRole("link", { name: "Open thread" });
  const threadCount = await threadLinks.count();
  test.skip(threadCount === 0, "No threads available to open in this environment.");
  await threadLinks.first().click();
  await expect(page.getByRole("heading", { name: "Replies" })).toBeVisible();

  const firstReply = `E2E Reply ${Date.now()} A`;
  const secondReply = `E2E Reply ${Date.now()} B`;

  await page.getByLabel("Add reply").fill(firstReply);
  await page.getByRole("button", { name: "Post reply" }).click();
  await expect(page).toHaveURL(/\/forum\//);

  await page.getByLabel("Add reply").fill(secondReply);
  await page.getByRole("button", { name: "Post reply" }).click();

  await expect(page.getByText("You're replying too quickly.")).toBeVisible();
});
