import { expect, test } from "@playwright/test";

test("baseline security headers are returned", async ({ request }) => {
  const response = await request.get("/health");
  expect(response.ok()).toBeTruthy();

  const headers = response.headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["x-dns-prefetch-control"]).toBe("off");
  expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
});
