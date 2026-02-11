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

async function openReplyableThread(page: Page) {
  await page.goto("/forum");
  const openThreadLinks = page.getByRole("link", { name: "Open thread" });
  const threadCount = await openThreadLinks.count();
  test.skip(threadCount === 0, "No thread available for reply flow test.");

  for (let index = 0; index < threadCount; index += 1) {
    await openThreadLinks.nth(index).click();
    const replyField = page.getByLabel("Add reply");
    const canReply = await replyField.isVisible().catch(() => false);
    if (canReply) {
      return;
    }
    await page.goto("/forum");
  }

  test.skip(true, "No unlocked/replyable thread available in this environment.");
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
  await openReplyableThread(page);
  const replyField = page.getByLabel("Add reply");

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

test("reply draft clears after successful submit on same thread path", async ({ page }) => {
  await login(page);
  await openReplyableThread(page);

  const threadMatch = page.url().match(/\/forum\/([0-9a-f-]{36})/i);
  test.skip(!threadMatch, "Could not resolve thread id for draft key cleanup.");
  const threadId = threadMatch?.[1] ?? "";

  await page.evaluate(({ tid }) => {
    window.localStorage.removeItem(`draft:reply:${tid}`);
    window.sessionStorage.removeItem("draft:pending-clear:reply");
  }, { tid: threadId });

  const replyField = page.getByLabel("Add reply");
  const message = `E2E reply draft clear ${Date.now()}`;
  await replyField.fill(message);
  await page.waitForTimeout(900);

  await page.getByRole("button", { name: "Post reply" }).click();

  if (await page.getByText("You're replying too quickly.").isVisible().catch(() => false)) {
    test.skip(true, "Reply cooldown active for this account; rerun after cooldown.");
  }

  await expect(page).toHaveURL(/replyPosted=1/, { timeout: 15_000 });
  await expect(page).not.toHaveURL(/replyErrorCode=/);
  await expect(page.getByText("Could not complete this action. Please try again.")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Restore draft" })).toHaveCount(0);
  await expect(page.locator("#reply-composer-body")).toHaveValue("");
});

test("reply attachment images render without cropping (contain fit)", async ({ page }) => {
  await login(page);
  await openReplyableThread(page);

  const replyField = page.getByLabel("Add reply");
  const message = `E2E image contain ${Date.now()}`;
  await replyField.fill(message);

  const oneByOnePng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO9WJxQAAAAASUVORK5CYII=";
  await page.setInputFiles("input[name='replyAttachments']", [
    {
      name: "e2e-reply-image.png",
      mimeType: "image/png",
      buffer: Buffer.from(oneByOnePng, "base64"),
    },
  ]);

  await page.getByRole("button", { name: "Post reply" }).click();

  if (await page.getByText("You're replying too quickly.").isVisible().catch(() => false)) {
    test.skip(true, "Reply cooldown active for this account; rerun after cooldown.");
  }

  const createdReply = page.locator(".reply-unit", { hasText: message }).first();
  await expect(createdReply).toBeVisible();
  const attachmentImage = createdReply.locator(".attachment-image").first();
  await expect(attachmentImage).toBeVisible();
  await expect(attachmentImage).toHaveCSS("object-fit", "contain");
});

test("thread and reply timestamps use SAST 24h forum format", async ({ page }) => {
  await page.goto("/forum");
  const openThreadLinks = page.getByRole("link", { name: "Open thread" });
  const threadCount = await openThreadLinks.count();
  test.skip(threadCount === 0, "No thread available for timestamp format test.");
  await openThreadLinks.first().click();

  const forumDateTimePattern = /\d{4}\/\d{2}\/\d{2}, \d{2}:\d{2}:\d{2}/;

  const anyTimestampCount = await page.locator("text=/\\d{4}\\/\\d{2}\\/\\d{2}, \\d{2}:\\d{2}:\\d{2}/").count();
  expect(anyTimestampCount).toBeGreaterThan(0);

  const replyMetaTexts = await page.locator(".reply-unit .reply-unit-head .meta").allTextContents();
  test.skip(replyMetaTexts.length === 0, "No replies available to validate reply timestamp format.");
  for (const text of replyMetaTexts) {
    expect(text).toMatch(forumDateTimePattern);
    expect(text).not.toMatch(/\bAM\b|\bPM\b/i);
  }
});
