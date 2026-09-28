import { Hero } from "@/components/home/hero";
import { ServicesTeaser } from "@/components/home/services-teaser";
import { UpcomingEventsSection } from "@/components/home/upcoming-events-section";
import { MovieSpotlight } from "@/components/home/movie-spotlight";
import { RunSheet } from "@/components/home/run-sheet";
import { Stats } from "@/components/home/stats";
import { PastProjectsSection } from "@/components/home/past-projects-section";
import { ContactCta } from "@/components/home/contact-cta";
import { safeFetch } from "@/sanity/client";
import {
  upcomingEventsQuery,
  pastEventsQuery,
  allEventsQuery,
  servicesQuery,
  siteSettingsQuery,
} from "@/lib/queries";
import type { EventSummary, Service, SiteSettings } from "@/lib/types";
import { DEFAULT_PHONE, DEFAULT_EMAIL } from "@/lib/site-config";
import { mergeStaticEvents } from "@/lib/static-events";

export default async function HomePage() {
  const [upcomingCms, past, allEventsCms, services, settings] = await Promise.all([
    safeFetch<EventSummary[]>(upcomingEventsQuery, "event", []),
    safeFetch<EventSummary[]>(pastEventsQuery, "event", []),
    safeFetch<(EventSummary & { category?: string })[]>(allEventsQuery, "event", []),
    safeFetch<Service[]>(servicesQuery, "service", []),
    safeFetch<SiteSettings | null>(siteSettingsQuery, "siteSettings", null),
  ]);

  // Not-yet-published-in-Sanity events, merged in so they show immediately —
  // see lib/static-events.ts for why and how to remove an entry.
  const upcoming = mergeStaticEvents(upcomingCms).sort((a, b) =>
    (a.startDate || "").localeCompare(b.startDate || ""),
  );
  const allEvents = mergeStaticEvents(allEventsCms).sort((a, b) =>
    (b.startDate || "").localeCompare(a.startDate || ""),
  );

  const phone = settings?.phone || DEFAULT_PHONE;
  const email = settings?.email || DEFAULT_EMAIL;

  return (
    <main>
      <Hero
        headline={
          settings?.heroHeadline || "We plan and run the events\nAustralia turns up for."
        }
        subheadline={
          settings?.heroSubheadline ||
          "Starkwood is a Melbourne event management company. Full-service planning and production: concept, permits, suppliers, run sheets and on-the-day delivery for weddings, corporate, sports, charity, cultural, community and live events."
        }
      />
      <div className="relative mt-8 sm:mt-10">
        <UpcomingEventsSection events={upcoming} />
      </div>
      <MovieSpotlight />
      <ServicesTeaser services={services} />
      <RunSheet events={allEvents} />
      <Stats />
      <PastProjectsSection events={past} />
      <ContactCta phone={phone} email={email} />
    </main>
  );
}
