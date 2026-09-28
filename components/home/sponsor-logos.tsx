import Image from "next/image";
import type { Sponsor } from "@/lib/types";

export function SponsorLogos({ sponsors }: { sponsors: Sponsor[] }) {
  if (sponsors.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-center gap-8 opacity-80">
        {sponsors.map((s) =>
          s.logoUrl ? (
            <Image
              key={s._id}
              src={s.logoUrl}
              alt={s.name}
              width={120}
              height={48}
              className="h-10 w-auto object-contain grayscale transition hover:grayscale-0"
            />
          ) : (
            <span key={s._id} className="text-sm text-[var(--muted-foreground)]">
              {s.name}
            </span>
          ),
        )}
      </div>
    </section>
  );
}
