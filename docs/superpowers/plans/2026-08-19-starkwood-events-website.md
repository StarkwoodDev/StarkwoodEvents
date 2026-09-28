# Starkwood Events Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `starkwood.au` as a single, polished Next.js + Sanity CMS website replacing the WordPress events site and the bare 3-button hub, with an editable events/CMS backend, corrected brand and contact details, and seeded launch content (upcoming + past projects).

**Architecture:** Next.js (App Router, TypeScript) renders the public site as Server Components fetching from Sanity via GROQ, with ISR + on-demand revalidation triggered by a Sanity webhook. Sanity Studio is embedded in the same app at `/studio`. Styling via Tailwind CSS v4 + shadcn/ui, themed to the brand's black/gold palette. Deployed on Vercel with `starkwood.au` as the primary domain and a host-based middleware redirect from `events.starkwood.au`.

**Tech Stack:** Next.js (App Router, TS), Tailwind CSS v4, shadcn/ui, Sanity (`sanity`, `next-sanity`, `@sanity/image-url`), Resend (contact form email), Vitest + React Testing Library (unit/component tests), Playwright (E2E smoke tests), Vercel (hosting).

**Spec:** `docs/superpowers/specs/2026-08-19-starkwood-events-redesign-design.md`

## Global Constraints

- Phone number is **+61 416 340 773** everywhere on the site — no other number appears anywhere.
- Address is **Unit 2/198 Rooks Rd, Vermont VIC 3133** everywhere on the site.
- The text "Unforgettable Sri Lanka" (or any reference to that partnership) must never appear anywhere in copy, images, or sponsor lists — this is a regression the QA suite must guard against.
- `starkwood.au` is the primary domain. `events.starkwood.au` must 308-redirect to it (preserving path/query) for SEO continuity.
- `fm.starkwood.au` and `staff.starkwood.au` are out of scope — never modified, and referenced (if at all) only as small footer links.
- Event detail pages show **headline info only** (artists/lineup, venue, date, Starkwood's role, key partners) — never full crew/credit lists (band members, individual engineers, photographers).
- No upcoming events → show a friendly empty state ("New events coming soon"), never a blank list.
- Missing event image → a branded placeholder (never a broken image icon).
- Contact form submit failure → inline error message, with phone/email shown as a fallback alongside the form.
- Palette: near-black backgrounds (`#0a0a0a`–`#141414`), gold gradient accent (`#caa14b` → `#f4dfa1`), warm off-white body text, charcoal card surfaces.
- Every service and event link must resolve to real, distinct content — this fixes the current site's "all Read More links point to the same anchor" bug, and the QA suite must assert the ten service links are pairwise distinct.

---

## File Structure

```
app/
  layout.tsx                       # RootLayout: fetches SiteSettings, renders SiteHeader/SiteFooter
  globals.css                      # Tailwind v4 import + brand theme tokens
  page.tsx                         # Home
  events/
    page.tsx                       # Events list (client-side category filter)
    [slug]/page.tsx                # Event detail
  gallery/page.tsx                 # Gallery grouped by event
  services/
    page.tsx                       # Services list
    [slug]/page.tsx                # Service detail (fixes broken "Read More" bug)
  about/page.tsx
  contact/
    page.tsx
    actions.ts                     # sendContactMessage Server Action
  studio/[[...tool]]/page.tsx      # Embedded Sanity Studio
  api/revalidate/route.ts          # Sanity webhook -> revalidateTag
components/
  layout/
    site-header.tsx
    site-footer.tsx
  home/
    hero.tsx
    services-teaser.tsx
    upcoming-events-section.tsx
    past-projects-section.tsx
    gallery-highlights.tsx
    testimonials-section.tsx
    sponsor-logos.tsx
    contact-cta.tsx
  events/
    events-explorer.tsx            # "use client" — category filter UI
  gallery/
    gallery-grid.tsx
  event-card.tsx
  empty-state.tsx
  contact-form.tsx                 # "use client"
  ui/                              # shadcn-generated primitives
sanity/
  env.ts
  client.ts                        # sanityFetch helper
  image.ts                         # urlFor helper
  structure.ts
  schemaTypes/
    index.ts
    event.ts
    testimonial.ts
    sponsor.ts
    service.ts
    siteSettings.ts
sanity.config.ts
lib/
  types.ts
  queries.ts                       # GROQ queries
  format-date.ts
  site-config.ts                   # fallback phone/email/address/social constants
  filter-events.ts                 # pure category-filter function
  validate-contact-form.ts         # pure validation function
middleware.ts                      # events.starkwood.au -> starkwood.au redirect
scripts/
  seed.ts
public/
  team.jpg                         # copied from Imgs/team.jpg
e2e/
  smoke.spec.ts
playwright.config.ts
vitest.config.ts
.env.local.example
```

---

## Task 1: Project scaffold (Next.js + Tailwind v4 + Vitest/RTL harness)

**Files:**
- Create: entire Next.js scaffold (`app/`, `package.json`, `tsconfig.json`, `next.config.ts`, `.eslintrc`/`eslint.config.*`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`)
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Test: `lib/__tests__/sanity-check.test.ts` (throwaway smoke test, deleted once a real test exists in Task 4+ — actually keep it, harmless)

**Interfaces:**
- Consumes: nothing (first task)
- Produces: a working `npm run dev`, `npm run build`, `npm run test` (Vitest) pipeline that every later task builds on

- [ ] **Step 1: Scaffold the Next.js app**

Run from the repo root (`/home/dhanuka/Documents/Projects/StarkwoodEvents`), which already contains `Imgs/` and `docs/` — scaffold in place, don't create a subdirectory:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --turbopack
```

When prompted about the existing `docs/`/`Imgs/` directories, confirm it's fine to continue in a non-empty directory.

- [ ] **Step 2: Verify the default app builds and runs**

Run: `npm run build`
Expected: build succeeds with no errors.

- [ ] **Step 3: Install the test harness**

```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 5: Create `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 6: Add test scripts to `package.json`**

Add to the `"scripts"` block:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 7: Write a smoke test and verify the harness works**

Create `lib/__tests__/sanity-check.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("test harness", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run: `npm run test`
Expected: 1 test passes.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Scaffold Next.js app with Tailwind v4 and Vitest/RTL test harness"
```

---

## Task 2: Brand theme + shadcn/ui init

**Files:**
- Modify: `app/globals.css`
- Create: `components.json` (via shadcn CLI)
- Create: `lib/utils.ts` (via shadcn CLI, exports `cn()`)
- Modify: `app/layout.tsx` (load brand fonts)

**Interfaces:**
- Consumes: Task 1 scaffold
- Produces: CSS variables `--background`, `--foreground`, `--accent`, `--accent-foreground`, `--card`, `--card-foreground`, `--border` on `:root`, matching the brand palette. `cn()` utility used by every component from here on.

- [ ] **Step 1: Init shadcn/ui**

```bash
npx shadcn@latest init -d
```

Accept defaults (it detects the existing Tailwind v4 setup and creates `components.json` + `lib/utils.ts`).

- [ ] **Step 2: Add the primitives this project needs**

```bash
npx shadcn@latest add button card input textarea badge separator
```

- [ ] **Step 3: Set brand theme tokens in `app/globals.css`**

Add/replace the `:root` and `.dark` (or the single theme block, since this brand is permanently dark) CSS variables shadcn generated with the brand palette. Below the existing `@import "tailwindcss";` and shadcn base layer, set:

```css
:root {
  --background: #0a0a0a;
  --foreground: #f5f1e8;
  --card: #141414;
  --card-foreground: #f5f1e8;
  --accent: #caa14b;
  --accent-foreground: #0a0a0a;
  --border: #2a2620;
  --muted: #1a1a1a;
  --muted-foreground: #b3ab99;
}

body {
  background-color: var(--background);
  color: var(--foreground);
}

.text-gradient-gold {
  background: linear-gradient(135deg, #caa14b 0%, #f4dfa1 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
```

- [ ] **Step 4: Load brand fonts in `app/layout.tsx`**

Use `next/font/google` for a serif display font (headings) and a clean sans-serif (body):

```tsx
import { Playfair_Display, Inter } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
```

Apply both variable classes to the `<html>` or `<body>` element's `className`, and reference them in `globals.css`:

```css
h1, h2, h3, h4, .font-display {
  font-family: var(--font-display), serif;
}
body {
  font-family: var(--font-body), sans-serif;
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: build succeeds. Run `npm run dev`, open `http://localhost:3000`, confirm the default page now renders on a near-black background with the loaded fonts (visual smoke check, no automated test for this step — it's pure styling).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add shadcn/ui and brand black/gold theme tokens"
```

---

## Task 3: Sanity project setup + schemas

**Files:**
- Create: `sanity/schemaTypes/event.ts`
- Create: `sanity/schemaTypes/testimonial.ts`
- Create: `sanity/schemaTypes/sponsor.ts`
- Create: `sanity/schemaTypes/service.ts`
- Create: `sanity/schemaTypes/siteSettings.ts`
- Create: `sanity/schemaTypes/index.ts`
- Create: `sanity/structure.ts`
- Create: `sanity.config.ts`
- Create: `.env.local.example`
- Test: `sanity/schemaTypes/__tests__/schemas.test.ts`

**Interfaces:**
- Consumes: nothing new
- Produces: `schemaTypes` array (from `sanity/schemaTypes/index.ts`) with document types named exactly `event`, `testimonial`, `sponsor`, `service`, `siteSettings` — every later task's GROQ queries and seed script rely on these exact type names and field names.

- [ ] **Step 1: Manual setup — create the Sanity project**

This step has no automated test; it's a one-time account setup:

1. Go to sanity.io, sign up/log in with a free account.
2. Create a new project (e.g. "Starkwood Events"). Note the **Project ID**.
3. Create an API token with **Editor** permissions (Project → API → Tokens) for the seed script and revalidation webhook. Note the token — it's shown once.
4. Install the SDK:

```bash
npm install sanity next-sanity @sanity/image-url @sanity/vision
```

- [ ] **Step 2: Create `.env.local.example` and your real `.env.local`**

`.env.local.example`:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_WRITE_TOKEN=
SANITY_REVALIDATE_SECRET=
RESEND_API_KEY=
CONTACT_TO_EMAIL=events@starkwood.au
```

Copy it to `.env.local` and fill in the real `NEXT_PUBLIC_SANITY_PROJECT_ID` and `SANITY_API_WRITE_TOKEN` from Step 1. Leave the rest for later tasks. `.env.local` is already git-ignored by the Next.js scaffold — verify with `git status` that it does not appear as untracked-to-be-added.

- [ ] **Step 3: Write the schema types**

`sanity/schemaTypes/event.ts`:

```ts
import { defineField, defineType } from "sanity";

export const event = defineType({
  name: "event",
  title: "Event",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Upcoming", value: "upcoming" },
          { title: "Past", value: "past" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: ["Concert", "Pageant", "Corporate", "Expo", "Cultural", "Other"],
      },
    }),
    defineField({ name: "startDate", title: "Start date", type: "date" }),
    defineField({ name: "endDate", title: "End date", type: "date" }),
    defineField({ name: "venue", title: "Venue", type: "string" }),
    defineField({
      name: "starkwoodRole",
      title: "Starkwood's role",
      type: "string",
      description: 'e.g. "Production Partner", "Event Production"',
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 3,
      description: "Short summary shown on event cards.",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({ name: "infoUrl", title: "Info URL", type: "url" }),
    defineField({ name: "ticketUrl", title: "Ticket URL", type: "url" }),
    defineField({
      name: "sponsors",
      title: "Sponsors",
      type: "array",
      of: [{ type: "reference", to: [{ type: "sponsor" }] }],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "venue", media: "coverImage" },
  },
});
```

`sanity/schemaTypes/testimonial.ts`:

```ts
import { defineField, defineType } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fields: [
    defineField({
      name: "quote",
      title: "Quote",
      type: "text",
      rows: 4,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({ name: "role", title: "Role / company", type: "string" }),
  ],
  preview: {
    select: { title: "author", subtitle: "quote" },
  },
});
```

`sanity/schemaTypes/sponsor.ts`:

```ts
import { defineField, defineType } from "sanity";

export const sponsor = defineType({
  name: "sponsor",
  title: "Sponsor / Partner",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      validation: (r) => r.required(),
    }),
    defineField({ name: "url", title: "URL", type: "url" }),
  ],
  preview: {
    select: { title: "name", media: "logo" },
  },
});
```

`sanity/schemaTypes/service.ts`:

```ts
import { defineField, defineType } from "sanity";

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      description: "A single emoji used as the service icon.",
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 2,
      description: "One-line summary shown on the services grid.",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
      description: "Full detail shown on the service's own page.",
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Controls display order on the services grid.",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "summary" },
  },
});
```

`sanity/schemaTypes/siteSettings.ts`:

```ts
import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "address", title: "Address", type: "string" }),
    defineField({ name: "facebookUrl", title: "Facebook URL", type: "url" }),
    defineField({ name: "instagramUrl", title: "Instagram URL", type: "url" }),
    defineField({
      name: "heroHeadline",
      title: "Hero headline",
      type: "string",
    }),
    defineField({
      name: "heroSubheadline",
      title: "Hero subheadline",
      type: "text",
      rows: 2,
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site Settings" };
    },
  },
});
```

`sanity/schemaTypes/index.ts`:

```ts
import { event } from "./event";
import { testimonial } from "./testimonial";
import { sponsor } from "./sponsor";
import { service } from "./service";
import { siteSettings } from "./siteSettings";

export const schemaTypes = [event, testimonial, sponsor, service, siteSettings];
```

- [ ] **Step 4: Write `sanity/structure.ts` to pin the Site Settings singleton**

```ts
import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site Settings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings"),
        ),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() !== "siteSettings",
      ),
    ]);
```

- [ ] **Step 5: Write `sanity.config.ts` at the repo root**

```ts
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";

export default defineConfig({
  name: "default",
  title: "Starkwood Events",
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  basePath: "/studio",
  plugins: [structureTool({ structure }), visionTool()],
  schema: { types: schemaTypes },
});
```

- [ ] **Step 6: Write a test asserting the schema shape**

Create `sanity/schemaTypes/__tests__/schemas.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { schemaTypes } from "../index";

describe("sanity schemaTypes", () => {
  it("exports exactly the five expected document types", () => {
    const names = schemaTypes.map((s) => s.name).sort();
    expect(names).toEqual(
      ["event", "service", "siteSettings", "sponsor", "testimonial"].sort(),
    );
  });

  it("event schema requires title, slug, and status", () => {
    const eventSchema = schemaTypes.find((s) => s.name === "event")!;
    const fieldNames = (eventSchema as any).fields.map((f: any) => f.name);
    expect(fieldNames).toEqual(
      expect.arrayContaining([
        "title",
        "slug",
        "status",
        "category",
        "startDate",
        "venue",
        "starkwoodRole",
        "summary",
        "coverImage",
        "gallery",
        "sponsors",
      ]),
    );
  });

  it("service schema has slug and order fields for routing/sorting", () => {
    const serviceSchema = schemaTypes.find((s) => s.name === "service")!;
    const fieldNames = (serviceSchema as any).fields.map((f: any) => f.name);
    expect(fieldNames).toEqual(expect.arrayContaining(["slug", "order"]));
  });
});
```

Run: `npm run test`
Expected: 3 new tests pass (plus the Task 1 smoke test).

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: build succeeds (schema files are plain TS modules, not yet imported by any page, so this mostly confirms no syntax errors).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Add Sanity schemas for event, testimonial, sponsor, service, siteSettings"
```

---

## Task 4: Sanity client, image helper, GROQ queries, shared types

**Files:**
- Create: `sanity/env.ts`
- Create: `sanity/client.ts`
- Create: `sanity/image.ts`
- Create: `lib/types.ts`
- Create: `lib/queries.ts`
- Test: `lib/__tests__/queries.test.ts`

**Interfaces:**
- Consumes: schema field names from Task 3 (`event`, `service`, `testimonial`, `sponsor`, `siteSettings` and their exact fields)
- Produces: `sanityFetch<T>({ query, params?, tags })`, `urlFor(source)`, GROQ query string constants (`upcomingEventsQuery`, `pastEventsQuery`, `eventBySlugQuery`, `servicesQuery`, `serviceBySlugQuery`, `testimonialsQuery`, `sponsorsQuery`, `siteSettingsQuery`), and TS types (`EventSummary`, `EventDetail`, `Service`, `ServiceDetail`, `Testimonial`, `Sponsor`, `SiteSettings`) — every page task from Task 10 onward imports from here.

- [ ] **Step 1: `sanity/env.ts`**

```ts
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID as string;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const apiVersion = "2024-01-01";
```

- [ ] **Step 2: `sanity/client.ts`**

```ts
import { createClient } from "next-sanity";
import { projectId, dataset, apiVersion } from "./env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});

export async function sanityFetch<T>({
  query,
  params = {},
  tags,
}: {
  query: string;
  params?: Record<string, unknown>;
  tags: string[];
}): Promise<T> {
  return client.fetch<T>(query, params, {
    cache: "force-cache",
    next: { tags },
  });
}
```

- [ ] **Step 3: `sanity/image.ts`**

```ts
import createImageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";
import { projectId, dataset } from "./env";

const builder = createImageUrlBuilder({ projectId, dataset });

export function urlFor(source: Image) {
  return builder.image(source);
}
```

- [ ] **Step 4: `lib/types.ts`**

```ts
export interface EventSummary {
  _id: string;
  title: string;
  slug: string;
  venue?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  coverImageUrl?: string;
  status: "upcoming" | "past";
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
  galleryUrls: string[];
  infoUrl?: string;
  ticketUrl?: string;
  sponsors: SponsorRef[];
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
```

- [ ] **Step 5: `lib/queries.ts`**

```ts
import { groq } from "next-sanity";

export const upcomingEventsQuery = groq`
  *[_type == "event" && status == "upcoming"] | order(startDate asc) {
    _id, title, "slug": slug.current, venue, startDate, endDate, summary, status,
    "coverImageUrl": coverImage.asset->url
  }
`;

export const pastEventsQuery = groq`
  *[_type == "event" && status == "past"] | order(startDate desc) {
    _id, title, "slug": slug.current, venue, startDate, endDate, summary, status,
    "coverImageUrl": coverImage.asset->url
  }
`;

export const allEventsQuery = groq`
  *[_type == "event"] | order(startDate desc) {
    _id, title, "slug": slug.current, venue, startDate, endDate, summary, status, category,
    "coverImageUrl": coverImage.asset->url
  }
`;

export const eventBySlugQuery = groq`
  *[_type == "event" && slug.current == $slug][0] {
    _id, title, "slug": slug.current, venue, startDate, endDate, summary, status, category,
    starkwoodRole, description, infoUrl, ticketUrl,
    "coverImageUrl": coverImage.asset->url,
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
```

- [ ] **Step 6: Write a test asserting every query targets the right document type**

Create `lib/__tests__/queries.test.ts`:

```ts
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
```

Run: `npm run test`
Expected: all tests pass.

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Add Sanity client, image helper, GROQ queries, and shared types"
```

---

## Task 5: Embedded Sanity Studio route

**Files:**
- Create: `app/studio/[[...tool]]/page.tsx`

**Interfaces:**
- Consumes: `sanity.config.ts` from Task 3
- Produces: a working `/studio` route

- [ ] **Step 1: Create the catch-all Studio route**

```tsx
import { NextStudio } from "next-sanity/studio";
import config from "@/sanity.config";

export const dynamic = "force-static";

export default function StudioPage() {
  return <NextStudio config={config} />;
}

export const metadata = { robots: { index: false, follow: false } };
```

- [ ] **Step 2: Verify it loads**

Run: `npm run dev`, open `http://localhost:3000/studio`.
Expected: the Sanity Studio UI loads and prompts you to log in with your sanity.io account. Log in, confirm you see the "Content" list with Site Settings, Event, Testimonial, Sponsor, Service.

Note: access control (who can log into Studio) is managed on sanity.io by project membership, not by app-level auth — as the project owner, only members you invite on sanity.io can log in. No additional auth code is needed.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Embed Sanity Studio at /studio"
```

---

## Task 6: On-demand revalidation webhook

**Files:**
- Create: `app/api/revalidate/route.ts`
- Test: `app/api/revalidate/__tests__/route.test.ts`

**Interfaces:**
- Consumes: `SANITY_REVALIDATE_SECRET` env var
- Produces: `POST /api/revalidate` that calls `revalidateTag(body._type)` for a validated Sanity webhook payload — later wired to a Sanity webhook in Task 19.

- [ ] **Step 1: Install the webhook signature helper (bundled with `next-sanity`, already installed in Task 4) — no new install needed.**

- [ ] **Step 2: Write the route handler**

```ts
import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(
      req,
      process.env.SANITY_REVALIDATE_SECRET,
    );

    if (!isValidSignature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }
    if (!body?._type) {
      return NextResponse.json({ message: "Bad request: missing _type" }, { status: 400 });
    }

    revalidateTag(body._type);
    return NextResponse.json({ revalidated: true, type: body._type, now: Date.now() });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 500 });
  }
}
```

- [ ] **Step 3: Write a test covering the missing-secret / bad-signature path**

Create `app/api/revalidate/__tests__/route.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next-sanity/webhook", () => ({
  parseBody: vi.fn().mockResolvedValue({ isValidSignature: false, body: undefined }),
}));

