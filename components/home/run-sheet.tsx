"use client";

import { useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { formatEventDate } from "@/lib/format-date";
import type { EventSummary } from "@/lib/types";

type RunSheetEvent = EventSummary & { category?: string };
type StatusFilter = "all" | "upcoming" | "past";

const TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Completed" },
];

const STATUS_STYLES: Record<"upcoming" | "past", { badge: string; dot: string; label: string }> = {
  upcoming: {
    badge: "border-accent/40 bg-accent/10 text-accent-2",
    dot: "bg-accent-2",
    label: "Upcoming",
  },
  past: {
    badge: "border-white/12 bg-white/[0.04] text-foreground/60",
    dot: "bg-foreground/40",
    label: "Completed",
  },
};

export function RunSheet({ events }: { events: RunSheetEvent[] }) {
  const [filter, setFilter] = useState<StatusFilter>("all");

  const items = filter === "all" ? events : events.filter((e) => e.status === filter);

  return (
    <section className="border-y border-white/[0.06] bg-surface py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              On the run sheet
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              What&apos;s in production, and what we&apos;ve just wrapped.
            </p>
          </div>

          <div className="flex flex-wrap gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  filter === tab.key
                    ? "bg-accent text-accent-foreground"
                    : "text-foreground/60 hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mt-10">
            <EmptyState message="Nothing here right now — check back soon." />
          </div>
        ) : (
          <div className="no-scrollbar mt-10 flex gap-5 overflow-x-auto pb-2">
            {items.map((item) => {
              const styles = STATUS_STYLES[item.status];
              return (
                <a
                  key={item._id}
                  href={`/events/${item.slug}`}
                  className="flex w-[320px] shrink-0 flex-col rounded-2xl border border-white/[0.08] bg-card/70 p-6 backdrop-blur-md transition hover:border-accent/40"
                >
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${styles.badge}`}>
                      <span className={`size-1.5 rounded-full ${styles.dot}`} />
                      {styles.label}
                    </span>
                    {item.category && (
                      <span className="text-xs font-semibold uppercase tracking-wider text-foreground/45">
                        {item.category}
                      </span>
                    )}
                  </div>

                  <p className="mt-6 font-display text-xl font-bold text-foreground">{item.title}</p>
                  {item.venue && <p className="mt-3 text-sm text-muted-foreground">{item.venue}</p>}

                  <div className="mt-auto flex items-center justify-between border-t border-white/[0.06] pt-4 text-xs">
                    <span className="font-mono text-foreground/80">
                      {formatEventDate(item.startDate, item.endDate)}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
