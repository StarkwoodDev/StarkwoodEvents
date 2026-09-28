import Link from "next/link";
import { safeFetch } from "@/sanity/client";
import { servicesQuery } from "@/lib/queries";
import type { Service } from "@/lib/types";

export const metadata = { title: "Services | Starkwood Events" };

export default async function ServicesPage() {
  const services = await safeFetch<Service[]>(servicesQuery, "service", []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl text-[var(--foreground)]">
        Our <span className="text-gradient-gold">Services</span>
      </h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {services.map((s) => (
          <div
            key={s._id}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6"
          >
            <div className="text-3xl">{s.icon}</div>
            <h2 className="mt-3 font-display text-xl text-[var(--foreground)]">{s.title}</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{s.summary}</p>
            <Link
              href={`/services/${s.slug}`}
              className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline"
            >
              Read more →
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
