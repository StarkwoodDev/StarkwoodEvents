import { describe, it, expect } from "vitest";
import { DEFAULT_PHONE, DEFAULT_ADDRESS, DEFAULT_EMAIL } from "../site-config";

describe("site-config defaults", () => {
  it("has the correct phone number", () => {
    expect(DEFAULT_PHONE).toBe("+61 416 340 773");
  });

  it("has the correct address", () => {
    expect(DEFAULT_ADDRESS).toBe("Unit 2/198 Rooks Rd, Vermont VIC 3133");
  });

  it("has a non-empty default email", () => {
    expect(DEFAULT_EMAIL).toMatch(/@starkwood\.au$/);
  });
});
