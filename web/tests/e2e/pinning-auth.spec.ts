import { expect, test, type Locator, type Page } from "@playwright/test";

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;

test.describe.configure({ mode: "serial" });

async function login(page: Page) {
  if (!email || !password) {
    test.skip(true, "Set E2E_TEST_EMAIL and E2E_TEST_PASSWORD to run pinning auth e2e tests.");
  }

  await page.goto("/auth/login");
  await page.getByLabel("Email").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/forum$/, { timeout: 15_000 });
}

async function findFirstPinButton(page: Page): Promise<Locator | null> {
  const rows = page.locator(".thread-row");
  const rowCount = await rows.count();

  for (let index = 0; index < rowCount; index += 1) {
    const row = rows.nth(index);
    const pinButton = row.getByRole("button", { name: /^(Pin|Pinned)$/ });
    if ((await pinButton.count()) > 0) {
      return pinButton.first();
    }
  }

  return null;
}

test("mod/admin can toggle thread pin button state from discovery feed", async ({ page }) => {
  await login(page);
  await page.goto("/forum");

  const pinButton = await findFirstPinButton(page);
  test.skip(!pinButton, "No Pin/Pinned controls found. Ensure E2E_TEST account has mod/admin role and threads exist.");

  const initialLabel = (await pinButton!.innerText()).trim();
  const targetLabel = initialLabel === "Pinned" ? "Pin" : "Pinned";

  await pinButton!.click();
  await expect(pinButton!).toHaveText(targetLabel);

  if (targetLabel === "Pinned") {
    await expect(pinButton!).toHaveClass(/pin-thread-btn-pinned/);
  } else {
    await expect(pinButton!).toHaveClass(/pin-thread-btn-unpinned/);
  }

  // Restore original state so the test is repeatable.
  await pinButton!.click();
  await expect(pinButton!).toHaveText(initialLabel);
});
