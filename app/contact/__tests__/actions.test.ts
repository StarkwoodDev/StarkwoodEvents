import { describe, it, expect, vi, beforeEach } from "vitest";

const send = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn(function Resend() {
    return { emails: { send } };
  }),
}));

import { sendContactMessage } from "../actions";

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const valid = form({
  name: "Jane",
  email: "jane@example.com",
  message: "We'd like to book you for an event.",
});

const idle = { status: "idle" as const, errors: {} };

describe("sendContactMessage", () => {
  beforeEach(() => {
    send.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("reports success when Resend accepts the email", async () => {
    send.mockResolvedValue({ data: { id: "abc" }, error: null });
    const result = await sendContactMessage(idle, valid);
    expect(result.status).toBe("success");
  });

  it("reports an error when Resend returns an error instead of throwing", async () => {
    // Resend's SDK resolves with { error } for API failures (bad key, unverified
    // sender, quota) rather than rejecting, so the action must check it.
    send.mockResolvedValue({
      data: null,
      error: { name: "invalid_from_address", message: "Domain not verified" },
    });
    const result = await sendContactMessage(idle, valid);
    expect(result.status).toBe("error");
    expect(result.message).toMatch(/call or email us/);
  });

  it("reports an error when the Resend call throws", async () => {
    send.mockRejectedValue(new Error("network down"));
    const result = await sendContactMessage(idle, valid);
    expect(result.status).toBe("error");
  });
});
