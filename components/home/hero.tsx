import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera } from "lucide-react";

export function Hero({ headline, subheadline }: { headline: string; subheadline: string }) {
  const [firstLine, accentLine] = headline.split("\n");

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/hero-bg-gala.jpg"
          alt="An elegant Starkwood Events gala dinner under string lights, with a live band on stage"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background from-10% via-background/90 via-45% to-background/55" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-40 sm:pt-48">
        <div className="max-w-2xl">
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-[76px]">
            {firstLine}
            {accentLine && <span className="block text-accent-2">{accentLine}</span>}
          </h1>

          <p className="mt-8 max-w-lg text-lg leading-relaxed text-muted-foreground">
            {subheadline}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-semibold text-accent-foreground shadow-[0_10px_15px_rgba(197,139,56,0.35)] transition hover:brightness-110"
            >
              Plan Your Event
              <ArrowRight className="size-[18px]" />
            </Link>
            <Link
              href="/events?status=upcoming"
              className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-8 py-4 text-base font-semibold text-foreground transition hover:border-white/30"
            >
              <Camera className="size-[18px]" />
              See Live &amp; Upcoming Events
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
