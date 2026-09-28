import Link from "next/link";
import Image from "next/image";
import { formatEventDate } from "@/lib/format-date";
import { urlFor } from "@/sanity/image";
import type { SanityImageSource } from "@sanity/image-url";

interface EventCardProps {
  title: string;
  slug: string;
  venue?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  coverImageUrl?: string;
  coverImage?: SanityImageSource;
}

export function EventCard({
  title,
  slug,
  venue,
  startDate,
  endDate,
  summary,
  coverImageUrl,
  coverImage,
}: EventCardProps) {
  // Prefer the raw Sanity image object so we can request a capped, optimized
  // width via the image CDN instead of shipping the full-size original.
  const imageSrc = coverImage
    ? urlFor(coverImage).width(800).auto("format").url()
    : coverImageUrl;

  return (
    <Link
      href={`/events/${slug}`}
      className="group block overflow-hidden rounded-2xl border border-white/[0.08] bg-card/70 backdrop-blur-md transition hover:border-accent/40"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div
            data-testid="event-card-placeholder"
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-background"
          >
            <span className="font-display text-2xl text-gradient-gold">S</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
        {venue && <p className="mt-1 text-sm text-muted-foreground">{venue}</p>}
        <p className="mt-1 text-sm font-mono text-accent-2">{formatEventDate(startDate, endDate)}</p>
        {summary && <p className="mt-2 text-sm text-muted-foreground">{summary}</p>}
      </div>
    </Link>
  );
}
