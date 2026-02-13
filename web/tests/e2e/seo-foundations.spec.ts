import { expect, test } from "@playwright/test";

test("robots.txt is reachable and includes sitemap + private disallow rules", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.ok()).toBeTruthy();

  const body = await response.text();
  expect(body).toContain("Sitemap:");
  expect(body).toContain("Disallow: /admin");
  expect(body).toContain("Disallow: /moderation");
  expect(body).toContain("Disallow: /auth");
});

test("sitemap.xml is reachable and includes core public routes", async ({ request }) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBeTruthy();

  const body = await response.text();
  expect(body).toContain("<loc>");
  expect(body).toMatch(/<loc>https?:\/\/[^<]+\/<\/loc>/);
  expect(body).toMatch(/<loc>https?:\/\/[^<]+\/forum<\/loc>/);
  expect(body).toMatch(/<loc>https?:\/\/[^<]+\/categories<\/loc>/);
  expect(body).toMatch(/<loc>https?:\/\/[^<]+\/resources<\/loc>/);
});
