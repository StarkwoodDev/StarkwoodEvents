import { describe, it, expect } from "vitest";
import { formatEventDate } from "../format-date";

describe("formatEventDate", () => {
  it("formats a single date", () => {
    expect(formatEventDate("2026-10-31")).toBe("31 October 2026");
  });

  it("formats a date range across two different dates", () => {
    expect(formatEventDate("2026-10-31", "2026-11-01")).toBe(
      "31 October 2026 – 1 November 2026",
    );
  });

  it("treats a same-day range as a single date", () => {
    expect(formatEventDate("2026-10-31", "2026-10-31")).toBe("31 October 2026");
  });

  it("returns a TBC label when no date is set", () => {
    expect(formatEventDate(undefined)).toBe("Date to be confirmed");
  });
});
