import { expect, test, type Page } from "@playwright/test";

function getPaginationSummary(text: string | null) {
  const match = (text ?? "").match(/Page\s+(\d+)\s+of\s+(\d+)\s+\|\s+\d+\s+total/i);
  if (!match) {
    return null;
  }
  return {
    page: Number.parseInt(match[1] ?? "", 10),
    totalPages: Number.parseInt(match[2] ?? "", 10),
  };
}

async function getSummary(page: Page) {
  const forumMain = page.locator(".forum-main").first();
  return getPaginationSummary(await forumMain.textContent());
}

test("forum advanced pagination supports next, last, and page jump", async ({ page }) => {
  await page.goto("/forum");

  const summary = await getSummary(page);
  test.skip(!summary || summary.totalPages <= 1, "Forum feed has one page only in this environment.");

  const pagination = page.locator("nav[aria-label='Thread list pagination']");
  const lastLink = pagination.locator("a[title='Last page']");
  await expect(pagination).toBeVisible();
  await expect(pagination.getByRole("link", { name: "Next" })).toHaveAttribute("title", "Next page");
  await expect(lastLink).toBeVisible();
  await expect(lastLink).toHaveAttribute("title", "Last page");

  await pagination.getByRole("link", { name: "Next" }).click();
  await expect(page).toHaveURL(/\/forum\?.*page=2/);

  await lastLink.click();
  await expect(page).toHaveURL(new RegExp(`/forum\\?.*page=${summary!.totalPages}`));

  await page.getByRole("combobox", { name: "Jump to page" }).selectOption("1");
  await expect
    .poll(async () => {
      const refreshedSummary = await getSummary(page);
      return refreshedSummary?.page ?? 0;
    })
    .toBe(1);
});

test("category advanced pagination preserves query params across page navigation", async ({ page }) => {
  await page.goto("/forum");

  const firstCategoryLink = page.locator(".category-quick-link").first();
  const categoryHref = await firstCategoryLink.getAttribute("href");
  test.skip(!categoryHref, "No category link available in this environment.");

  const separator = categoryHref!.includes("?") ? "&" : "?";
  await page.goto(`${categoryHref}${separator}sort=oldest&signal=active`);

  const summary = await getSummary(page);
  test.skip(!summary || summary.totalPages <= 1, "Category feed has one page only for selected filter.");

  const pagination = page.locator("nav[aria-label='Thread list pagination']");
  const lastLink = pagination.locator("a[title='Last page']");
  await expect(pagination).toBeVisible();
  await pagination.getByRole("link", { name: "Next" }).click();
  await expect(page).toHaveURL(/sort=oldest/);
  await expect(page).toHaveURL(/signal=active/);
  await expect(page).toHaveURL(/page=2/);

  await lastLink.click();
  await expect(page).toHaveURL(/sort=oldest/);
  await expect(page).toHaveURL(/signal=active/);
  await expect(page).toHaveURL(new RegExp(`page=${summary!.totalPages}`));
});