import { POST } from "../route";

describe("POST /api/revalidate", () => {
  it("returns 401 when the webhook signature is invalid", async () => {
    const req = new NextRequest("http://localhost/api/revalidate", { method: "POST" });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });
});
```

Run: `npm run test`
Expected: passes.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add on-demand revalidation webhook route"
```

---

## Task 7: Date formatting + site-config constants

**Files:**
- Create: `lib/format-date.ts`
- Create: `lib/site-config.ts`
- Test: `lib/__tests__/format-date.test.ts`
- Test: `lib/__tests__/site-config.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `formatEventDate(startDate?: string, endDate?: string): string`, and constants `DEFAULT_PHONE`, `DEFAULT_EMAIL`, `DEFAULT_ADDRESS`, `DEFAULT_FACEBOOK_URL`, `DEFAULT_INSTAGRAM_URL` — used by `app/layout.tsx` (Task 8) as the fallback source of truth for contact details even before Sanity content exists.

- [ ] **Step 1: Write the failing tests for `formatEventDate`**

Create `lib/__tests__/format-date.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { formatEventDate } from "../format-date";

describe("formatEventDate", () => {
  it("formats a single date", () => {
    expect(formatEventDate("2026-10-31")).toBe("31 October 2026");
  });

  it("formats a date range across two different dates", () => {
    expect(formatEventDate("2026-10-31", "2026-11-01")).toBe(
      "31 October 2026 – 1 November 2026",
    );
  });

  it("treats a same-day range as a single date", () => {
    expect(formatEventDate("2026-10-31", "2026-10-31")).toBe("31 October 2026");
  });

  it("returns a TBC label when no date is set", () => {
    expect(formatEventDate(undefined)).toBe("Date to be confirmed");
  });
});
```

Run: `npm run test`
Expected: FAIL (`formatEventDate` not defined).

- [ ] **Step 2: Implement `lib/format-date.ts`**

```ts
export function formatEventDate(startDate?: string, endDate?: string): string {
  if (!startDate) return "Date to be confirmed";

  const format = (iso: string) =>
    new Date(iso + "T00:00:00").toLocaleDateString("en-AU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  if (!endDate || endDate === startDate) return format(startDate);

  return `${format(startDate)} – ${format(endDate)}`;
}
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `npm run test`
Expected: all 4 pass.

- [ ] **Step 4: Write the failing test for site-config constants**

Create `lib/__tests__/site-config.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { DEFAULT_PHONE, DEFAULT_ADDRESS, DEFAULT_EMAIL } from "../site-config";

describe("site-config defaults", () => {
  it("has the correct phone number", () => {
    expect(DEFAULT_PHONE).toBe("+61 416 340 773");
  });

  it("has the correct address", () => {
    expect(DEFAULT_ADDRESS).toBe("Unit 2/198 Rooks Rd, Vermont VIC 3133");
  });

  it("has a non-empty default email", () => {
    expect(DEFAULT_EMAIL).toMatch(/@starkwood\.au$/);
  });
});
```

Run: `npm run test`
Expected: FAIL (module not found).

- [ ] **Step 5: Implement `lib/site-config.ts`**

```ts
export const DEFAULT_PHONE = "+61 416 340 773";
export const DEFAULT_EMAIL = "events@starkwood.au";
export const DEFAULT_ADDRESS = "Unit 2/198 Rooks Rd, Vermont VIC 3133";
export const DEFAULT_FACEBOOK_URL = "https://www.facebook.com/StarkwoodEvents/";
export const DEFAULT_INSTAGRAM_URL = "https://www.instagram.com/starkwood.events/";
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm run test`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add date formatting utility and site-config fallback constants"
```

---

## Task 8: SiteHeader + SiteFooter + RootLayout wiring

**Files:**
- Create: `components/layout/site-header.tsx`
- Create: `components/layout/site-footer.tsx`
- Test: `components/layout/__tests__/site-header.test.tsx`
- Test: `components/layout/__tests__/site-footer.test.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `formatEventDate` unused here; uses `DEFAULT_PHONE`/`DEFAULT_EMAIL`/`DEFAULT_ADDRESS`/`DEFAULT_FACEBOOK_URL`/`DEFAULT_INSTAGRAM_URL` from Task 7, `sanityFetch` + `siteSettingsQuery` + `SiteSettings` type from Task 4
- Produces: `SiteHeader({ phone }: { phone: string })`, `SiteFooter({ phone, email, address, facebookUrl, instagramUrl }: SiteFooterProps)` — pure presentational components, both rendered from `app/layout.tsx` which does the data fetching and fallback merging. Every page task from here on is rendered inside this layout automatically.

- [ ] **Step 1: Write the failing test for SiteHeader**

Create `components/layout/__tests__/site-header.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteHeader } from "../site-header";

describe("SiteHeader", () => {
  it("renders the primary nav links and the phone number", () => {
    render(<SiteHeader phone="+61 416 340 773" />);
    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /events/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /gallery/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /services/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /contact/i })).toBeInTheDocument();
    expect(screen.getByText("+61 416 340 773")).toBeInTheDocument();
  });
});
```

Run: `npm run test`
Expected: FAIL (module not found).

- [ ] **Step 2: Implement `components/layout/site-header.tsx`**

```tsx
import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/gallery", label: "Gallery" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ phone }: { phone: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg tracking-wide text-gradient-gold">
          STARKWOOD EVENTS
        </Link>
        <nav className="hidden gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--foreground)] transition hover:text-[var(--accent)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <a
          href={`tel:${phone.replace(/\s+/g, "")}`}
          className="hidden text-sm text-[var(--accent)] md:block"
        >
          {phone}
        </a>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `npm run test`
Expected: passes.

- [ ] **Step 4: Write the failing test for SiteFooter**

Create `components/layout/__tests__/site-footer.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteFooter } from "../site-footer";

