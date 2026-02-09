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
  await expect(page).toHaveURL(/\/forum$/, { timeout: 15_000 });
}

async function clearThreadDraftForCurrentCategory(page: Page) {
  const categoryId = await page.locator("#thread-category").inputValue();
  await page.evaluate(({ category }) => {
    window.localStorage.removeItem(`draft:new-thread:${category}`);
    window.sessionStorage.removeItem("draft:pending-clear:new-thread");
  }, { category: categoryId });
}

test("create-thread toolbar inserts markdown snippets", async ({ page }) => {
  await login(page);
  await page.goto("/forum/new");
  await clearThreadDraftForCurrentCategory(page);

  const body = page.getByLabel("Body");
  await expect(body).toBeVisible();

  await body.fill("");
  await page.getByRole("button", { name: "H2" }).first().click();
  await expect(body).toHaveValue("## Heading");

  await body.fill("");
  await page.getByRole("button", { name: "Bold" }).first().click();
  await expect(body).toHaveValue("**bold text**");

  await body.fill("");
  await page.getByRole("button", { name: "List" }).first().click();
  await expect(body).toHaveValue("- List item");

  await body.fill("");
  await page.getByRole("button", { name: "Quote" }).first().click();
  await expect(body).toHaveValue("> Quoted text");

  await body.fill("");
  await page.getByRole("button", { name: "Code" }).first().click();
  await expect(body).toContainText("```");

  await body.fill("");
  await page.getByRole("button", { name: "Link" }).first().click();
  await expect(body).toHaveValue("[link text](https://example.com)");
});

test("quote button appends quoted markdown into reply composer", async ({ page }) => {
  await login(page);
  await page.goto("/forum");

  const openThreadLinks = page.getByRole("link", { name: "Open thread" });
  const threadCount = await openThreadLinks.count();
  test.skip(threadCount === 0, "No thread available for quote flow test.");
  await openThreadLinks.first().click();

  const replyField = page.getByLabel("Add reply");
  const canReply = await replyField.isVisible().catch(() => false);
  test.skip(!canReply, "Selected thread is not replyable (locked or unavailable).");

  const seedText = `E2E quote seed ${Date.now()}`;
  await replyField.fill(seedText);
  await page.getByRole("button", { name: "Post reply" }).click();

  if (await page.getByText("You're replying too quickly.").isVisible().catch(() => false)) {
    test.skip(true, "Reply cooldown active for this account; rerun after cooldown.");
  }

  const seededReply = page.locator(".reply-unit", { hasText: seedText }).first();
  await expect(seededReply).toBeVisible();

  await seededReply.getByRole("button", { name: "Quote" }).click();

  const composerBody = page.locator("#reply-composer-body");
  await expect(composerBody).toBeFocused();
  await expect(composerBody).toContainText(`> ${seedText}`);
  await expect(composerBody).toContainText("Reply:");
});

test("thread draft restore/discard works after reload", async ({ page }) => {
  await login(page);
  await page.goto("/forum/new");
  await clearThreadDraftForCurrentCategory(page);

  const title = page.getByLabel("Title");
  const body = page.getByLabel("Body");
  const draftTitle = `E2E Draft Title ${Date.now()}`;
  const draftBody = `E2E Draft Body ${Date.now()}`;

  await title.fill(draftTitle);
  await body.fill(draftBody);
  await page.waitForTimeout(900);

  await page.reload();
  await expect(page.getByRole("button", { name: "Restore draft" })).toBeVisible();
  await page.getByRole("button", { name: "Restore draft" }).click();
  await expect(title).toHaveValue(draftTitle);
  await expect(body).toHaveValue(draftBody);

  await page.reload();
  await expect(page.getByRole("button", { name: "Restore draft" })).toBeVisible();
  await page.getByRole("button", { name: "Discard" }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Restore draft" })).toHaveCount(0);
});
