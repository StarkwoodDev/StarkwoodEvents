# Starkwood Events Website Redesign — Design Spec

Date: 2026-08-19

## Background

Starkwood Pty Ltd currently runs three subdomains from a bare hub page at
`starkwood.au` (three buttons: Events, FM, Staff). The events site at
`events.starkwood.au` is a generic WordPress theme (Elevated Lite) that
undersells the business: broken "Read More" links (all ten services point to
the same anchor), a mismatched phone number, a placeholder social presence,
and a stale reference to a "partnership" with Unforgettable Sri Lanka that no
longer exists.

The company's actual portfolio — large-scale concert productions (confetti,
pyrotechnics, arena crowds), the Miss Earth Australia pageant, expo/exhibition
booths, and a ~20-person events team — reads as a full-scale event production
and entertainment company, not a generic wedding/party planner. The redesign
should reflect that.

## Scope

- Redesign becomes the **single, unified site at `starkwood.au`**.
- `events.starkwood.au` 301-redirects to `starkwood.au` for SEO continuity.
- `fm.starkwood.au` and `staff.starkwood.au` are **out of scope** — left
  untouched, not linked prominently (at most a small footer reference).
- Full rebuild off WordPress is approved. Content changes are infrequent, but
  the client (Dhanuka) wants a lightweight CMS to add/edit upcoming events and
  site details without code changes.

## Brand

- Logo: black background, gold/bronze gradient crown-and-wings "S" monogram,
  serif "STARKWOOD" wordmark with an "EVENTS" subtitle beneath a thin gold
  rule.
- Palette: near-black backgrounds (`#0a0a0a`–`#141414`), gold gradient accent
  matching the logo (`#caa14b` → `#f4dfa1`), warm off-white body text,
  charcoal card surfaces.
- Typography: elegant serif for headings (echoing the wordmark), clean
  sans-serif for body copy.
