import Link from "next/link";

export const metadata = { title: "Page not found | Starkwood Events" };

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="font-mono-num text-sm tracking-widest text-[var(--accent)] uppercase">404</p>
      <h1 className="mt-3 font-display text-4xl text-[var(--foreground)]">
        Page <span className="text-gradient-gold">not found</span>
      </h1>
      <p className="mt-4 text-[var(--muted-foreground)]">
        The page you&apos;re after has moved or never existed. The event may have wrapped up —
        see what&apos;s on next.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/events"
          className="rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] hover:opacity-90"
        >
          See events
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-white/5"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