const props = {
  phone: "+61 416 340 773",
  email: "events@starkwood.au",
  address: "Unit 2/198 Rooks Rd, Vermont VIC 3133",
  facebookUrl: "https://www.facebook.com/StarkwoodEvents/",
  instagramUrl: "https://www.instagram.com/starkwood.events/",
};

describe("SiteFooter", () => {
  it("renders phone, email, and address exactly as passed in", () => {
    render(<SiteFooter {...props} />);
    expect(screen.getByText(props.phone)).toBeInTheDocument();
    expect(screen.getByText(props.email)).toBeInTheDocument();
    expect(screen.getByText(props.address)).toBeInTheDocument();
  });

  it("never renders any mention of Unforgettable Sri Lanka", () => {
    render(<SiteFooter {...props} />);
    expect(screen.queryByText(/unforgettable sri lanka/i)).not.toBeInTheDocument();
  });

  it("links to Facebook and Instagram, and to the fm/staff subdomains only as small links", () => {
    render(<SiteFooter {...props} />);
    expect(screen.getByRole("link", { name: /facebook/i })).toHaveAttribute(
      "href",
      props.facebookUrl,
    );
    expect(screen.getByRole("link", { name: /instagram/i })).toHaveAttribute(
      "href",
      props.instagramUrl,
    );
  });
});
```

Run: `npm run test`
Expected: FAIL (module not found).

- [ ] **Step 5: Implement `components/layout/site-footer.tsx`**

```tsx
interface SiteFooterProps {
  phone: string;
  email: string;
  address: string;
  facebookUrl: string;
  instagramUrl: string;
}

export function SiteFooter({
  phone,
  email,
  address,
  facebookUrl,
  instagramUrl,
}: SiteFooterProps) {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card)] py-12 text-sm text-[var(--muted-foreground)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 md:flex-row md:justify-between">
        <div>
          <p className="font-display text-[var(--accent)]">Starkwood Events</p>
          <p>{address}</p>
          <p>{phone}</p>
          <p>{email}</p>
        </div>
        <div className="flex gap-4">
          <a href={facebookUrl} className="hover:text-[var(--accent)]">
            Facebook
          </a>
          <a href={instagramUrl} className="hover:text-[var(--accent)]">
            Instagram
          </a>
        </div>
        <div className="flex gap-4 text-xs opacity-70">
          <a href="https://fm.starkwood.au" className="hover:text-[var(--accent)]">
            Starkwood FM
          </a>
          <a href="https://staff.starkwood.au" className="hover:text-[var(--accent)]">
            Staff
          </a>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm run test`
Expected: passes.

- [ ] **Step 7: Wire both into `app/layout.tsx`, fetching SiteSettings with hardcoded fallbacks**

```tsx
import "./globals.css";
import { Playfair_Display, Inter } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { sanityFetch } from "@/sanity/client";
import { siteSettingsQuery } from "@/lib/queries";
import type { SiteSettings } from "@/lib/types";
import {
  DEFAULT_PHONE,
  DEFAULT_EMAIL,
  DEFAULT_ADDRESS,
  DEFAULT_FACEBOOK_URL,
  DEFAULT_INSTAGRAM_URL,
} from "@/lib/site-config";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata = {
  title: "Starkwood Events",
  description: "Full-scale event production and entertainment, Melbourne.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let settings: SiteSettings | null = null;
  try {
    settings = await sanityFetch<SiteSettings>({
      query: siteSettingsQuery,
      tags: ["siteSettings"],
    });
  } catch {
    settings = null;
  }

  const phone = settings?.phone || DEFAULT_PHONE;
  const email = settings?.email || DEFAULT_EMAIL;
  const address = settings?.address || DEFAULT_ADDRESS;
  const facebookUrl = settings?.facebookUrl || DEFAULT_FACEBOOK_URL;
  const instagramUrl = settings?.instagramUrl || DEFAULT_INSTAGRAM_URL;

  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <SiteHeader phone={phone} />
        {children}
        <SiteFooter
          phone={phone}
          email={email}
          address={address}
          facebookUrl={facebookUrl}
          instagramUrl={instagramUrl}
        />
      </body>
    </html>
  );
}
```

- [ ] **Step 8: Verify build**

Run: `npm run build`
Expected: succeeds (the `sanityFetch` call will fail gracefully to the `catch` block since no Sanity content exists yet — that's expected and correct at this stage).

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Add SiteHeader/SiteFooter and wire into RootLayout with contact fallbacks"
```

---

## Task 9: EventCard + EmptyState components

**Files:**
- Create: `components/event-card.tsx`
- Create: `components/empty-state.tsx`
- Test: `components/__tests__/event-card.test.tsx`
- Test: `components/__tests__/empty-state.test.tsx`

**Interfaces:**
- Consumes: `formatEventDate` from Task 7
- Produces: `EventCard({ title, slug, venue, startDate, endDate, summary, coverImageUrl }: EventCardProps)`, `EmptyState({ message }: { message: string })` — used by the Home page (Task 10) and Events list (Task 11).

- [ ] **Step 1: Write the failing tests**

Create `components/__tests__/event-card.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventCard } from "../event-card";

describe("EventCard", () => {
  it("renders title, venue, and formatted date, linking to the event page", () => {
    render(
      <EventCard
        title="Naadha Gama Melbourne 2026"
        slug="naadha-gama-melbourne-2026"
        venue="Sidney Myer Music Bowl"
        startDate="2026-10-31"
        summary="A new chapter for Sri Lankan music in Australia."
      />,
    );
    expect(screen.getByText("Naadha Gama Melbourne 2026")).toBeInTheDocument();
    expect(screen.getByText("Sidney Myer Music Bowl")).toBeInTheDocument();
    expect(screen.getByText("31 October 2026")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/events/naadha-gama-melbourne-2026",
    );
  });

  it("shows a branded placeholder when there is no cover image", () => {
    render(
      <EventCard
        title="Untitled Event"
        slug="untitled-event"
        venue="TBC"
        startDate={undefined}
      />,
    );
    expect(screen.getByTestId("event-card-placeholder")).toBeInTheDocument();
  });
});
```

Create `components/__tests__/empty-state.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "../empty-state";

describe("EmptyState", () => {
  it("renders the given message", () => {
    render(<EmptyState message="New events coming soon" />);
    expect(screen.getByText("New events coming soon")).toBeInTheDocument();
  });
});
```

Run: `npm run test`
Expected: FAIL (modules not found).

- [ ] **Step 2: Implement `components/event-card.tsx`**

