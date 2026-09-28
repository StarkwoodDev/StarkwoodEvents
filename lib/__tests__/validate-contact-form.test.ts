import { describe, it, expect } from "vitest";
import { validateContactForm } from "../validate-contact-form";

describe("validateContactForm", () => {
  it("passes for a complete, valid submission", () => {
    const result = validateContactForm({
      name: "Jane Doe",
      email: "jane@example.com",
      message: "I'd like to enquire about a corporate event.",
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("flags a missing name", () => {
    const result = validateContactForm({ name: "", email: "jane@example.com", message: "Hi" });
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it("flags an invalid email", () => {
    const result = validateContactForm({ name: "Jane", email: "not-an-email", message: "Hi" });
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  it("flags an empty message", () => {
    const result = validateContactForm({ name: "Jane", email: "jane@example.com", message: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.message).toBeDefined();
  });
});
