import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { urlFor } from "@/sanity/image";
import type { EventSummary } from "@/lib/types";

const FALLBACK_IMAGES = Array.from(
  { length: 10 },
  (_, i) => `/images/recent-work/figma-${i + 1}.jpg`,
);

// Real event photos not yet uploaded as the event's coverImage in Sanity — keyed by slug.
const REAL_PHOTO_OVERRIDES: Record<string, string> = {
  "ru-sanda-rae-finale-tour-2024": "/images/recent-work/ru-sanda-rae-real.jpg",
};

export function PastProjectsSection({ events }: { events: EventSummary[] }) {
  if (events.length === 0) return null;

  const items = events.slice(0, 9);

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-4xl font-bold text-foreground sm:text-5xl">Recent work</h2>
          <p className="mt-4 max-w-lg text-base text-muted-foreground">
            A look at our last few productions, across cultural, corporate
            and community events.
          </p>
        </div>
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-sm font-extrabold text-accent-2 transition hover:text-accent"
        >
          Request the full portfolio
          <ArrowRight className="size-[15px]" />
        </Link>
      </div>

      <div className="mt-12 columns-1 gap-6 sm:columns-2 lg:columns-3 [&>*]:mb-6 [&>*]:break-inside-avoid">
        {items.map((event, i) => {
          const imageSrc =
            REAL_PHOTO_OVERRIDES[event.slug] ||
            (event.coverImage
              ? urlFor(event.coverImage).width(700).auto("format").url()
              : event.coverImageUrl) ||
            FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];

          return (
            <Link
              key={event._id}
              href={`/events/${event.slug}`}
              className={`relative block overflow-hidden rounded-2xl border border-white/[0.07] ${
                i % 3 === 1 ? "aspect-[3/2]" : "aspect-[3/4]"
              }`}
            >
              <Image
                src={imageSrc}
                alt={event.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background/95 to-transparent" />
              <p className="absolute bottom-4 left-4 text-xs font-semibold tracking-wider text-foreground/85">
                {event.title}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