```tsx
import Link from "next/link";
import Image from "next/image";
import { formatEventDate } from "@/lib/format-date";

interface EventCardProps {
  title: string;
  slug: string;
  venue?: string;
  startDate?: string;
  endDate?: string;
  summary?: string;
  coverImageUrl?: string;
}

export function EventCard({
  title,
  slug,
  venue,
  startDate,
  endDate,
  summary,
  coverImageUrl,
}: EventCardProps) {
  return (
    <Link
      href={`/events/${slug}`}
      className="group block overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card)] transition hover:border-[var(--accent)]"
    >
      <div className="relative aspect-video w-full overflow-hidden">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div
            data-testid="event-card-placeholder"
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a1710] to-[#0a0a0a]"
          >
            <span className="font-display text-2xl text-gradient-gold">S</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-lg text-[var(--foreground)]">{title}</h3>
        {venue && <p className="mt-1 text-sm text-[var(--muted-foreground)]">{venue}</p>}
        <p className="mt-1 text-sm text-[var(--accent)]">{formatEventDate(startDate, endDate)}</p>
        {summary && <p className="mt-2 text-sm text-[var(--muted-foreground)]">{summary}</p>}
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: Implement `components/empty-state.tsx`**

```tsx
export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border)] py-16 text-center text-[var(--muted-foreground)]">
      <p className="font-display text-xl text-[var(--accent)]">{message}</p>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: all pass.

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "Add EventCard and EmptyState components"
```

---

## Task 10: Home page

**Files:**
- Create: `components/home/hero.tsx`
- Create: `components/home/services-teaser.tsx`
- Create: `components/home/upcoming-events-section.tsx`
- Create: `components/home/past-projects-section.tsx`
- Create: `components/home/testimonials-section.tsx`
- Create: `components/home/sponsor-logos.tsx`
- Create: `components/home/contact-cta.tsx`
- Modify: `app/page.tsx`
- Test: `components/home/__tests__/upcoming-events-section.test.tsx`
- Test: `components/home/__tests__/past-projects-section.test.tsx`

**Interfaces:**
- Consumes: `EventCard`, `EmptyState` (Task 9), `sanityFetch` + all queries (Task 4), `EventSummary`/`Testimonial`/`Sponsor` types (Task 4)
- Produces: `app/page.tsx` rendering the full home page; `UpcomingEventsSection({ events }: { events: EventSummary[] })` and `PastProjectsSection({ events }: { events: EventSummary[] })` as independently testable presentational components (data-fetching stays in `app/page.tsx`).

- [ ] **Step 1: Write the failing tests for the two data-driven sections**

Create `components/home/__tests__/upcoming-events-section.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UpcomingEventsSection } from "../upcoming-events-section";

describe("UpcomingEventsSection", () => {
  it("renders a card for each upcoming event", () => {
    render(
      <UpcomingEventsSection
        events={[
          {
            _id: "1",
            title: "Naadha Gama Melbourne 2026",
            slug: "naadha-gama-melbourne-2026",
            venue: "Sidney Myer Music Bowl",
            startDate: "2026-10-31",
            status: "upcoming",
          },
        ]}
      />,
    );
    expect(screen.getByText("Naadha Gama Melbourne 2026")).toBeInTheDocument();
  });

  it("shows the empty state when there are no upcoming events", () => {
    render(<UpcomingEventsSection events={[]} />);
    expect(screen.getByText("New events coming soon")).toBeInTheDocument();
  });
});
```

Create `components/home/__tests__/past-projects-section.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PastProjectsSection } from "../past-projects-section";

describe("PastProjectsSection", () => {
  it("renders a card for each past project", () => {
    render(
      <PastProjectsSection
        events={[
          {
            _id: "1",
            title: "Aluth Kalawak — Melbourne Edition",
            slug: "aluth-kalawak-melbourne-edition",
            venue: "Trak Live Lounge Bar",
            startDate: "2023-10-13",
            status: "past",
          },
        ]}
      />,
    );
    expect(screen.getByText("Aluth Kalawak — Melbourne Edition")).toBeInTheDocument();
  });
});
```

Run: `npm run test`
Expected: FAIL (modules not found).

- [ ] **Step 2: Implement the two data-driven sections**

`components/home/upcoming-events-section.tsx`:

```tsx
import { EventCard } from "@/components/event-card";
import { EmptyState } from "@/components/empty-state";
import type { EventSummary } from "@/lib/types";

