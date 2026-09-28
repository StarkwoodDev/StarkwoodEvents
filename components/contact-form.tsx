"use client";

import { useActionState } from "react";
import { sendContactMessage, type ContactActionState } from "@/app/contact/actions";

const initialState: ContactActionState = { status: "idle", errors: {} };

export function ContactForm({ phone, email }: { phone: string; email: string }) {
  const [state, formAction] = useActionState(sendContactMessage, initialState);

  return (
    <div>
      <form action={formAction} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="block text-sm text-[var(--foreground)]">
            Name
          </label>
          <input
            id="name"
            name="name"
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-2"
          />
          {state.errors.name && (
            <p className="mt-1 text-sm text-red-400">{state.errors.name}</p>
          )}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm text-[var(--foreground)]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-2"
          />
          {state.errors.email && (
            <p className="mt-1 text-sm text-red-400">{state.errors.email}</p>
          )}
        </div>
        <div>
          <label htmlFor="message" className="block text-sm text-[var(--foreground)]">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-2"
          />
          {state.errors.message && (
            <p className="mt-1 text-sm text-red-400">{state.errors.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="rounded-md bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--accent-foreground)]"
        >
          Send message
        </button>
      </form>

      {state.status === "success" && (
        <p className="mt-4 text-sm text-[var(--accent)]">
          Thanks — we&apos;ll be in touch shortly.
        </p>
      )}
      <p className="mt-6 text-sm text-[var(--muted-foreground)]">
        {state.message ? `${state.message} ` : "Prefer to reach us directly? "}
        Call <span className="text-[var(--accent)]">{phone}</span> or email{" "}
        <span className="text-[var(--accent)]">{email}</span>.
      </p>
    </div>
  );
}
