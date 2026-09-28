import { groq } from "next-sanity";

export const upcomingEventsQuery = groq`
  *[_type == "event" && status == "upcoming"] | order(startDate asc) {
    _id, title, "slug": slug.current, venue, startDate, endDate, summary, status, ticketUrl, infoUrl,
    "coverImageUrl": coverImage.asset->url,
    coverImage
  }
`;

export const pastEventsQuery = groq`
  *[_type == "event" && status == "past"] | order(startDate desc) {
    _id, title, "slug": slug.current, venue, startDate, endDate, summary, status,
    "coverImageUrl": coverImage.asset->url,
    coverImage
  }
`;

export const allEventsQuery = groq`
  *[_type == "event"] | order(startDate desc) {
    _id, title, "slug": slug.current, venue, startDate, endDate, summary, status, category,
    "coverImageUrl": coverImage.asset->url,
    coverImage
  }
`;

export const eventBySlugQuery = groq`
  *[_type == "event" && slug.current == $slug][0] {
    _id, title, "slug": slug.current, venue, startDate, endDate, summary, status, category,
    starkwoodRole, description, infoUrl, ticketUrl,
    "coverImageUrl": coverImage.asset->url,
    coverImage,
    "galleryUrls": gallery[].asset->url,
    "sponsors": sponsors[]-> { _id, name, "logoUrl": logo.asset->url, url }
  }
`;

export const eventSlugsQuery = groq`*[_type == "event"].slug.current`;

export const servicesQuery = groq`
  *[_type == "service"] | order(order asc) {
    _id, title, "slug": slug.current, icon, summary
  }
`;

export const serviceBySlugQuery = groq`
  *[_type == "service" && slug.current == $slug][0] {
    _id, title, "slug": slug.current, icon, summary, description
  }
`;

export const serviceSlugsQuery = groq`*[_type == "service"].slug.current`;

export const testimonialsQuery = groq`
  *[_type == "testimonial"] { _id, quote, author, role }
`;

export const sponsorsQuery = groq`
  *[_type == "sponsor"] { _id, name, "logoUrl": logo.asset->url, url }
`;

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    phone, email, address, facebookUrl, instagramUrl, heroHeadline, heroSubheadline
  }
`;

export const eventGalleriesQuery = groq`
  *[_type == "event" && count(gallery) > 0] | order(startDate desc) {
    title, "slug": slug.current,
    "imageUrls": gallery[].asset->url
  }
`;