- Imagery: full-bleed photography from the company's own event photos, dark
  gradient overlays for text legibility, thin gold dividers under section
  headings (echoing the logo's underline motif).
- Motion: restrained — fade/slide-in on scroll, gold underline on hover.

## Corrected contact details

- Phone: **+61 416 340 773** (the current site shows a mismatched +1300
  number in one place and this correct number in another — standardize on
  this one everywhere).
- Address: **Unit 2/198 Rooks Rd, Vermont VIC 3133**.
- Remove the "Unforgettable Sri Lanka" partnership claim — that partnership
  no longer exists and must not appear anywhere on the new site (not as a
  sponsor logo, not in copy).

## Site structure

- `/` — Home: hero (rotating event photography), brief intro, services
  overview, upcoming events preview, **past projects showcase**, gallery
  highlights, testimonials, sponsor logos, contact CTA.
- `/events` — Full events list (upcoming + past), filterable by category
  (Concerts, Pageants, Corporate, Expos, etc).
- `/events/[slug]` — Individual event page: date, venue, description, photo
  gallery, sponsors.
- `/gallery` — Photo gallery organized by event.
- `/services` — The 10 existing service categories (Weddings, Corporate
  Events, Music Events, Personal Events & Parties, Charity Events, Cultural
  Events, Sporting Events, Food & Wine Events, Community Events, Other
  Events), each with real content and a working detail link — fixes the
  current site's broken "Read More" bug.
- `/about` — Company story + team photo.
- `/contact` — Corrected address/phone/email, contact form.
- `/studio` — Embedded Sanity Studio, auth-protected, where Dhanuka manages
  events and site content.

## Content model (Sanity)

- **Event** — title, slug, date/date range, venue, category, cover image,
  photo gallery, rich-text description, status (upcoming/past), linked
  sponsors, external ticket/info URL (optional). Event pages show headline
  info only (artists, venue, date, Starkwood's role, key partners) — not
  full crew/credit lists (band members, engineers, individual
  photographers), to keep pages clean and premium-feeling rather than dense
  credit blocks.
- **Testimonial** — quote, author, role/company.
- **Sponsor/Partner** — name, logo, link.
- **Service** — title, icon, description.
- **Site Settings** — phone, email, address, social links, hero content.

### Seed content for launch

#### Upcoming

- **Naadha Gama Melbourne 2026**
  - Date: **31 October 2026**
  - Venue: Sidney Myer Music Bowl, Melbourne (venue partner: Arts Centre
    Melbourne)
  - Info URL: https://naadhagama.lk/melbourne26
  - Description: reimagined live concert extension of the "Naadha Gama 360"
    experience with Eshan Denipitiya and The Orchestra of Eshan Denipitiya,
    featuring Methun SK, Ridma Weerawardena, Dhanith Sri, Supun Perera,
    Dinesh Gamage, Kanchana Anuradhi, and Manuranga Wijesekara. Billed as
    "a new chapter for Sri Lankan music in Australia."
  - Starkwood role: Production Partner. Other partners: Maaz Events, Mega
    Live Events, My Flight Zone, Sanni 18, Ticketek Australia (ticketing),
    Shawn Mendis Lawyers (legal), Aus News Lanka (online).
  - Tickets: via Ticketek —
    premier.ticketek.com.au/shows/show.aspx?sh=NGAPLVSM26

#### Past projects

- **Dhwani (ධ්වනි) Live in Concert 2025** — Melbourne, 7–9 Nov 2025, The Besen
  Centre. Starkwood role: Production (Production Manager: Buddhika
  Jayasinghe). Producers: Awakasha Entertainment. Artists: Ridma
  Weerasinghe/DW, Amandya Uthpalie, Raween Kanishka, Dhanith Sri. Full crew
  (band, audio, lighting, photography) available from the Instagram posts if
  useful for an "our team" style credit block.
- **Sarith Surith and the News x Hana Shafa — Live in Melbourne** — 14 Nov
  2025, Melbourne Pavilion. Starkwood role: Event Production (Event
  Director: Buddhika Jayasinghe). Executive Producers: A9 Events, Stereo 6
  Events, South Aura Events.
- **Home Lands Prestige Night 2025** — Melbourne, 28 Oct 2025, Springvale
  City Hall. Great Gatsby / vintage theme, with Home Lands Australia.
- **News Live on Tour 2025 — Melbourne** — 12 Oct 2025.
- **Aluth Kalawak — Melbourne Edition** — 13 Oct 2023, Trak Live Lounge Bar.
  Starkwood role: Production Managed. Organized by 7 Zone Entertainment &
  Nexxt Entertainment; presented by Janith Perera & ShowUp Global. Lineup:
  IRAJ, Bathiya and Santhush (BNS), Ashanthi de Alwis, Sureni, 6th Lane,
  FillT, Romesh Sugathapala, Centigradz, Randhir Witana, La Signore. Band:
  Midlane. DJ: Rush Thambawita. Compere: Wasantha Duggannarala. This is the
  event pictured in `Imgs/concert.jpg` (the Starkwood logo is visible in the
  on-screen sponsor row) — use that photo as its cover image.
- **Ru Sanda Rae Finale Tour — Australian Tour 2024** — Melbourne, Palais
  Theatre, St Kilda, ~Sept 2024. Lineup: Rookantha, Chandralekha, Raini,
  Windy, Sanuka, Suresh. Legal Partner: Shawn Mendis Lawyers. **No first-party
  Starkwood photos of this event were found** — the only images located were
  third-party news photography (SNNI/"What's Doing In Melbourne"), which
  should not be reused on the site. Dhanuka to supply Starkwood's own photos
  for this entry before launch, or launch it as a text-only past-project
  entry until photos are available.

Photo gallery for the other seed events is drawn from the `Imgs/` folder
provided, once existing partnership claims (e.g. Unforgettable Sri Lanka) are
stripped out of any captions.

## Architecture

- **Next.js (App Router, TypeScript)** + **Tailwind CSS** + **shadcn/ui**
  primitives, themed to the black/gold palette above.
- **Sanity** as the CMS; Studio embedded in the same Next.js app at
  `/studio`. Chosen over a self-hosted CMS (e.g. Payload) because it needs
  zero server/database maintenance — the right trade-off for a small business
  site with infrequent but non-technical content updates.
- **next/image** with Sanity's image CDN as the loader, for optimized,
  responsive delivery of the large source JPGs.
- **ISR with on-demand revalidation**: a webhook from Sanity triggers
  revalidation of the affected page within seconds of a save in Studio.
- **Vercel** hosting. `starkwood.au` is the primary domain; a redirect rule
  sends `events.starkwood.au` traffic to `starkwood.au`.
- Contact form via a Next.js Server Action → transactional email (e.g.
  Resend) to `events@starkwood.au`, with phone/email shown as a fallback if
  submission fails.

## Error handling / edge cases

- No upcoming events → friendly empty state ("New events coming soon"),
  never a blank list.
- Missing event image → branded placeholder, never a broken image icon.
- Contact form submit failure → inline error message, phone/email fallback
  shown alongside the form.

## QA plan

- Responsive pass across mobile/tablet/desktop (image-heavy site, must load
  well on phones).
- Lighthouse performance + accessibility check.
- Manual verification that every service and event link resolves to real
  content (the specific bug being fixed from the current site).
- Confirm no residual "Unforgettable Sri Lanka" partnership references
  anywhere in copy, images, or sponsor lists.
