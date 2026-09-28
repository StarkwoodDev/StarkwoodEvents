import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("seed content", () => {
  it("never mentions Unforgettable Sri Lanka", () => {
    const seedSource = readFileSync(join(__dirname, "../seed.ts"), "utf-8");
    expect(seedSource.toLowerCase()).not.toContain("unforgettable sri lanka");
  });
});
