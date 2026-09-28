import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Note: the brief's original test mocked react-dom's `useFormState` to force
// the fallback path used by older React versions. In this project's React
// (19.2.8), `useActionState` is exported from "react", not "react-dom", so
// that mock has no bearing on this component and — worse — mocking the
// "react-dom" module (even via a spread of the actual exports) breaks
// @testing-library/react's own rendering, since RTL depends on react-dom
// internals. It has been removed; ContactForm already imports
// `useActionState` from "react" directly, matching the installed React
// version, so no mock of either package is needed here.

vi.mock("@/app/contact/actions", () => ({
  sendContactMessage: vi.fn(),
}));

import { sendContactMessage } from "@/app/contact/actions";
import { ContactForm } from "../contact-form";

describe("ContactForm", () => {
  it("shows a validation error and does not clear the phone/email fallback when the message is empty", async () => {
    // The real Server Action can't run against jsdom/RTL (no server round-trip),
    // so the mock stands in for it here, resolving with the same shape
    // `validateContactForm` would produce for an empty message. This keeps the
    // client and server agreeing on error shape without duplicating validation
    // logic in the test.
    vi.mocked(sendContactMessage).mockResolvedValue({
      status: "error",
      errors: { message: "Please enter a message." },
    });

    render(<ContactForm phone="+61 416 340 773" email="events@starkwood.au" />);

    expect(screen.getByText("+61 416 340 773")).toBeInTheDocument();
    expect(screen.getByText("events@starkwood.au")).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/name/i), "Jane Doe");
    await userEvent.type(screen.getByLabelText(/email/i), "jane@example.com");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    expect(await screen.findByText(/please enter a message/i)).toBeInTheDocument();
  });
});
