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

  const csp = headers["content-security-policy"];
  expect(csp).toBeTruthy();
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("base-uri 'self'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("form-action 'self'");

  const embedMode = process.env.SECURITY_EMBED_MODE === "allowlist" ? "allowlist" : "deny";
  if (embedMode === "deny") {
    expect(csp).toContain("frame-ancestors 'none'");
    expect(headers["x-frame-options"]).toBe("DENY");
    return;
  }

  expect(csp).toContain("frame-ancestors 'self'");
  const rawAllowlist = process.env.SECURITY_EMBED_ORIGINS ?? "";
  const allowlistedOrigins = rawAllowlist
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  for (const origin of allowlistedOrigins) {
    expect(csp).toContain(origin);
  }
  expect(headers["x-frame-options"]).toBeUndefined();
});
