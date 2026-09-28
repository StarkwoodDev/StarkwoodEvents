import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const { parseBodyMock } = vi.hoisted(() => ({ parseBodyMock: vi.fn() }));

vi.mock("next-sanity/webhook", () => ({
  parseBody: parseBodyMock,
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

import { POST } from "../route";
import { revalidateTag } from "next/cache";

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    parseBodyMock.mockReset();
    vi.mocked(revalidateTag).mockReset();
  });

  it("returns 401 when the webhook signature is invalid", async () => {
    parseBodyMock.mockResolvedValue({ isValidSignature: false, body: undefined });
    const req = new NextRequest("http://localhost/api/revalidate", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("revalidates the tag and returns 200 for a valid signature and _type", async () => {
    parseBodyMock.mockResolvedValue({
      isValidSignature: true,
      body: { _type: "event" },
    });
    const req = new NextRequest("http://localhost/api/revalidate", { method: "POST" });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.revalidated).toBe(true);
    expect(revalidateTag).toHaveBeenCalledWith("event", { expire: 0 });
  });
});
