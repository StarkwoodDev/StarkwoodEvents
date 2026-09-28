import { EventsExplorer } from "@/components/events/events-explorer";
import { safeFetch } from "@/sanity/client";
import { allEventsQuery } from "@/lib/queries";
import type { EventSummary } from "@/lib/types";
import type { StatusFilter } from "@/lib/filter-events";
import { mergeStaticEvents } from "@/lib/static-events";

export const metadata = { title: "Events | Starkwood Events" };

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const eventsCms = await safeFetch<(EventSummary & { category?: string })[]>(
    allEventsQuery,
    "event",
    [],
  );
  const events = mergeStaticEvents(eventsCms).sort((a, b) =>
    (b.startDate || "").localeCompare(a.startDate || ""),
  );
  const { status } = await searchParams;
  const initialStatus: StatusFilter =
    status === "upcoming" || status === "past" ? status : "all";

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl text-[var(--foreground)]">
        Our <span className="text-gradient-gold">Events</span>
      </h1>
      <div className="mt-8">
        <EventsExplorer events={events} initialStatus={initialStatus} />
      </div>
    </main>
  );
}
