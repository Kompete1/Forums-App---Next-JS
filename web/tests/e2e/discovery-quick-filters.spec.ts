import { expect, test } from "@playwright/test";

test("forum quick filters update URL and unanswered results semantics", async ({ page }) => {
  await page.goto("/forum");

  const quickFilters = page.locator(".quick-filter-row");
  await expect(quickFilters.getByRole("link", { name: "All" })).toBeVisible();
  await expect(quickFilters.getByRole("link", { name: "Unanswered" })).toBeVisible();
  await expect(quickFilters.getByRole("link", { name: "Active" })).toBeVisible();
  await expect(quickFilters.getByRole("link", { name: "Popular" })).toBeVisible();

  await quickFilters.getByRole("link", { name: "Unanswered" }).click();
  await expect(page).toHaveURL(/\/forum\?.*signal=unanswered/);
  await expect(page.getByText("Signal: Unanswered").first()).toBeVisible();

  const rows = page.locator(".thread-row");
  const rowCount = await rows.count();
  if (rowCount === 0) {
    await expect(page.getByText("No threads found for this filter.")).toBeVisible();
    return;
  }

  for (let index = 0; index < rowCount; index += 1) {
    const text = (await rows.nth(index).textContent()) ?? "";
    const replyCountMatch = text.match(/(\d+)\s+replies/);
    const replyCount = replyCountMatch ? Number.parseInt(replyCountMatch[1] ?? "", 10) : Number.NaN;
    expect(replyCount).toBe(0);
  }
});

test("category discovery accepts signal param and shows active filter state", async ({ page }) => {
  await page.goto("/forum");

  const firstCategoryLink = page.locator(".category-quick-link").first();
  const categoryHref = await firstCategoryLink.getAttribute("href");
  test.skip(!categoryHref, "No category quick link available in this environment.");

  const categoryPath = categoryHref!;
  const separator = categoryPath.includes("?") ? "&" : "?";
  await page.goto(`${categoryPath}${separator}signal=active`);

  await expect(page).toHaveURL(/signal=active/);
  await expect(page.locator(".quick-filter-row").getByRole("link", { name: "Active" })).toHaveAttribute("aria-current", "true");
  await expect(page.getByText("Signal: Active").first()).toBeVisible();
});
