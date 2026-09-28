import { describe, it, expect } from "vitest";
import { schemaTypes } from "@/sanity/schemaTypes";

/**
 * Every `safeFetch`/`sanityFetch` call site in the app passes a tag string
 * that must exactly match a real Sanity document `_type` — the revalidation
 * webhook (app/api/revalidate/route.ts) calls `revalidateTag(body._type)`,
 * so a typo/mismatch here would silently break content updates for that
 * page while every other test stays green.
 *
 * This list is the known set of tag call sites as of this fix pass:
 * app/layout.tsx, app/page.tsx, app/events/page.tsx,
 * app/events/[slug]/page.tsx, app/gallery/page.tsx, app/services/page.tsx,
 * app/services/[slug]/page.tsx, app/contact/page.tsx.
 */
const TAGS_USED_ACROSS_THE_APP = [
  "event", // app/page.tsx, app/events/page.tsx, app/events/[slug]/page.tsx, app/gallery/page.tsx
  "service", // app/page.tsx, app/services/page.tsx, app/services/[slug]/page.tsx
  "testimonial", // app/page.tsx
  "sponsor", // app/page.tsx
  "siteSettings", // app/layout.tsx, app/page.tsx, app/contact/page.tsx
];

describe("sanityFetch tag / _type consistency", () => {
  const validTypeNames = schemaTypes.map((s) => s.name);

  it("has exactly the five expected Sanity document type names", () => {
    expect(validTypeNames.sort()).toEqual(
      ["event", "service", "siteSettings", "sponsor", "testimonial"].sort(),
    );
  });

  it("every tag string used across the app matches a real Sanity _type", () => {
    for (const tag of TAGS_USED_ACROSS_THE_APP) {
      expect(validTypeNames).toContain(tag);
    }
  });
});
