import { describe, it, expect } from "vitest";
import { filterEventsByCategory, filterEventsByStatus } from "../filter-events";
import type { EventSummary } from "../types";

const events = [
  { _id: "1", title: "A", slug: "a", status: "upcoming", category: "Concert" },
  { _id: "2", title: "B", slug: "b", status: "past", category: "Pageant" },
  { _id: "3", title: "C", slug: "c", status: "past", category: "Concert" },
] as unknown as (EventSummary & { category: string })[];

describe("filterEventsByCategory", () => {
  it("returns all events when category is \"All\"", () => {
    expect(filterEventsByCategory(events, "All")).toHaveLength(3);
  });

  it("returns only events matching the given category", () => {
    const result = filterEventsByCategory(events, "Concert");
    expect(result.map((e) => e._id)).toEqual(["1", "3"]);
  });

  it("returns an empty array when no events match", () => {
    expect(filterEventsByCategory(events, "Expo")).toEqual([]);
  });
});

describe("filterEventsByStatus", () => {
  it("returns all events when status is \"all\"", () => {
    expect(filterEventsByStatus(events, "all")).toHaveLength(3);
  });

  it("returns only upcoming events", () => {
    expect(filterEventsByStatus(events, "upcoming").map((e) => e._id)).toEqual(["1"]);
  });

  it("returns only past events", () => {
    expect(filterEventsByStatus(events, "past").map((e) => e._id)).toEqual(["2", "3"]);
  });
});
