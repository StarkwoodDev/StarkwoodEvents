import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "../proxy";

describe("proxy", () => {
  it("redirects events.starkwood.au to starkwood.au, preserving path and query", () => {
    const req = new NextRequest("https://events.starkwood.au/events/naadha-gama?utm=fb", {
      headers: { host: "events.starkwood.au" },
    });
    const res = proxy(req);
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toBe(
      "https://starkwood.au/events/naadha-gama?utm=fb",
    );
  });

  it("does not redirect requests to starkwood.au itself", () => {
    const req = new NextRequest("https://starkwood.au/events", {
      headers: { host: "starkwood.au" },
    });
    const res = proxy(req);
    expect(res.status).toBe(200);
  });

  it("does not redirect fm.starkwood.au or staff.starkwood.au", () => {
    for (const host of ["fm.starkwood.au", "staff.starkwood.au"]) {
      const req = new NextRequest(`https://${host}/`, { headers: { host } });
      const res = proxy(req);
      expect(res.status).toBe(200);
    }
  });
});
