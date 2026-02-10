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

function parseLikeCount(text: string | null) {
  const value = (text ?? "").match(/(\d+)\s+likes/);
  return value ? Number.parseInt(value[1] ?? "", 10) : Number.NaN;
}

async function getThreadUrls(page: Page) {
  const urls = await page
    .locator("a", { hasText: "Open thread" })
    .evaluateAll((links) => links.map((link) => (link as HTMLAnchorElement).getAttribute("href") ?? "").filter(Boolean));
  return urls;
}

test("guest sees login to like on thread detail", async ({ page }) => {
  await page.goto("/forum");
  const threadUrls = await getThreadUrls(page);
  test.skip(threadUrls.length === 0, "No thread available in this environment.");

  await page.goto(threadUrls[0]!);
  await expect(page.getByRole("link", { name: "Login to like" }).first()).toBeVisible();
});

test("signed-in user can like a thread once and count increases", async ({ page }) => {
  await login(page);
  await page.goto("/forum");

  const threadUrls = await getThreadUrls(page);
  test.skip(threadUrls.length === 0, "No thread available in this environment.");

  let likedThread = false;
  for (const threadUrl of threadUrls.slice(0, 10)) {
    await page.goto(threadUrl);
    const threadUnit = page.locator(".thread-post-unit");
    const likeButton = threadUnit.getByRole("button", { name: "Like" });
    if ((await likeButton.count()) === 0) {
      continue;
    }

    const before = parseLikeCount(await threadUnit.locator(".reaction-count-pill").first().textContent());
    if (!Number.isFinite(before)) {
      continue;
    }

    await likeButton.click();
    await page.waitForLoadState("networkidle");
    if (page.url().includes("threadLikeErrorCode=REACTION_FEATURE_UNAVAILABLE")) {
      test.skip(true, "Reactions migration not applied in this environment.");
    }
    if (await page.getByText("You cannot like your own content.").isVisible().catch(() => false)) {
      continue;
    }

    const after = parseLikeCount(await threadUnit.locator(".reaction-count-pill").first().textContent());
    expect(after).toBe(before + 1);
    await expect(threadUnit.getByRole("button", { name: "Liked" })).toBeDisabled();
    likedThread = true;
    break;
  }

  test.skip(!likedThread, "No non-owned unliked thread available for this account.");
});

test("signed-in user can like a reply once and count increases", async ({ page }) => {
  await login(page);
  await page.goto("/forum");

  const threadUrls = await getThreadUrls(page);
  test.skip(threadUrls.length === 0, "No thread available in this environment.");

  let likedReply = false;
  for (const threadUrl of threadUrls.slice(0, 10)) {
    await page.goto(threadUrl);
    const replies = page.locator(".reply-unit");
    const replyCount = await replies.count();
    if (replyCount === 0) {
      continue;
    }

    for (let index = 0; index < replyCount; index += 1) {
      const reply = replies.nth(index);
      const likeButton = reply.getByRole("button", { name: "Like" });
      if ((await likeButton.count()) === 0) {
        continue;
      }

      const before = parseLikeCount(await reply.locator(".reaction-count-pill").first().textContent());
      if (!Number.isFinite(before)) {
        continue;
      }

      await likeButton.click();
      await page.waitForLoadState("networkidle");
      if (page.url().includes("replyLikeErrorCode=REACTION_FEATURE_UNAVAILABLE")) {
        test.skip(true, "Reactions migration not applied in this environment.");
      }
      if (await page.getByText("You cannot like your own content.").isVisible().catch(() => false)) {
        continue;
      }

      const after = parseLikeCount(await reply.locator(".reaction-count-pill").first().textContent());
      expect(after).toBe(before + 1);
      await expect(reply.getByRole("button", { name: "Liked" })).toBeDisabled();
      likedReply = true;
      break;
    }

    if (likedReply) {
      break;
    }
  }

  test.skip(!likedReply, "No non-owned unliked reply available for this account.");
});

test("self-like on own thread is blocked", async ({ page }) => {
  await login(page);
  await page.goto("/profile?tab=activity");

  const ownThreadLink = page.locator("article:has(h2:has-text('My Threads')) .activity-row").first();
  test.skip((await ownThreadLink.count()) === 0, "No authored thread available for self-like guard check.");

  await ownThreadLink.click();
  const threadUnit = page.locator(".thread-post-unit");
  const likeButton = threadUnit.getByRole("button", { name: "Like" });
  test.skip((await likeButton.count()) === 0, "Self-like button unavailable for this thread.");

  await likeButton.click();
  await page.waitForLoadState("networkidle");
  if (page.url().includes("threadLikeErrorCode=REACTION_FEATURE_UNAVAILABLE")) {
    test.skip(true, "Reactions migration not applied in this environment.");
  }
  await expect(page.getByText("You cannot like your own content.")).toBeVisible();
});
