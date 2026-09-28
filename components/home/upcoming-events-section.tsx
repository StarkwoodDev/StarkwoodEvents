"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MapPin, CalendarDays, Ticket, ExternalLink } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { formatEventDate } from "@/lib/format-date";
import type { EventSummary } from "@/lib/types";

function getCountdown(targetIso: string) {
  const diff = Math.max(0, new Date(targetIso).getTime() - Date.now());
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

// Temporary per-event overrides until this data lives in Sanity — keyed by slug.
const EVENT_OVERRIDES: Record<
  string,
  { logo?: string; ticketUrl?: string; infoUrl?: string }
> = {
  "naadha-gama-melbourne-2026": {
    logo: "/images/next-up/naadha-gama-logo.jpg",
    ticketUrl: "https://premier.ticketek.com.au/shows/show.aspx?sh=NGAPLVSM26",
    infoUrl: "https://naadhagama.lk/melbourne26",
  },
};

function CountdownTile({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex h-[107px] w-full flex-col items-center justify-center rounded-2xl border border-white/15 bg-white/10">
      <span className="font-mono text-4xl font-bold text-foreground">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-1 text-[11px] font-extrabold tracking-[0.15em] text-foreground/45">
        {label}
      </span>
    </div>
  );
}

export function UpcomingEventsSection({ events }: { events: EventSummary[] }) {
  const event = events[0];
  const [countdown, setCountdown] = useState(() =>
    event?.startDate ? getCountdown(event.startDate) : null,
  );

  useEffect(() => {
    if (!event?.startDate) return;
    const id = setInterval(() => setCountdown(getCountdown(event.startDate!)), 1000);
    return () => clearInterval(id);
  }, [event?.startDate]);

  if (!event) {
    return (
      <section className="mx-auto max-w-6xl px-6">
        <EmptyState message="New events coming soon" />
      </section>
    );
  }

  const override = EVENT_OVERRIDES[event.slug];
  const ticketHref = event.ticketUrl || override?.ticketUrl || `/events/${event.slug}`;
  const infoHref = event.infoUrl || override?.infoUrl;

  return (
    <section className="mx-auto max-w-6xl px-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] p-6 sm:p-12">
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/next-up/sidney-myer-music-bowl.jpg"
            alt="Aerial view of the Sidney Myer Music Bowl, the venue for Naadha Gama"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-[#c58b38]/10" />
        </div>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-block rounded-full border border-accent/35 bg-accent/10 px-4 py-1 text-xs font-semibold text-accent-2">
                Next up
              </span>
              {override?.logo && (
                <Image
                  src={override.logo}
                  alt={`${event.title} logo`}
                  width={96}
                  height={48}
                  className="h-7 w-auto rounded-sm object-contain"
                />
              )}
            </div>
            <h2 className="mt-6 font-display text-4xl font-bold text-foreground sm:text-[44px]">
              {event.title}
            </h2>
            {event.summary && <p className="mt-3 text-base text-muted-foreground">{event.summary}</p>}

            <div className="mt-6 space-y-3">
              {event.venue && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="size-4 text-foreground/50" />
                  <span className="font-medium text-foreground">Venue</span>
                  <span className="text-foreground/85">{event.venue}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="size-4 text-foreground/50" />
                <span className="font-medium text-foreground">Date</span>
                <span className="text-foreground/85">
                  {formatEventDate(event.startDate, event.endDate)}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href={ticketHref}
                target={ticketHref.startsWith("http") ? "_blank" : undefined}
                rel={ticketHref.startsWith("http") ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-semibold text-accent-foreground shadow-[0_10px_15px_rgba(197,139,56,0.35)] transition hover:brightness-110"
              >
                <Ticket className="size-[18px]" />
                {ticketHref.startsWith("http") ? "Get tickets" : "View event"}
              </a>
              {infoHref && (
                <a
                  href={infoHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-8 py-4 text-base font-semibold text-foreground transition hover:border-white/30"
                >
                  <ExternalLink className="size-[18px]" />
                  Event details
                </a>
              )}
            </div>
          </div>

          {countdown && (
            <div className="rounded-2xl border-t border-white/10 bg-background/40 p-6 backdrop-blur-sm lg:border-l lg:border-t-0 lg:pl-10">
              <p className="text-xs font-extrabold tracking-[0.2em] text-foreground/45">Doors open in</p>
              <div className="mt-4 grid grid-cols-4 gap-3">
                <CountdownTile value={countdown.days} label="Days" />
                <CountdownTile value={countdown.hours} label="Hours" />
                <CountdownTile value={countdown.minutes} label="Mins" />
                <CountdownTile value={countdown.seconds} label="Secs" />
              </div>
              <p className="mt-4 text-sm font-extrabold text-foreground/50">
                Counting down to {formatEventDate(event.startDate)}.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
