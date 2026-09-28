import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));

vi.mock("@/sanity/client", () => ({
  client: { fetch: fetchMock },
}));

import { GET } from "../route";

describe("GET /api/health", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 200 ok when Sanity responds", async () => {
    fetchMock.mockResolvedValue(1);
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.checks.sanity).toBe("ok");
  });

  it("returns 503 degraded when Sanity is unreachable", async () => {
    fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(503);
    expect(body.status).toBe("degraded");
    expect(body.checks.sanity).toBe("error");
  });

  it("reports which env vars are configured without exposing their values", async () => {
    fetchMock.mockResolvedValue(1);
    process.env.RESEND_API_KEY = "re_secret_value";
    const res = await GET();
    const text = await res.text();
    expect(text).not.toContain("re_secret_value");
    expect(JSON.parse(text).checks.env.RESEND_API_KEY).toBe(true);
  });

  it("reports the Cinema Portal as down without marking the site degraded", async () => {
    fetchMock.mockResolvedValue(1);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));
    const res = await GET();
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.checks.cinemaPortal).toBe("error");
  });
});
