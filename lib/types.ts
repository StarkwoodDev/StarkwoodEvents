import type { SanityImageSource } from "@sanity/image-url";

export interface EventSummary {
  _id: string;
  title: string;
  slug: string;
  venue?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  coverImageUrl?: string;
  /** Raw Sanity image object — pass through `urlFor()` for an optimized, sized URL. */
  coverImage?: SanityImageSource;
  status: "upcoming" | "past";
  ticketUrl?: string;
  infoUrl?: string;
}

export interface SponsorRef {
  _id: string;
  name: string;
  logoUrl?: string;
  url?: string;
}

export interface EventDetail extends EventSummary {
  category?: string;
  starkwoodRole?: string;
  description?: unknown[]; // Portable Text blocks
  galleryUrls?: string[];
  infoUrl?: string;
  ticketUrl?: string;
  sponsors?: SponsorRef[];
}

export interface Service {
  _id: string;
  title: string;
  slug: string;
  icon?: string;
  summary?: string;
}

export interface ServiceDetail extends Service {
  description?: unknown[];
}

export interface Testimonial {
  _id: string;
  quote: string;
  author: string;
  role?: string;
}

export interface Sponsor {
  _id: string;
  name: string;
  logoUrl?: string;
  url?: string;
}

export interface SiteSettings {
  phone?: string;
  email?: string;
  address?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
}
