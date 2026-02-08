import { expect, test } from "@playwright/test";

test("guest can browse forum and open a thread", async ({ page }) => {
  await page.goto("/forum");

  await expect(page.getByRole("heading", { name: "South African Motorsport Forum" })).toBeVisible();
  const threadLinks = page.getByRole("link", { name: "Open thread" });
  const threadCount = await threadLinks.count();
  test.skip(threadCount === 0, "No threads available to open in this environment.");

  await threadLinks.first().click();
  await expect(page.getByRole("heading", { name: "Replies" })).toBeVisible();
});
