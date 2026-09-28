import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Service } from "@/lib/types";

const SERVICE_IMAGES: Record<string, string> = {
  weddings: "/images/services/weddings.jpg",
  "corporate-events": "/images/services/corporate-events.jpg",
  "music-events": "/images/services/music-events.jpg",
  "charity-events": "/images/services/charity-events.jpg",
  "sporting-events": "/images/services/sporting-events.jpg",
  "food-wine-events": "/images/services/food-wine-events.jpg",
  "community-events": "/images/services/community-events.jpg",
};

function ServiceBackground({ slug }: { slug: string }) {
  const src = SERVICE_IMAGES[slug];
  if (!src) return null;
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit]">
      <Image src={src} alt="" fill className="object-cover opacity-20" />
    </div>
  );
}

// Figma's two large bento tiles use photography sized/cropped for that
// larger treatment (weddings, music/event-planning) — the rest are sized
// for the small tiles. Picking large-tile services by slug keeps that
// pairing correct regardless of the CMS's own ordering.
const LARGE_TILE_SLUGS = ["weddings", "music-events"];

export function ServicesTeaser({ services }: { services: Service[] }) {
  if (services.length === 0) return null;

  const large_tiles = LARGE_TILE_SLUGS.map((slug) =>
    services.find((s) => s.slug === slug),
  ).filter((s): s is Service => Boolean(s));
  const [featured, large] =
    large_tiles.length === 2 ? large_tiles : services.slice(0, 2);
  const rest = services.filter((s) => s !== featured && s !== large);

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="max-w-2xl">
        <h2 className="font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl">
          Planning first.
          <br />
          Everything else follows.
        </h2>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">
          Most clients come to us for one thing: someone to own the plan.
          From there we scale the team to the type of event you&apos;re
          running.
        </p>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <Link
          href={`/services/${featured.slug}`}
          className="relative rounded-3xl border border-white/[0.08] bg-card/70 p-10 backdrop-blur-md transition hover:border-accent/40"
        >
          <ServiceBackground slug={featured.slug} />
          <div className="flex size-12 items-center justify-center rounded-2xl bg-accent text-2xl">
            {featured.icon}
          </div>
          <h3 className="mt-8 font-display text-3xl font-bold leading-tight text-foreground">
            {featured.title}
          </h3>
          {featured.summary && (
            <p className="mt-4 max-w-md text-base font-medium text-muted-foreground">
              {featured.summary}
            </p>
          )}
          <span className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold text-foreground">
            Learn more
            <ArrowRight className="size-[15px]" />
          </span>
        </Link>

        {large && (
          <Link
            href={`/services/${large.slug}`}
            className="relative rounded-3xl border border-white/[0.08] bg-card/70 p-10 backdrop-blur-md transition hover:border-accent/40"
          >
            <ServiceBackground slug={large.slug} />
            <div className="flex size-12 items-center justify-center rounded-2xl border border-accent/35 bg-accent/10 text-2xl">
              {large.icon}
            </div>
            <h3 className="mt-8 font-display text-2xl font-bold text-foreground">{large.title}</h3>
            {large.summary && (
              <p className="mt-4 max-w-md text-[15px] font-medium text-muted-foreground">
                {large.summary}
              </p>
            )}
          </Link>
        )}
      </div>

      {rest.length > 0 && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((service) => (
            <Link
              key={service._id}
              href={`/services/${service.slug}`}
              className="relative rounded-2xl border border-white/[0.08] bg-card/70 p-6 backdrop-blur-md transition hover:border-accent/40"
            >
              <ServiceBackground slug={service.slug} />
              <div className="text-xl">{service.icon}</div>
              <p className="mt-9 font-display text-lg font-bold text-foreground">{service.title}</p>
              {service.summary && (
                <p className="mt-3 text-sm font-medium text-muted-foreground">{service.summary}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
