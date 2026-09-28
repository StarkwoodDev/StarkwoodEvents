import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchNationalScreenings,
  formatScreeningDate,
  toNationalScreening,
  type PortalScreening,
} from "../cinema-portal";

const blacktown: PortalScreening = {
  date: "2026-09-27",
  time: "6:00 PM",
  state: "NSW",
  city: "Blacktown",
  chain: "Hoyts",
  venue: "Blacktown",
  screen: "Cinema 6",
  capacity: 125,
  soldOut: false,
};

describe("formatScreeningDate", () => {
  it("formats ISO dates like the existing schedule (27th Sept, 4th Oct)", () => {
    expect(formatScreeningDate("2026-09-27")).toBe("27th Sept");
    expect(formatScreeningDate("2026-10-04")).toBe("4th Oct");
    expect(formatScreeningDate("2026-10-01")).toBe("1st Oct");
    expect(formatScreeningDate("2026-10-22")).toBe("22nd Oct");
    expect(formatScreeningDate("2026-10-13")).toBe("13th Oct");
  });

  it("returns TBC for a missing or malformed date", () => {
    expect(formatScreeningDate(null)).toBe("TBC");
    expect(formatScreeningDate("soon")).toBe("TBC");
  });
});

describe("toNationalScreening", () => {
  it("builds the table row the movie spotlight renders", () => {
    expect(toNationalScreening(blacktown)).toEqual({
      date: "27th Sept",
      cinema: "Blacktown",
      details: "Blacktown | Cinema 6 (125 seats)",
      soldOut: false,
    });
  });

  it("leaves details empty when the screen isn't known yet", () => {
    const row = toNationalScreening({ ...blacktown, venue: "Regal (Adelaide)", screen: null, capacity: null });
    expect(row.cinema).toBe("Regal (Adelaide)");
    expect(row.details).toBe("");
  });
});

describe("fetchNationalScreenings", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the portal's screenings as table rows", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ film: { slug: "eda-ra" }, screenings: [blacktown] })),
      ),
    );
    const rows = await fetchNationalScreenings();
    expect(rows).toHaveLength(1);
    expect(rows![0].cinema).toBe("Blacktown");
  });

  it("returns null (use the built-in list) when the portal is down", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));
    expect(await fetchNationalScreenings()).toBeNull();
  });

  it("returns null on a non-200 response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 500 })));
    expect(await fetchNationalScreenings()).toBeNull();
  });

  it("returns null when the portal has no published screenings yet", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ screenings: [] }))),
    );
    expect(await fetchNationalScreenings()).toBeNull();
  });

  it("returns null when the response isn't the expected shape", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ oops: true }))));
    expect(await fetchNationalScreenings()).toBeNull();
  });
});
