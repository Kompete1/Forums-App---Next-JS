import { expect, test } from "@playwright/test";

test("forum discovery shows explicit sort context for default and selected sorts", async ({ page }) => {
  await page.goto("/forum");
  await expect(page.getByText("Sort: Most recent activity").first()).toBeVisible();

  await page.goto("/forum?sort=newest");
  await expect(page.getByText("Sort: Newest first").first()).toBeVisible();
});

test("unanswered signal appears on threads with zero replies when available", async ({ page }) => {
  await page.goto("/forum");

  const rows = page.locator(".thread-row");
  const rowCount = await rows.count();
  test.skip(rowCount === 0, "No threads available in this environment.");

  let targetRowIndex = -1;
  for (let index = 0; index < rowCount; index += 1) {
    const rowText = (await rows.nth(index).textContent()) ?? "";
    const replyCountMatch = rowText.match(/(\d+)\s+replies/);
    const replyCount = replyCountMatch ? Number.parseInt(replyCountMatch[1] ?? "", 10) : Number.NaN;
    if (replyCount === 0) {
      targetRowIndex = index;
      break;
    }
  }

  test.skip(targetRowIndex === -1, "No unanswered thread (0 replies) available in this environment.");
  await expect(rows.nth(targetRowIndex).locator(".thread-signal-pill-unanswered")).toBeVisible();
});
