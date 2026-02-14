import { expect, test } from "@playwright/test";

test("community guidelines and moderation policy pages are reachable", async ({ page, request }) => {
  const guidelinesResponse = await request.get("/community-guidelines");
  expect(guidelinesResponse.ok()).toBeTruthy();

  const moderationResponse = await request.get("/moderation-policy");
  expect(moderationResponse.ok()).toBeTruthy();

  await page.goto("/community-guidelines");
  await expect(page.getByRole("heading", { name: "Community Guidelines" })).toBeVisible();

  await page.goto("/moderation-policy");
  await expect(page.getByRole("heading", { name: "Moderation Policy" })).toBeVisible();
});

test("footer exposes trust links, disclaimer, and escalation contact", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Community Guidelines" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Moderation" }).first()).toBeVisible();
  await expect(page.locator("footer")).toContainText("Unofficial community site");
  await expect(page.locator("footer a[href='mailto:peterj.swartz@outlook.com']")).toBeVisible();
});
