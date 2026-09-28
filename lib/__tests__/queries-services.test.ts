import { describe, it, expect } from "vitest";
import { servicesQuery, serviceBySlugQuery } from "../queries";

describe("service queries", () => {
  it("the list query selects the slug field (so each card links to its own page, not a shared anchor)", () => {
    expect(servicesQuery).toContain('"slug": slug.current');
  });

  it("the detail query filters by the given slug", () => {
    expect(serviceBySlugQuery).toContain("slug.current == $slug");
  });
});
