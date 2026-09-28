"use client";

import { useState } from "react";
import { EventCard } from "@/components/event-card";
import { EmptyState } from "@/components/empty-state";
import { filterEventsByCategory, filterEventsByStatus, type StatusFilter } from "@/lib/filter-events";
import type { EventSummary } from "@/lib/types";

const CATEGORIES = ["All", "Concert", "Pageant", "Corporate", "Expo", "Cultural", "Other"];
const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "upcoming", label: "Upcoming & Live" },
  { key: "past", label: "Past" },
];

export function EventsExplorer({
  events,
  initialStatus = "all",
}: {
  events: (EventSummary & { category?: string })[];
  initialStatus?: StatusFilter;
}) {
  const [status, setStatus] = useState<StatusFilter>(initialStatus);
  const [category, setCategory] = useState("All");
  const filtered = filterEventsByCategory(filterEventsByStatus(events, status), category);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatus(tab.key)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
              status === tab.key
                ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              category === c
                ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-foreground)]"
                : "border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {filtered.length === 0 ? (
          <EmptyState message="No events in this category yet" />
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {filtered.map((e) => (
              <EventCard key={e._id} {...e} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
