import { expect, test } from "@playwright/test";

test("guest cannot access admin dashboard", async ({ page }) => {
  await page.goto("/admin");

  await expect(page.getByRole("heading", { name: "Admin Dashboard" })).toBeVisible();
  await expect(page.getByText("Access denied. Moderator or admin role required.")).toBeVisible();
});
