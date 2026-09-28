import type { EventSummary } from "./types";

type CategorizedEvent = EventSummary & { category?: string };

export function filterEventsByCategory<T extends CategorizedEvent>(
  events: T[],
  category: string,
): T[] {
  if (category === "All") return events;
  return events.filter((e) => e.category === category);
}

export type StatusFilter = "all" | "upcoming" | "past";

export function filterEventsByStatus<T extends EventSummary>(
  events: T[],
  status: StatusFilter,
): T[] {
  if (status === "all") return events;
  return events.filter((e) => e.status === status);
}
