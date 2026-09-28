import type { EventSummary } from "./types";

/**
 * Events not yet published in Sanity (blocked on a missing write token /
 * manual Studio upload) but that need to be live on the site now. Remove
 * each entry here once its real CMS document is published — mergeStaticEvents
 * already prefers the CMS version by slug, so publishing is safe at any time.
 */
export const STATIC_EVENTS: (EventSummary & { category?: string })[] = [
  {
    _id: "static-raaga-26-melbourne-2026",
    title: "Raaga 26 (රාග 26)",
    slug: "raaga-26-melbourne-2026",
    status: "upcoming",
    category: "Concert",
    startDate: "2026-11-27",
    venue: "Location TBA",
    summary:
      "A new night of Sri Lankan music in Melbourne, featuring D Tap, Jaya Sri, Kaizer and more — presented with Southaura Events and Stereo6 Events.",
    coverImageUrl: "/images/events/raaga-26-poster.png",
  },
];

/** Merge static events into a CMS list, preferring the CMS document whenever a slug already exists there. */
export function mergeStaticEvents<T extends EventSummary>(
  cmsEvents: T[],
  statics: (EventSummary & { category?: string })[] = STATIC_EVENTS,
): T[] {
  const cmsSlugs = new Set(cmsEvents.map((e) => e.slug));
  const toAdd = statics.filter((e) => !cmsSlugs.has(e.slug));
  return [...cmsEvents, ...(toAdd as T[])];
}