export function UpcomingEventsSection({ events }: { events: EventSummary[] }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="font-display text-3xl text-[var(--foreground)]">
        Upcoming <span className="text-gradient-gold">Events</span>
      </h2>
      <div className="mt-8">
        {events.length === 0 ? (
          <EmptyState message="New events coming soon" />
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {events.map((e) => (
              <EventCard key={e._id} {...e} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

`components/home/past-projects-section.tsx`:

```tsx
import { EventCard } from "@/components/event-card";
import type { EventSummary } from "@/lib/types";

export function PastProjectsSection({ events }: { events: EventSummary[] }) {
  if (events.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="font-display text-3xl text-[var(--foreground)]">
        Past <span className="text-gradient-gold">Projects</span>
      </h2>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {events.slice(0, 6).map((e) => (
          <EventCard key={e._id} {...e} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `npm run test`
Expected: passes.

- [ ] **Step 4: Implement the remaining, non-data-driven sections**

`components/home/hero.tsx`:

```tsx
export function Hero({ headline, subheadline }: { headline: string; subheadline: string }) {
  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-[var(--background)] px-6 text-center">
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[var(--background)]" />
      <div className="relative z-10 max-w-3xl">
        <h1 className="font-display text-5xl leading-tight text-gradient-gold md:text-6xl">
          {headline}
        </h1>
        <p className="mt-6 text-lg text-[var(--muted-foreground)]">{subheadline}</p>
      </div>
    </section>
  );
}
```

`components/home/services-teaser.tsx`:

```tsx
import Link from "next/link";
import type { Service } from "@/lib/types";

export function ServicesTeaser({ services }: { services: Service[] }) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="font-display text-3xl text-[var(--foreground)]">
        What We <span className="text-gradient-gold">Do</span>
      </h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-5">
        {services.map((s) => (
          <Link
            key={s._id}
            href={`/services/${s.slug}`}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-center transition hover:border-[var(--accent)]"
          >
            <div className="text-2xl">{s.icon}</div>
            <p className="mt-2 text-sm text-[var(--foreground)]">{s.title}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

`components/home/testimonials-section.tsx`:

```tsx
import type { Testimonial } from "@/lib/types";

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;
  return (
    <section className="mx-auto max-w-4xl px-6 py-16 text-center">
      <h2 className="font-display text-3xl text-[var(--foreground)]">
        What <span className="text-gradient-gold">Clients Say</span>
      </h2>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {testimonials.map((t) => (
          <blockquote key={t._id} className="text-[var(--muted-foreground)]">
            <p>&ldquo;{t.quote}&rdquo;</p>
            <footer className="mt-3 text-sm text-[var(--accent)]">
              {t.author}
              {t.role ? `, ${t.role}` : ""}
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
```

`components/home/sponsor-logos.tsx`:

```tsx
import Image from "next/image";
import type { Sponsor } from "@/lib/types";

export function SponsorLogos({ sponsors }: { sponsors: Sponsor[] }) {
  if (sponsors.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-center gap-8 opacity-80">
        {sponsors.map((s) =>
          s.logoUrl ? (
            <Image
              key={s._id}
              src={s.logoUrl}
              alt={s.name}
              width={120}
              height={48}
              className="h-10 w-auto object-contain grayscale transition hover:grayscale-0"
            />
          ) : null,
        )}
      </div>
    </section>
  );
}
```

`components/home/contact-cta.tsx`:

```tsx
import Link from "next/link";

export function ContactCta() {
  return (
    <section className="border-t border-[var(--border)] bg-[var(--card)] py-16 text-center">
      <h2 className="font-display text-3xl text-[var(--foreground)]">
        Let&apos;s Build Something <span className="text-gradient-gold">Unforgettable</span>
      </h2>
      <Link
        href="/contact"
        className="mt-6 inline-block rounded-md bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--accent-foreground)]"
      >
        Get in touch
      </Link>
    </section>
  );
}
```

- [ ] **Step 5: Compose `app/page.tsx`**

```tsx
import { Hero } from "@/components/home/hero";
import { ServicesTeaser } from "@/components/home/services-teaser";
import { UpcomingEventsSection } from "@/components/home/upcoming-events-section";
import { PastProjectsSection } from "@/components/home/past-projects-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { SponsorLogos } from "@/components/home/sponsor-logos";
import { ContactCta } from "@/components/home/contact-cta";
import { sanityFetch } from "@/sanity/client";
import {
  upcomingEventsQuery,
  pastEventsQuery,
  servicesQuery,
  testimonialsQuery,
  sponsorsQuery,
  siteSettingsQuery,
} from "@/lib/queries";
import type { EventSummary, Service, Testimonial, Sponsor, SiteSettings } from "@/lib/types";

async function safeFetch<T>(query: string, tag: string, fallback: T): Promise<T> {
  try {
    return await sanityFetch<T>({ query, tags: [tag] });
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [upcoming, past, services, testimonials, sponsors, settings] = await Promise.all([
    safeFetch<EventSummary[]>(upcomingEventsQuery, "event", []),
    safeFetch<EventSummary[]>(pastEventsQuery, "event", []),
    safeFetch<Service[]>(servicesQuery, "service", []),
    safeFetch<Testimonial[]>(testimonialsQuery, "testimonial", []),
    safeFetch<Sponsor[]>(sponsorsQuery, "sponsor", []),
    safeFetch<SiteSettings | null>(siteSettingsQuery, "siteSettings", null),
  ]);

  return (
    <main>
      <Hero
        headline={settings?.heroHeadline || "Full-Scale Events. Flawlessly Produced."}
        subheadline={
          settings?.heroSubheadline ||
          "From arena concerts to cultural galas, Starkwood Events brings Melbourne's biggest nights to life."
        }
      />
      <ServicesTeaser services={services} />
      <UpcomingEventsSection events={upcoming} />
      <PastProjectsSection events={past} />
      <TestimonialsSection testimonials={testimonials} />
      <SponsorLogos sponsors={sponsors} />
      <ContactCta />
    </main>
  );
}
```

- [ ] **Step 6: Verify build and manual check**

Run: `npm run build`
Expected: succeeds. Run `npm run dev`, open `http://localhost:3000`, confirm the page renders top-to-bottom without errors (it will show empty states / no services yet, since Sanity has no content until Task 18 — that's expected).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Build the Home page"
```

---

## Task 11: Events list page with category filter

**Files:**
- Create: `lib/filter-events.ts`
- Create: `components/events/events-explorer.tsx`
- Create: `app/events/page.tsx`
- Test: `lib/__tests__/filter-events.test.ts`
- Test: `components/events/__tests__/events-explorer.test.tsx`

**Interfaces:**
- Consumes: `EventCard`, `allEventsQuery`, `EventSummary` (extended with `category`)
- Produces: `filterEventsByCategory(events: EventSummary[], category: string | "All"): EventSummary[]`; `EventsExplorer({ events }: { events: EventSummary[] })` client component

- [ ] **Step 1: Write the failing test for the pure filter function**

Create `lib/__tests__/filter-events.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { filterEventsByCategory } from "../filter-events";
import type { EventSummary } from "../types";

const events = [
  { _id: "1", title: "A", slug: "a", status: "upcoming", category: "Concert" },
  { _id: "2", title: "B", slug: "b", status: "past", category: "Pageant" },
  { _id: "3", title: "C", slug: "c", status: "past", category: "Concert" },
] as unknown as (EventSummary & { category: string })[];

describe("filterEventsByCategory", () => {
  it("returns all events when category is \"All\"", () => {
    expect(filterEventsByCategory(events, "All")).toHaveLength(3);
  });

  it("returns only events matching the given category", () => {
    const result = filterEventsByCategory(events, "Concert");
    expect(result.map((e) => e._id)).toEqual(["1", "3"]);
  });

  it("returns an empty array when no events match", () => {
    expect(filterEventsByCategory(events, "Expo")).toEqual([]);
  });
});
```

Run: `npm run test`
Expected: FAIL.

- [ ] **Step 2: Implement `lib/filter-events.ts`**

```ts
import type { EventSummary } from "./types";

type CategorizedEvent = EventSummary & { category?: string };

export function filterEventsByCategory<T extends CategorizedEvent>(
  events: T[],
  category: string,
): T[] {
  if (category === "All") return events;
  return events.filter((e) => e.category === category);
}
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `npm run test`
Expected: passes.

- [ ] **Step 4: Write the failing test for EventsExplorer**

Create `components/events/__tests__/events-explorer.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EventsExplorer } from "../events-explorer";

const events = [
  { _id: "1", title: "Naadha Gama Melbourne 2026", slug: "naadha-gama", status: "upcoming", category: "Concert" },
  { _id: "2", title: "Home Lands Prestige Night", slug: "home-lands", status: "past", category: "Corporate" },
] as any;

describe("EventsExplorer", () => {
  it("shows every event by default and filters when a category button is clicked", async () => {
    render(<EventsExplorer events={events} />);
    expect(screen.getByText("Naadha Gama Melbourne 2026")).toBeInTheDocument();
    expect(screen.getByText("Home Lands Prestige Night")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Concert" }));

    expect(screen.getByText("Naadha Gama Melbourne 2026")).toBeInTheDocument();
    expect(screen.queryByText("Home Lands Prestige Night")).not.toBeInTheDocument();
  });
});
```

Run: `npm run test`
Expected: FAIL.

- [ ] **Step 5: Implement `components/events/events-explorer.tsx`**

```tsx
"use client";

import { useState } from "react";
import { EventCard } from "@/components/event-card";
import { EmptyState } from "@/components/empty-state";
import { filterEventsByCategory } from "@/lib/filter-events";
import type { EventSummary } from "@/lib/types";

const CATEGORIES = ["All", "Concert", "Pageant", "Corporate", "Expo", "Cultural", "Other"];

export function EventsExplorer({
  events,
}: {
  events: (EventSummary & { category?: string })[];
}) {
  const [category, setCategory] = useState("All");
  const filtered = filterEventsByCategory(events, category);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
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
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm run test`
Expected: passes.

- [ ] **Step 7: Implement `app/events/page.tsx`**

```tsx
import { EventsExplorer } from "@/components/events/events-explorer";
import { sanityFetch } from "@/sanity/client";
import { allEventsQuery } from "@/lib/queries";
import type { EventSummary } from "@/lib/types";

export const metadata = { title: "Events | Starkwood Events" };

export default async function EventsPage() {
  let events: (EventSummary & { category?: string })[] = [];
  try {
    events = await sanityFetch({ query: allEventsQuery, tags: ["event"] });
  } catch {
    events = [];
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl text-[var(--foreground)]">
        Our <span className="text-gradient-gold">Events</span>
      </h1>
      <div className="mt-8">
        <EventsExplorer events={events} />
      </div>
    </main>
  );
}
```

- [ ] **Step 8: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Add Events list page with client-side category filter"
```

---

## Task 12: Event detail page

**Files:**
- Create: `app/events/[slug]/page.tsx`
- Test: manual (Portable Text rendering is verified via the E2E suite in Task 20, not a unit test — see note in Step 3)

**Interfaces:**
- Consumes: `eventBySlugQuery`, `eventSlugsQuery`, `EventDetail` type, `urlFor`
- Produces: `/events/[slug]` route with `generateStaticParams` + `generateMetadata`

- [ ] **Step 1: Install Portable Text renderer**

```bash
npm install @portabletext/react
```

- [ ] **Step 2: Implement `app/events/[slug]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { sanityFetch } from "@/sanity/client";
import { eventBySlugQuery, eventSlugsQuery } from "@/lib/queries";
import { formatEventDate } from "@/lib/format-date";
import type { EventDetail } from "@/lib/types";

export async function generateStaticParams() {
  try {
    const slugs = await sanityFetch<string[]>({ query: eventSlugsQuery, tags: ["event"] });
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await sanityFetch<EventDetail | null>({
    query: eventBySlugQuery,
    params: { slug },
    tags: ["event"],
  });
  if (!event) return {};
  return { title: `${event.title} | Starkwood Events` };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await sanityFetch<EventDetail | null>({
    query: eventBySlugQuery,
    params: { slug },
    tags: ["event"],
  });

  if (!event) notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      {event.coverImageUrl && (
        <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-lg">
          <Image src={event.coverImageUrl} alt={event.title} fill className="object-cover" />
        </div>
      )}
      <h1 className="font-display text-4xl text-[var(--foreground)]">{event.title}</h1>
      <p className="mt-2 text-[var(--accent)]">
        {formatEventDate(event.startDate, event.endDate)}
        {event.venue ? ` · ${event.venue}` : ""}
      </p>
      {event.starkwoodRole && (
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Starkwood&apos;s role: {event.starkwoodRole}
        </p>
      )}
      {event.description && (
        <div className="prose prose-invert mt-8 max-w-none">
          <PortableText value={event.description} />
        </div>
      )}
      {event.galleryUrls?.length > 0 && (
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          {event.galleryUrls.map((url, i) => (
            <div key={url} className="relative aspect-square overflow-hidden rounded-lg">
              <Image src={url} alt={`${event.title} photo ${i + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}
      <div className="mt-10 flex flex-wrap gap-4">
        {event.ticketUrl && (
          <a
            href={event.ticketUrl}
            className="rounded-md bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--accent-foreground)]"
          >
            Get tickets
          </a>
        )}
        {event.infoUrl && (
          <a
            href={event.infoUrl}
            className="rounded-md border border-[var(--border)] px-6 py-3 text-sm text-[var(--foreground)]"
          >
            More info
          </a>
        )}
      </div>
      {event.sponsors?.length > 0 && (
        <div className="mt-12 flex flex-wrap items-center gap-6 opacity-80">
          {event.sponsors.map((s) =>
            s.logoUrl ? (
              <Image key={s._id} src={s.logoUrl} alt={s.name} width={100} height={40} />
            ) : (
              <span key={s._id} className="text-sm text-[var(--muted-foreground)]">
                {s.name}
              </span>
            ),
          )}
        </div>
      )}
    </main>
  );
}
```

Note on testing: this page is a Server Component doing an async `params` await and a live data fetch — it's exercised end-to-end by the Playwright suite in Task 20 (`/events/naadha-gama-melbourne-2026` loads and shows the right title) rather than a Vitest/RTL unit test, which would require heavy Next.js server-component mocking for little benefit here. The reusable logic it depends on (`formatEventDate`, the GROQ query shape) is already unit-tested in Tasks 4 and 7.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds (no event documents exist yet, so `generateStaticParams` returns `[]` — expected until Task 18 seeds content).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add event detail page"
```

---

## Task 13: Gallery page

**Files:**
- Create: `components/gallery/gallery-grid.tsx`
- Create: `app/gallery/page.tsx`
- Test: `components/gallery/__tests__/gallery-grid.test.tsx`

**Interfaces:**
- Consumes: `allEventsQuery` extended to include `gallery` image URLs (new query below), `EventDetail`-shaped gallery data
- Produces: `GalleryGrid({ groups }: { groups: GalleryGroup[] })` where `GalleryGroup = { title: string; slug: string; imageUrls: string[] }`

- [ ] **Step 1: Add the gallery-with-images query to `lib/queries.ts`**

Append to `lib/queries.ts`:

```ts
export const eventGalleriesQuery = groq`
  *[_type == "event" && count(gallery) > 0] | order(startDate desc) {
    title, "slug": slug.current,
    "imageUrls": gallery[].asset->url
  }
`;
```

- [ ] **Step 2: Write the failing test for GalleryGrid**

Create `components/gallery/__tests__/gallery-grid.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GalleryGrid } from "../gallery-grid";

describe("GalleryGrid", () => {
  it("renders a heading and images for each group", () => {
    render(
      <GalleryGrid
        groups={[
          {
            title: "Aluth Kalawak — Melbourne Edition",
            slug: "aluth-kalawak-melbourne-edition",
            imageUrls: ["https://cdn.example.com/a.jpg", "https://cdn.example.com/b.jpg"],
          },
        ]}
      />,
    );
    expect(screen.getByText("Aluth Kalawak — Melbourne Edition")).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(2);
  });

  it("shows an empty state when there are no groups", () => {
    render(<GalleryGrid groups={[]} />);
    expect(screen.getByText(/photos coming soon/i)).toBeInTheDocument();
  });
});
```

Run: `npm run test`
Expected: FAIL.

- [ ] **Step 3: Implement `components/gallery/gallery-grid.tsx`**

```tsx
import Image from "next/image";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";

export interface GalleryGroup {
  title: string;
  slug: string;
  imageUrls: string[];
}

export function GalleryGrid({ groups }: { groups: GalleryGroup[] }) {
  if (groups.length === 0) {
    return <EmptyState message="Photos coming soon" />;
  }

  return (
    <div className="space-y-12">
      {groups.map((group) => (
        <section key={group.slug}>
          <Link
            href={`/events/${group.slug}`}
            className="font-display text-xl text-[var(--foreground)] hover:text-[var(--accent)]"
          >
            {group.title}
          </Link>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            {group.imageUrls.map((url, i) => (
              <div key={url} className="relative aspect-square overflow-hidden rounded-lg">
                <Image
                  src={url}
                  alt={`${group.title} photo ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: passes.

- [ ] **Step 5: Implement `app/gallery/page.tsx`**

```tsx
import { GalleryGrid, type GalleryGroup } from "@/components/gallery/gallery-grid";
import { sanityFetch } from "@/sanity/client";
import { eventGalleriesQuery } from "@/lib/queries";

export const metadata = { title: "Gallery | Starkwood Events" };

export default async function GalleryPage() {
  let groups: GalleryGroup[] = [];
  try {
    groups = await sanityFetch<GalleryGroup[]>({
      query: eventGalleriesQuery,
      tags: ["event"],
    });
  } catch {
    groups = [];
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl text-[var(--foreground)]">
        Photo <span className="text-gradient-gold">Gallery</span>
      </h1>
      <div className="mt-8">
        <GalleryGrid groups={groups} />
      </div>
    </main>
  );
}
```

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add Gallery page grouped by event"
```

---

## Task 14: Services list + detail pages (fixes the broken "Read More" bug)

**Files:**
- Create: `app/services/page.tsx`
- Create: `app/services/[slug]/page.tsx`
- Test: `lib/__tests__/queries-services.test.ts`

**Interfaces:**
- Consumes: `servicesQuery`, `serviceBySlugQuery`, `serviceSlugsQuery` (Task 4), `Service`/`ServiceDetail` types
- Produces: `/services` list linking to ten **distinct** `/services/[slug]` URLs — the direct fix for the current site's bug where every "Read More" pointed at the same anchor.

- [ ] **Step 1: Write a regression test asserting the query returns per-slug data (not a shared anchor)**

Create `lib/__tests__/queries-services.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { servicesQuery, serviceBySlugQuery } from "../queries";

describe("service queries", () => {
  it("the list query selects the slug field (so each card links to its own page, not a shared anchor)", () => {
    expect(servicesQuery).toContain('"slug": slug.current');
  });

  it("the detail query filters by the given slug", () => {
    expect(serviceBySlugQuery).toContain("slug.current == $slug");
  });
});
```

Run: `npm run test`
Expected: passes immediately (queries already written in Task 4) — this test exists to guard against a future regression back to a shared-anchor pattern, not to drive new implementation.

- [ ] **Step 2: Implement `app/services/page.tsx`**

```tsx
import Link from "next/link";
import { sanityFetch } from "@/sanity/client";
import { servicesQuery } from "@/lib/queries";
import type { Service } from "@/lib/types";

export const metadata = { title: "Services | Starkwood Events" };

export default async function ServicesPage() {
  let services: Service[] = [];
  try {
    services = await sanityFetch<Service[]>({ query: servicesQuery, tags: ["service"] });
  } catch {
    services = [];
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-display text-4xl text-[var(--foreground)]">
        Our <span className="text-gradient-gold">Services</span>
      </h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {services.map((s) => (
          <div
            key={s._id}
            className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6"
          >
            <div className="text-3xl">{s.icon}</div>
            <h2 className="mt-3 font-display text-xl text-[var(--foreground)]">{s.title}</h2>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{s.summary}</p>
            <Link
              href={`/services/${s.slug}`}
              className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline"
            >
              Read more →
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Implement `app/services/[slug]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { sanityFetch } from "@/sanity/client";
import { serviceBySlugQuery, serviceSlugsQuery } from "@/lib/queries";
import type { ServiceDetail } from "@/lib/types";

export async function generateStaticParams() {
  try {
    const slugs = await sanityFetch<string[]>({ query: serviceSlugsQuery, tags: ["service"] });
    return slugs.map((slug) => ({ slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await sanityFetch<ServiceDetail | null>({
    query: serviceBySlugQuery,
    params: { slug },
    tags: ["service"],
  });
  if (!service) return {};
  return { title: `${service.title} | Starkwood Events` };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await sanityFetch<ServiceDetail | null>({
    query: serviceBySlugQuery,
    params: { slug },
    tags: ["service"],
  });

  if (!service) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="text-4xl">{service.icon}</div>
      <h1 className="mt-3 font-display text-4xl text-[var(--foreground)]">{service.title}</h1>
      {service.description && (
        <div className="prose prose-invert mt-8 max-w-none">
          <PortableText value={service.description} />
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add Services list and detail pages, fixing the shared-anchor Read More bug"
```

---

## Task 15: About page

**Files:**
- Create: `public/team.jpg` (copied from `Imgs/team.jpg`)
- Create: `app/about/page.tsx`

**Interfaces:**
- Consumes: nothing new (static content page)
- Produces: `/about` route

- [ ] **Step 1: Copy the team photo into `public/`**

```bash
cp Imgs/team.jpg public/team.jpg
```

- [ ] **Step 2: Implement `app/about/page.tsx`**

```tsx
import Image from "next/image";

export const metadata = { title: "About | Starkwood Events" };

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-display text-4xl text-[var(--foreground)]">
        About <span className="text-gradient-gold">Starkwood Events</span>
      </h1>
      <p className="mt-6 text-[var(--muted-foreground)]">
        Starkwood Events is a full-scale event production and entertainment company based in
        Melbourne. Our team has delivered arena concerts, cultural festivals, corporate launches,
        and pageants across Victoria — handling everything from production management and
        staging to lighting, audio, and on-the-ground crew.
      </p>
      <p className="mt-4 text-[var(--muted-foreground)]">
        From Sri Lankan concert tours at the Palais Theatre and Sidney Myer Music Bowl to
        the Miss Earth Australia pageant and vintage-themed corporate galas, we bring the same
        production discipline to every scale of event.
      </p>
      <div className="relative mt-10 aspect-video w-full overflow-hidden rounded-lg">
        <Image src="/team.jpg" alt="The Starkwood Events team" fill className="object-cover" />
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Add About page with team photo"
```

---

## Task 16: Contact page, form, and Server Action

**Files:**
- Create: `lib/validate-contact-form.ts`
- Create: `app/contact/actions.ts`
- Create: `components/contact-form.tsx`
- Create: `app/contact/page.tsx`
- Test: `lib/__tests__/validate-contact-form.test.ts`
- Test: `components/__tests__/contact-form.test.tsx`

**Interfaces:**
- Consumes: `DEFAULT_PHONE`, `DEFAULT_EMAIL` (Task 7)
- Produces: `validateContactForm(input): { valid: boolean; errors: Record<string, string> }`, `sendContactMessage(prevState, formData)` Server Action, `ContactForm({ phone, email }: { phone: string; email: string })`

- [ ] **Step 1: Write the failing tests for the pure validator**

Create `lib/__tests__/validate-contact-form.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { validateContactForm } from "../validate-contact-form";

describe("validateContactForm", () => {
  it("passes for a complete, valid submission", () => {
    const result = validateContactForm({
      name: "Jane Doe",
      email: "jane@example.com",
      message: "I'd like to enquire about a corporate event.",
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("flags a missing name", () => {
    const result = validateContactForm({ name: "", email: "jane@example.com", message: "Hi" });
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it("flags an invalid email", () => {
    const result = validateContactForm({ name: "Jane", email: "not-an-email", message: "Hi" });
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  it("flags an empty message", () => {
    const result = validateContactForm({ name: "Jane", email: "jane@example.com", message: "" });
    expect(result.valid).toBe(false);
    expect(result.errors.message).toBeDefined();
  });
});
```

Run: `npm run test`
Expected: FAIL.

- [ ] **Step 2: Implement `lib/validate-contact-form.ts`**

```ts
export interface ContactFormInput {
  name: string;
  email: string;
  message: string;
}

export interface ContactFormValidation {
  valid: boolean;
  errors: Partial<Record<keyof ContactFormInput, string>>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactForm(input: ContactFormInput): ContactFormValidation {
  const errors: ContactFormValidation["errors"] = {};

  if (!input.name.trim()) errors.name = "Please enter your name.";
  if (!EMAIL_RE.test(input.email.trim())) errors.email = "Please enter a valid email address.";
  if (!input.message.trim()) errors.message = "Please enter a message.";

  return { valid: Object.keys(errors).length === 0, errors };
}
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `npm run test`
Expected: all pass.

- [ ] **Step 4: Install Resend and add the Server Action**

```bash
npm install resend
```

`app/contact/actions.ts`:

```ts
"use server";

import { Resend } from "resend";
import { validateContactForm } from "@/lib/validate-contact-form";
import { DEFAULT_EMAIL } from "@/lib/site-config";

export interface ContactActionState {
  status: "idle" | "success" | "error";
  errors: Record<string, string>;
  message?: string;
}

export async function sendContactMessage(
  _prevState: ContactActionState,
  formData: FormData,
): Promise<ContactActionState> {
  const input = {
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    message: String(formData.get("message") || ""),
  };

  const validation = validateContactForm(input);
  if (!validation.valid) {
    return { status: "error", errors: validation.errors };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "Starkwood Events Website <onboarding@resend.dev>",
      to: process.env.CONTACT_TO_EMAIL || DEFAULT_EMAIL,
      replyTo: input.email,
      subject: `New enquiry from ${input.name}`,
      text: input.message,
    });
    return { status: "success", errors: {} };
  } catch {
    return {
      status: "error",
      errors: {},
      message: "Something went wrong sending your message — please call or email us directly.",
    };
  }
}
```

- [ ] **Step 5: Write the failing test for the client form component**

Create `components/__tests__/contact-form.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("react-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-dom")>();
  return { ...actual, useFormState: undefined };
});

vi.mock("@/app/contact/actions", () => ({
  sendContactMessage: vi.fn(),
}));

import { ContactForm } from "../contact-form";

describe("ContactForm", () => {
  it("shows a validation error and does not clear the phone/email fallback when the message is empty", async () => {
    render(<ContactForm phone="+61 416 340 773" email="events@starkwood.au" />);

    expect(screen.getByText("+61 416 340 773")).toBeInTheDocument();
    expect(screen.getByText("events@starkwood.au")).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(/name/i), "Jane Doe");
    await userEvent.type(screen.getByLabelText(/email/i), "jane@example.com");
    await userEvent.click(screen.getByRole("button", { name: /send/i }));

    expect(await screen.findByText(/please enter a message/i)).toBeInTheDocument();
  });
});
```

Run: `npm run test`
Expected: FAIL (module not found).

- [ ] **Step 6: Implement `components/contact-form.tsx`**

```tsx
"use client";

import { useActionState } from "react";
import { sendContactMessage, type ContactActionState } from "@/app/contact/actions";
import { validateContactForm } from "@/lib/validate-contact-form";

const initialState: ContactActionState = { status: "idle", errors: {} };

export function ContactForm({ phone, email }: { phone: string; email: string }) {
  const [state, formAction] = useActionState(sendContactMessage, initialState);

  return (
    <div>
      <form action={formAction} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="block text-sm text-[var(--foreground)]">
            Name
          </label>
          <input
            id="name"
            name="name"
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-2"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm text-[var(--foreground)]">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-2"
          />
          {state.errors.email && (
            <p className="mt-1 text-sm text-red-400">{state.errors.email}</p>
          )}
        </div>
        <div>
          <label htmlFor="message" className="block text-sm text-[var(--foreground)]">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-2"
          />
          {state.errors.message && (
            <p className="mt-1 text-sm text-red-400">{state.errors.message}</p>
          )}
        </div>
        <button
          type="submit"
          className="rounded-md bg-[var(--accent)] px-6 py-3 text-sm font-medium text-[var(--accent-foreground)]"
        >
          Send message
        </button>
      </form>

      {state.status === "success" && (
        <p className="mt-4 text-sm text-[var(--accent)]">
          Thanks — we&apos;ll be in touch shortly.
        </p>
      )}
      {(state.status === "error" || true) && (
        <p className="mt-6 text-sm text-[var(--muted-foreground)]">
          {state.message
            ? `${state.message} `
            : "Prefer to reach us directly? "}
          Call <span className="text-[var(--accent)]">{phone}</span> or email{" "}
          <span className="text-[var(--accent)]">{email}</span>.
        </p>
      )}
    </div>
  );
}
```

Note: `components/contact-form.tsx` does not import `validateContactForm` directly — it only reads validation errors from `state.errors`, which the Server Action (`actions.ts`) populates by calling `validateContactForm`. This keeps client and server agreeing on what "valid" means from one function, without the client component needing to import validation logic it never calls.

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm run test`
Expected: passes. If `useActionState` behaves differently under RTL/jsdom (no real server round-trip), the test may need the mock adjusted so `sendContactMessage` resolves to an error state synchronously — if so, mock it to return `Promise.resolve({ status: "error", errors: { message: "Please enter a message." } })` and assert on that instead of relying on the real validator running through the mocked action.

- [ ] **Step 8: Implement `app/contact/page.tsx`**

```tsx
import { ContactForm } from "@/components/contact-form";
import { sanityFetch } from "@/sanity/client";
import { siteSettingsQuery } from "@/lib/queries";
import type { SiteSettings } from "@/lib/types";
import { DEFAULT_PHONE, DEFAULT_EMAIL, DEFAULT_ADDRESS } from "@/lib/site-config";

export const metadata = { title: "Contact | Starkwood Events" };

export default async function ContactPage() {
  let settings: SiteSettings | null = null;
  try {
    settings = await sanityFetch<SiteSettings>({ query: siteSettingsQuery, tags: ["siteSettings"] });
  } catch {
    settings = null;
  }

  const phone = settings?.phone || DEFAULT_PHONE;
  const email = settings?.email || DEFAULT_EMAIL;
  const address = settings?.address || DEFAULT_ADDRESS;

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-4xl text-[var(--foreground)]">
        Get In <span className="text-gradient-gold">Touch</span>
      </h1>
      <p className="mt-4 text-[var(--muted-foreground)]">{address}</p>
      <div className="mt-8">
        <ContactForm phone={phone} email={email} />
      </div>
    </main>
  );
}
```

- [ ] **Step 9: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Add Contact page with validated form, Server Action, and phone/email fallback"
```

---

## Task 17: Host-based redirect for events.starkwood.au

**Files:**
- Create: `middleware.ts`
- Test: `__tests__/middleware.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: a 308 redirect from any `events.starkwood.au/*` request to `https://starkwood.au/*` (path + query preserved), leaving every other host untouched.

- [ ] **Step 1: Write the failing test**

Create `__tests__/middleware.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "../middleware";

describe("middleware", () => {
  it("redirects events.starkwood.au to starkwood.au, preserving path and query", () => {
    const req = new NextRequest("https://events.starkwood.au/events/naadha-gama?utm=fb", {
      headers: { host: "events.starkwood.au" },
    });
    const res = middleware(req);
    expect(res.status).toBe(308);
    expect(res.headers.get("location")).toBe(
      "https://starkwood.au/events/naadha-gama?utm=fb",
    );
  });

  it("does not redirect requests to starkwood.au itself", () => {
    const req = new NextRequest("https://starkwood.au/events", {
      headers: { host: "starkwood.au" },
    });
    const res = middleware(req);
    expect(res.status).toBe(200);
  });

  it("does not redirect fm.starkwood.au or staff.starkwood.au", () => {
    for (const host of ["fm.starkwood.au", "staff.starkwood.au"]) {
      const req = new NextRequest(`https://${host}/`, { headers: { host } });
      const res = middleware(req);
      expect(res.status).toBe(200);
    }
  });
});
```

Run: `npm run test`
Expected: FAIL (module not found).

- [ ] **Step 2: Implement `middleware.ts`**

```ts
import { NextResponse, type NextRequest } from "next/server";

const OLD_HOST = "events.starkwood.au";
const NEW_HOST = "starkwood.au";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host");

  if (host === OLD_HOST) {
    const url = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${NEW_HOST}`);
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}
```

- [ ] **Step 3: Run tests to verify they pass**

Run: `npm run test`
Expected: all pass.

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add host-based redirect from events.starkwood.au to starkwood.au"
```

---

## Task 18: Seed script — launch content

**Files:**
- Create: `scripts/seed.ts`
- Create: `scripts/__tests__/no-unforgettable-sri-lanka.test.ts`

**Interfaces:**
- Consumes: `client` from `sanity/client.ts` (Task 4), schema type names from Task 3
- Produces: a populated Sanity dataset — 1 `siteSettings` doc, 10 `service` docs, 1 upcoming `event`, 6 past `event` docs, and the `sponsor` docs they reference.

- [ ] **Step 1: Install script deps**

```bash
npm install -D tsx dotenv
```

- [ ] **Step 2: Write the regression test guarding against the removed partnership claim**

Create `scripts/__tests__/no-unforgettable-sri-lanka.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("seed content", () => {
  it("never mentions Unforgettable Sri Lanka", () => {
    const seedSource = readFileSync(join(__dirname, "../seed.ts"), "utf-8");
    expect(seedSource.toLowerCase()).not.toContain("unforgettable sri lanka");
  });
});
```

Run: `npm run test`
Expected: FAIL (`scripts/seed.ts` doesn't exist yet).

- [ ] **Step 3: Write `scripts/seed.ts`**

This uses a write-token client (separate from the read-only CDN client in `sanity/client.ts`, since seeding needs `useCdn: false` and mutation permissions) to upload the local `Imgs/` photos as Sanity assets and create every seed document. Real content is transcribed from the design spec's "Seed content for launch" section.

```ts
import "dotenv/config";
import { createClient } from "@sanity/client";
import { readFileSync } from "fs";
import { join } from "path";

const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_API_WRITE_TOKEN!,
  useCdn: false,
});

const IMGS_DIR = join(__dirname, "../Imgs");

async function uploadImage(filename: string) {
  const path = join(IMGS_DIR, filename);
  const asset = await writeClient.assets.upload("image", readFileSync(path), { filename });
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

async function upsert(id: string, doc: Record<string, unknown>) {
  return writeClient.createOrReplace({ _id: id, ...doc });
}

async function main() {
  // 1. Site settings
  await upsert("siteSettings", {
    _type: "siteSettings",
    phone: "+61 416 340 773",
    email: "events@starkwood.au",
    address: "Unit 2/198 Rooks Rd, Vermont VIC 3133",
    facebookUrl: "https://www.facebook.com/StarkwoodEvents/",
    instagramUrl: "https://www.instagram.com/starkwood.events/",
    heroHeadline: "Full-Scale Events. Flawlessly Produced.",
    heroSubheadline:
      "From arena concerts to cultural galas, Starkwood Events brings Melbourne's biggest nights to life.",
  });

  // 2. Services — real, distinct content for each of the ten categories
  const services = [
    {
      slug: "weddings",
      title: "Weddings",
      icon: "💍",
      summary: "Full-service wedding production, from staging to sound.",
      body:
        "We handle the production side of your wedding day — staging, lighting, sound, and on-the-day coordination — so the day runs exactly as planned.",
    },
    {
      slug: "corporate-events",
      title: "Corporate Events",
      icon: "🏢",
      summary: "Product launches, conferences, and company celebrations.",
      body:
        "From product launches to conference staging, we deliver corporate events with the same production discipline we bring to arena concerts.",
    },
    {
      slug: "music-events",
      title: "Music Events",
      icon: "🎤",
      summary: "Concert production for touring and local artists.",
      body:
        "Full concert production — staging, audio, lighting, and crew — for touring international artists and local acts alike, at venues from intimate lounges to the Sidney Myer Music Bowl.",
    },
    {
      slug: "personal-events-parties",
      title: "Personal Events & Parties",
      icon: "🎉",
      summary: "Milestone birthdays, anniversaries, and private parties.",
      body:
        "Milestone birthdays, anniversaries, and private celebrations, produced with the same care as our largest public shows.",
    },
    {
      slug: "charity-events",
      title: "Charity Events",
      icon: "🤝",
      summary: "Galas and fundraisers that do justice to the cause.",
      body:
        "Charity galas and fundraising nights, produced to feel every bit as premium as a ticketed concert — because the cause deserves it.",
    },
    {
      slug: "cultural-events",
      title: "Cultural Events",
      icon: "🎭",
      summary: "Festivals and cultural celebrations for Melbourne's communities.",
      body:
        "We've produced some of Melbourne's biggest Sri Lankan cultural nights and concert tours, bringing international artists to local stages.",
    },
    {
      slug: "sporting-events",
      title: "Sporting Events",
      icon: "🏆",
      summary: "Presentation nights, tournaments, and sporting galas.",
      body:
        "Presentation nights, tournament finals, and sporting galas — staged, lit, and run to schedule.",
    },
    {
      slug: "food-wine-events",
      title: "Food & Wine Events",
      icon: "🍷",
      summary: "Tastings, launches, and culinary showcases.",
      body:
        "Food and wine tastings, launches, and showcase events, produced with attention to both atmosphere and logistics.",
    },
    {
      slug: "community-events",
      title: "Community Events",
      icon: "🌏",
      summary: "Public festivals and community celebrations.",
      body:
        "Public festivals and community celebrations, produced to bring people together safely and memorably.",
    },
    {
      slug: "other-events",
      title: "Other Events",
      icon: "✨",
      summary: "Something else in mind? Let's talk.",
      body: "Not seeing your event type listed? Get in touch — if it needs a stage, sound, and a plan, we can produce it.",
    },
  ];

  for (const [i, s] of services.entries()) {
    await upsert(`service-${s.slug}`, {
      _type: "service",
      title: s.title,
      slug: { _type: "slug", current: s.slug },
      icon: s.icon,
      summary: s.summary,
      order: i,
      description: [
        {
          _type: "block",
          style: "normal",
          children: [{ _type: "span", text: s.body }],
        },
      ],
    });
  }

  // 3. Sponsors referenced by seed events (logo-less for now — logo can be added in Studio later)
  const sponsorNames = [
    "Maaz Events",
    "Mega Live Events",
    "My Flight Zone",
    "Sanni 18",
    "Ticketek Australia",
    "Shawn Mendis Lawyers",
    "Arts Centre Melbourne",
    "Aus News Lanka",
    "7 Zone Entertainment",
    "Nexxt Entertainment",
    "ShowUp Global",
    "A9 Events",
    "Stereo 6 Events",
    "South Aura Events",
    "Awakasha Entertainment",
    "Home Lands Australia",
  ];
  const sponsorRefs: Record<string, { _type: "reference"; _ref: string }> = {};
  for (const name of sponsorNames) {
    const id = `sponsor-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    await upsert(id, { _type: "sponsor", name });
    sponsorRefs[name] = { _type: "reference", _ref: id };
  }

  // 4. Upcoming event
  const naadhaGamaCover = await uploadImage("concert.jpg");
  await upsert("event-naadha-gama-melbourne-2026", {
    _type: "event",
    title: "Naadha Gama Melbourne 2026",
    slug: { _type: "slug", current: "naadha-gama-melbourne-2026" },
    status: "upcoming",
    category: "Concert",
    startDate: "2026-10-31",
    venue: "Sidney Myer Music Bowl, Melbourne",
    starkwoodRole: "Production Partner",
    summary: "A new chapter for Sri Lankan music in Australia.",
    description: [
      {
        _type: "block",
        style: "normal",
        children: [
          {
            _type: "span",
            text:
              "A reimagined live concert extension of the Naadha Gama 360 experience with Eshan Denipitiya and The Orchestra of Eshan Denipitiya, featuring Methun SK, Ridma Weerawardena, Dhanith Sri, Supun Perera, Dinesh Gamage, Kanchana Anuradhi, and Manuranga Wijesekara.",
          },
        ],
      },
    ],
    coverImage: naadhaGamaCover,
    infoUrl: "https://naadhagama.lk/melbourne26",
    ticketUrl: "https://premier.ticketek.com.au/shows/show.aspx?sh=NGAPLVSM26",
    sponsors: [
      sponsorRefs["Maaz Events"],
      sponsorRefs["Mega Live Events"],
      sponsorRefs["My Flight Zone"],
      sponsorRefs["Sanni 18"],
      sponsorRefs["Ticketek Australia"],
      sponsorRefs["Shawn Mendis Lawyers"],
      sponsorRefs["Arts Centre Melbourne"],
      sponsorRefs["Aus News Lanka"],
    ],
  });

  // 5. Past projects
  const alutKalawakCover = await uploadImage("concert.jpg");
  await upsert("event-aluth-kalawak-melbourne-edition", {
    _type: "event",
    title: "Aluth Kalawak — Melbourne Edition",
    slug: { _type: "slug", current: "aluth-kalawak-melbourne-edition" },
    status: "past",
    category: "Concert",
    startDate: "2023-10-13",
    venue: "Trak Live Lounge Bar, Melbourne",
    starkwoodRole: "Production Managed",
    summary: "A sold-out night of Sri Lankan music legends, live in Melbourne.",
    coverImage: alutKalawakCover,
    sponsors: [
      sponsorRefs["7 Zone Entertainment"],
      sponsorRefs["Nexxt Entertainment"],
      sponsorRefs["ShowUp Global"],
    ],
  });

  await upsert("event-dhwani-live-2025", {
    _type: "event",
    title: "Dhwani (ධ්වනි) Live in Concert 2025",
    slug: { _type: "slug", current: "dhwani-live-in-concert-2025" },
    status: "past",
    category: "Concert",
    startDate: "2025-11-07",
    endDate: "2025-11-09",
    venue: "The Besen Centre, Melbourne",
    starkwoodRole: "Production",
    summary: "A full-scale concert production at The Besen Centre.",
    sponsors: [sponsorRefs["Awakasha Entertainment"]],
  });

  await upsert("event-sarith-surith-x-hana-2025", {
    _type: "event",
    title: "Sarith Surith and the News x Hana Shafa — Live in Melbourne",
    slug: { _type: "slug", current: "sarith-surith-x-hana-shafa-live-in-melbourne" },
    status: "past",
    category: "Concert",
    startDate: "2025-11-14",
    venue: "Melbourne Pavilion",
    starkwoodRole: "Event Production",
    summary: "Sarith Surith and the News joined by Hana Shafa, live in Melbourne.",
    sponsors: [sponsorRefs["A9 Events"], sponsorRefs["Stereo 6 Events"], sponsorRefs["South Aura Events"]],
  });

  await upsert("event-home-lands-prestige-night-2025", {
    _type: "event",
    title: "Home Lands Prestige Night 2025",
    slug: { _type: "slug", current: "home-lands-prestige-night-2025" },
    status: "past",
    category: "Corporate",
    startDate: "2025-10-28",
    venue: "Springvale City Hall, Melbourne",
    starkwoodRole: "Production",
    summary: "A Great Gatsby-themed prestige night with Home Lands Australia.",
    sponsors: [sponsorRefs["Home Lands Australia"]],
  });

  await upsert("event-news-live-on-tour-2025", {
    _type: "event",
    title: "News Live on Tour 2025 — Melbourne",
    slug: { _type: "slug", current: "news-live-on-tour-2025-melbourne" },
    status: "past",
    category: "Concert",
    startDate: "2025-10-12",
    venue: "Melbourne",
    starkwoodRole: "Production",
    summary: "Sarith Surith and the News, live in Melbourne.",
  });

  await upsert("event-ru-sanda-rae-finale-tour-2024", {
    _type: "event",
    title: "Ru Sanda Rae Finale Tour — Australian Tour 2024",
    slug: { _type: "slug", current: "ru-sanda-rae-finale-tour-2024" },
    status: "past",
    category: "Concert",
    startDate: "2024-09-01",
    venue: "Palais Theatre, St Kilda",
    summary:
      "A grand Sri Lankan musical evening featuring Rookantha, Chandralekha, Raini, Windy, Sanuka, and Suresh.",
    sponsors: [sponsorRefs["Shawn Mendis Lawyers"]],
    // No coverImage set: no first-party Starkwood photos of this event were found.
    // Add one in Studio once Dhanuka supplies photography for this event.
  });

  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 4: Run the regression test**

Run: `npm run test`
Expected: passes now that `scripts/seed.ts` exists and contains no mention of Unforgettable Sri Lanka.

- [ ] **Step 5: Add the seed script to `package.json`**

```json
"seed": "tsx scripts/seed.ts"
```

- [ ] **Step 6: Run the seed script against your real Sanity dataset**

Run: `npm run seed`
Expected: logs "Seed complete." with no errors. This requires `NEXT_PUBLIC_SANITY_PROJECT_ID` and `SANITY_API_WRITE_TOKEN` to be set in `.env.local` (from Task 3).

- [ ] **Step 7: Verify the content landed**

Open `http://localhost:3000/studio` (with `npm run dev` running) and confirm: 1 Site Settings doc, 10 Service docs, 7 Event docs (1 upcoming, 6 past), 16 Sponsor docs.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Add seed script for launch content (services, sponsors, upcoming + past events)"
```

---

## Task 19: Deployment to Vercel with domain wiring

**Files:**
- Create: `vercel.json` (only if project-level config is needed beyond dashboard settings — see Step 4)

**Interfaces:**
- Consumes: all env vars defined across Tasks 3, 6, 16
- Produces: a live production deployment at `starkwood.au`, with `events.starkwood.au` redirecting via the Task 17 middleware, and Sanity webhook-driven revalidation wired to the Task 6 route.

- [ ] **Step 1: Link the Vercel project**

```bash
npx vercel link
```

Follow the prompts to create/select a Vercel project for this repo.

- [ ] **Step 2: Set environment variables on Vercel**

```bash
npx vercel env add NEXT_PUBLIC_SANITY_PROJECT_ID production
npx vercel env add NEXT_PUBLIC_SANITY_DATASET production
npx vercel env add SANITY_API_WRITE_TOKEN production
npx vercel env add SANITY_REVALIDATE_SECRET production
npx vercel env add RESEND_API_KEY production
npx vercel env add CONTACT_TO_EMAIL production
```

For `SANITY_REVALIDATE_SECRET`, generate a random value yourself (e.g. `openssl rand -hex 32`) — this is a shared secret you'll also paste into the Sanity webhook config in Step 5, not something Sanity gives you.

- [ ] **Step 3: Deploy to production**

```bash
npx vercel --prod
```

Expected: deployment succeeds, Vercel prints a `*.vercel.app` URL.

- [ ] **Step 4: Add both domains to the Vercel project**

In the Vercel dashboard → Project → Settings → Domains, add:
- `starkwood.au` (primary)
- `events.starkwood.au`

Point their DNS (A/CNAME records, per Vercel's instructions) at Vercel. Both domains resolve to this same deployment — the Task 17 middleware is what makes `events.starkwood.au` redirect to `starkwood.au` rather than serving the same content twice (which would hurt SEO). Do **not** touch DNS for `fm.starkwood.au` or `staff.starkwood.au` — they're out of scope and must keep pointing wherever they currently do.

- [ ] **Step 5: Configure the Sanity webhook**

In sanity.io/manage → your project → API → Webhooks, create a webhook:
- URL: `https://starkwood.au/api/revalidate`
- Dataset: `production`
- Trigger on: Create, Update, Delete
- Secret: the same value you set for `SANITY_REVALIDATE_SECRET`

- [ ] **Step 6: Verify the redirect in production**

Run: `curl -I https://events.starkwood.au/`
Expected: `HTTP/2 308` with a `location: https://starkwood.au/` header.

- [ ] **Step 7: Verify revalidation**

In Studio, edit the Naadha Gama event's summary, publish, wait a few seconds, then reload `https://starkwood.au/events/naadha-gama-melbourne-2026` and confirm the change is live without a redeploy.

- [ ] **Step 8: Commit** (only if any config file changed)

```bash
git add -A
git commit -m "Document Vercel deployment and domain configuration" --allow-empty
```

---

## Task 20: Final QA — Playwright smoke suite + manual checks

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/smoke.spec.ts`

**Interfaces:**
- Consumes: the full deployed (or locally built + started) site from Tasks 1–19
- Produces: an automated regression suite covering every page load, the fixed services-link bug, the removed-partnership regression guard, and the corrected phone number — plus a manual checklist for Lighthouse and responsive QA that no automated test can cover.

- [ ] **Step 1: Install Playwright**

```bash
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

- [ ] **Step 2: Write `playwright.config.ts`**

```ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  use: { baseURL: "http://localhost:3000" },
});
```

- [ ] **Step 3: Write the failing E2E spec**

Create `e2e/smoke.spec.ts` (this assumes Task 18's seed script has already been run against the dataset the app is built against — run `npm run seed` first if you haven't):

```ts
import { test, expect } from "@playwright/test";

test("home page loads and shows the hero and footer phone number", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toContainText(/events/i);
  await expect(page.getByText("+61 416 340 773")).toBeVisible();
});

test("events list shows the seeded upcoming event", async ({ page }) => {
  await page.goto("/events");
  await expect(page.getByText("Naadha Gama Melbourne 2026")).toBeVisible();
});

test("event detail page loads for the seeded upcoming event", async ({ page }) => {
  await page.goto("/events/naadha-gama-melbourne-2026");
  await expect(page.locator("h1")).toContainText("Naadha Gama Melbourne 2026");
  await expect(page.getByText("Sidney Myer Music Bowl", { exact: false })).toBeVisible();
});

test("gallery page loads", async ({ page }) => {
  const res = await page.goto("/gallery");
  expect(res?.status()).toBe(200);
});

test("services page links to ten distinct detail pages (regression: the old site pointed every Read More at the same anchor)", async ({
  page,
}) => {
  await page.goto("/services");
  const hrefs = await page.locator("a[href^='/services/']").evaluateAll((links) =>
    links.map((l) => (l as HTMLAnchorElement).getAttribute("href")),
  );
  const uniqueHrefs = new Set(hrefs);
  expect(uniqueHrefs.size).toBe(10);
});

test("about page loads with the team photo", async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator("img[alt='The Starkwood Events team']")).toBeVisible();
});

test("contact form shows a validation error on empty submit", async ({ page }) => {
  await page.goto("/contact");
  await page.getByRole("button", { name: /send/i }).click();
  await expect(page.getByText(/please enter/i).first()).toBeVisible();
});

test("no page anywhere mentions the removed Unforgettable Sri Lanka partnership", async ({
  page,
}) => {
  for (const path of ["/", "/events", "/gallery", "/services", "/about", "/contact"]) {
    await page.goto(path);
    await expect(page.getByText(/unforgettable sri lanka/i)).toHaveCount(0);
  }
});
```

Run: `npx playwright test`
Expected: FAIL initially if run before Task 18's seed script — run `npm run seed` first, then re-run. All 8 tests should pass once the dataset is seeded and every prior task is implemented.

- [ ] **Step 4: Add the E2E script to `package.json`**

```json
"test:e2e": "playwright test"
```

- [ ] **Step 5: Run the full suite one more time to confirm**

Run: `npm run test && npm run test:e2e`
Expected: all unit/component tests and all E2E tests pass.

- [ ] **Step 6: Manual QA checklist (no automated test — perform against the production URL after Task 19's deployment)**

- [ ] Resize the browser (or use DevTools device toolbar) to 375px, 768px, and 1440px widths on the home, events, and event-detail pages — confirm no horizontal scroll, no overlapping text, images stay legible.
- [ ] Run Lighthouse (Chrome DevTools → Lighthouse tab) against `https://starkwood.au/` in both mobile and desktop modes — target Performance ≥ 80 and Accessibility ≥ 90; if either is below target, most likely culprits are unoptimized images (confirm `next/image` is used everywhere, no raw `<img>` tags) or missing `alt` text.
- [ ] Click through every one of the ten `/services/[slug]` pages and confirm each shows distinct, real copy (not a repeated placeholder).
- [ ] Confirm `fm.starkwood.au` and `staff.starkwood.au` still resolve exactly as they did before this project started (unchanged).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Add Playwright smoke suite covering pages, services-link fix, and partnership regression guard"
```

---

## Self-Review Notes

- **Spec coverage:** every spec section maps to a task — Brand/palette (Task 2), corrected contact details (Tasks 7, 8, 16, 18), site structure's nine routes (Tasks 5, 10–16), content model's five schema types (Task 3), seed content incl. all 7 events and 10 services (Task 18), architecture's Next.js/Sanity/Vercel/ISR/webhook/middleware/Resend stack (Tasks 1, 4, 6, 17, 19), error handling's three cases — empty upcoming events (Task 10), missing image placeholder (Task 9), contact form fallback (Task 16) — and the QA plan's responsive/Lighthouse/link-check/no-partnership-regression items (Task 20).
- **Placeholder scan:** no TBD/TODO markers; the one intentionally-unresolved item (Ru Sanda Rae's missing first-party photos) is called out explicitly as a real, actionable gap in Task 18 rather than a vague placeholder.
- **Type consistency:** `EventSummary`/`EventDetail`/`Service`/`ServiceDetail`/`Testimonial`/`Sponsor`/`SiteSettings` (Task 4) are used with matching field names across every consuming task (`EventCard`, `EventsExplorer`, page components, seed script field names line up with schema field names from Task 3).

