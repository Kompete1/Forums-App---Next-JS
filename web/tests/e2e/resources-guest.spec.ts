import { expect, test } from "@playwright/test";

test("guest can load resources hub", async ({ page }) => {
  await page.goto("/resources");

  await expect(page.getByRole("heading", { name: "Resources" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Official notices & schedules" })).toBeVisible();
});
