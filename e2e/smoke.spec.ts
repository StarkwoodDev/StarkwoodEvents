import { test, expect } from "@playwright/test";

test("home page loads and shows the hero and footer phone number", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText(/events/i);
  // The phone number correctly appears twice — in the header's quick-call
  // link and in the footer — so scope this to the footer specifically,
  // matching the test's stated intent, to avoid a Playwright strict-mode
  // ambiguity between the two.
  await expect(page.getByRole("contentinfo").getByText("+61 416 340 773")).toBeVisible();
});

test("events list shows the seeded upcoming event", async ({ page }) => {
  await page.goto("/events");
  await expect(page.getByText("Naadha Gama Melbourne 2026")).toBeVisible();
});

test("event detail page loads for the seeded upcoming event", async ({ page }) => {
  await page.goto("/events/naadha-gama-melbourne-2026");
  await expect(page.locator("h1")).toContainText("Naadha Gama Melbourne 2026");
  await expect(page.getByText("Sidney Myer Music Bowl", { exact: false })).toBeVisible();
});

test("gallery page loads", async ({ page }) => {
  const res = await page.goto("/gallery");
  expect(res?.status()).toBe(200);
});

test("services page links to ten distinct detail pages (regression: the old site pointed every Read More at the same anchor)", async ({
  page,
}) => {
  await page.goto("/services");
  const hrefs = await page.locator("a[href^='/services/']").evaluateAll((links) =>
    links.map((l) => (l as HTMLAnchorElement).getAttribute("href")),
  );
  const uniqueHrefs = new Set(hrefs);
  expect(uniqueHrefs.size).toBe(10);
});

test("about page loads with the team photo", async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator("img[alt='The Starkwood Events team']")).toBeVisible();
});

test("contact form shows a validation error on empty submit", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: /send/i }).click();
  await expect(page.getByText(/please enter/i).first()).toBeVisible();
});

test("no page anywhere mentions the removed Unforgettable Sri Lanka partnership", async ({
  page,
}) => {
  for (const path of ["/", "/events", "/gallery", "/services", "/about", "/contact"]) {
    await page.goto(path);
    await expect(page.getByText(/unforgettable sri lanka/i)).toHaveCount(0);
  }
});
