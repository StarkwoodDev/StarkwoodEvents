import { describe, it, expect } from "vitest";
import {
  upcomingEventsQuery,
  pastEventsQuery,
  eventBySlugQuery,
  servicesQuery,
  serviceBySlugQuery,
  testimonialsQuery,
  sponsorsQuery,
  siteSettingsQuery,
} from "../queries";

describe("GROQ queries", () => {
  it("event queries filter on _type == \"event\"", () => {
    expect(upcomingEventsQuery).toContain('_type == "event"');
    expect(pastEventsQuery).toContain('_type == "event"');
    expect(eventBySlugQuery).toContain('_type == "event"');
  });

  it("upcoming/past queries filter on status", () => {
    expect(upcomingEventsQuery).toContain('status == "upcoming"');
    expect(pastEventsQuery).toContain('status == "past"');
  });

  it("service queries filter on _type == \"service\"", () => {
    expect(servicesQuery).toContain('_type == "service"');
    expect(serviceBySlugQuery).toContain('_type == "service"');
  });

  it("testimonial and sponsor queries target the right types", () => {
    expect(testimonialsQuery).toContain('_type == "testimonial"');
    expect(sponsorsQuery).toContain('_type == "sponsor"');
  });

  it("siteSettings query targets siteSettings and takes the first doc", () => {
    expect(siteSettingsQuery).toContain('_type == "siteSettings"');
    expect(siteSettingsQuery).toContain("[0]");
  });
});
