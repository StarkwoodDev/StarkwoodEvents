"use client";

import { useEffect } from "react";
import Link from "next/link";
import { DEFAULT_EMAIL, DEFAULT_PHONE } from "@/lib/site-config";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // The digest matches the server-side log entry in Vercel for this error.
    console.error("[app] render error", error.digest ?? "", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-mono-num text-sm tracking-widest text-[var(--accent)] uppercase">
        Something went wrong
      </p>
      <h1 className="mt-3 font-display text-4xl text-[var(--foreground)]">
        This page didn&apos;t <span className="text-gradient-gold">load</span>
      </h1>
      <p className="mt-4 text-[var(--muted-foreground)]">
        It&apos;s on our side, not yours. Try again, or reach us directly on{" "}
        <a href={`tel:${DEFAULT_PHONE.replace(/\s/g, "")}`} className="text-[var(--accent)] hover:underline">
          {DEFAULT_PHONE}
        </a>{" "}
        or{" "}
        <a href={`mailto:${DEFAULT_EMAIL}`} className="text-[var(--accent)] hover:underline">
          {DEFAULT_EMAIL}
        </a>
        .
      </p>
      <div className="mt-8 flex gap-4">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-white/5"
        >
          Back to home
        </Link>
      </div>
      {error.digest && (
        <p className="mt-6 font-mono-num text-xs text-[var(--muted-foreground)]">Ref: {error.digest}</p>
      )}
    </main>
  );
}
