# Project Status — Starkwood Events website

**Date:** 2026-09-29 · **Stage:** MVP complete, ready for first Vercel deployment

## Summary

The site is feature-complete for launch. It builds cleanly for production, all automated checks
pass, and it now has error pages, logging, a health endpoint and a backup/restore plan. What
remains is setup on Vercel/Resend/Sanity, not code (see [Next steps](#next-steps-to-go-live)).

## Health check (verified 2026-09-29)

| Check | Result |
|---|---|
| Unit/component tests (Vitest) | ✅ 71 / 71 passing, 26 files |
| Lint (ESLint) | ✅ clean |
| Type check (`tsc --noEmit`) | ✅ clean |
| Production build (`next build`) | ✅ success — 30 pages prerendered |
| Runtime smoke test (`next start`) | ✅ `/` 200, unknown URL 404, `/api/health` 200 with Sanity reachable |
| Browser console (headless Chromium, all pages) | ✅ no hydration, image or deprecation warnings |
| Portal link, end to end (local portal + DB) | ✅ live schedule shown; fallback shown when portal is down |
| End-to-end tests (Playwright) | ⚪ not run this pass |

**Stack:** Next.js 16.3 (App Router) · React 19.2 · Tailwind CSS 4 · Sanity CMS (embedded Studio at
`/studio`) · Resend (contact email) · Vitest + Playwright.

## What's built

| Area | Status | Notes |
|---|---|---|
| Home | ✅ | Hero, next-up event, movie spotlight + national cinema schedule, run sheet, stats & reach, services teaser, past projects, testimonials, sponsors, contact CTA |
| Events list + detail | ✅ | Upcoming & Live filter; statically generated per event |
| Services list + detail | ✅ | From Sanity |
| Gallery | ✅ | Grouped by event |
| About, Contact | ✅ | Contact form → Resend email |
| CMS (Sanity Studio) | ✅ | `/studio`; schemas: event, service, testimonial, sponsor, siteSettings |
| On-demand revalidation | ✅ | Sanity webhook → `/api/revalidate`, plus 1 h fallback |
| Old domain redirect | ✅ | `events.starkwood.au` → `starkwood.au` (308) in `proxy.ts` |
| Loading state | ✅ | Branded crest spinner |
| **Error handling** | ✅ new | `error.tsx`, `global-error.tsx`, `not-found.tsx`; logged CMS/email/webhook failures |
| **Monitoring** | ✅ new | `GET /api/health` (Sanity reachability + env var presence) |
| **Cinema Portal link** | ✅ new | Movie spotlight's national schedule is fed live from the Eda Ra Cinema Portal (CinemaTracker) at `events.starkwood.au`; built-in list is the fallback. Footer links to the portal. See below |
| **Disaster recovery** | ✅ new | Sanity backup script + weekly GitHub Action; runbooks in [DISASTER_RECOVERY.md](./DISASTER_RECOVERY.md) |

## Changes in this release

- **Bug fix — contact form reported success when the email failed.** Resend's SDK returns
  `{ error }` instead of throwing, so an unverified sender or bad API key showed visitors
  "sent". It now shows the phone/email fallback and logs the Resend error.
- Branded error, global-error and 404 pages with phone/email so enquiries are never lost.
- CMS fetch failures are logged (`[sanity] …`) instead of being silently swallowed.
- Revalidate webhook no longer returns internal error messages to callers.
- `middleware.ts` → `proxy.ts` (the `middleware` name is deprecated in Next.js 16).
- `/api/health` endpoint, `npm run backup:sanity`, `.github/workflows/sanity-backup.yml`.

## Cinema Portal (CinemaTracker) link

| | |
|---|---|
| Website (testing) | https://starkwood-events-sepia.vercel.app → later `starkwood.au` |
| Portal | `events.starkwood.au` (separate Vercel project from `../CinemaTracker`) |
| Feed | Portal `GET /api/public/screenings?film=eda-ra` — Confirmed/Completed screenings only; date, time, city, cinema, screen, seats, sold-out. No invoices, contacts, revenue or notes. CDN-cached 5 min |
| Website side | `lib/cinema-portal.ts`; cached 1 h, 5 s timeout; falls back to the built-in list if the portal is down, errors or has nothing published. `/api/health` reports `cinemaPortal` (informational — never marks the site degraded) |
| Config | Website: `CINEMA_PORTAL_URL` (default `https://events.starkwood.au`). Portal: `PUBLIC_ORGANIZATION_SLUG` (default `starkwood`) |

**Domain note:** `proxy.ts` 308-redirects `events.starkwood.au` → `starkwood.au`. Once
`events.starkwood.au` is assigned to the portal's Vercel project that redirect never runs, and old
shared links to `events.starkwood.au/...` will land on the portal instead of the website.

## Known issues & risks

| Item | Impact | Action |
|---|---|---|
| `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` are empty locally | Contact form cannot send until set | Create a Resend key, verify `starkwood.au` in Resend, set `CONTACT_FROM_EMAIL=website@starkwood.au` in Vercel |
| `SANITY_REVALIDATE_SECRET` empty locally | Webhook unusable; content still refreshes hourly | Generate a random secret; set in Vercel and in the Sanity webhook |
| Raaga 26 is hardcoded in `lib/static-events.ts` | Must be edited in code, not CMS | Publish it in Sanity, then delete the static entry (CMS version wins automatically) |
| `vitest.config.ts` loaded as CommonJS | Warning only | Rename to `.mts` or add `"type": "module"` |
| Secrets are not backed up anywhere | Slower recovery if Vercel is lost | Store them in the team password manager |

## Next steps to go live

1. **Vercel:** import `DhanukaDB/StarkwoodEvents`, framework *Next.js*, production branch **`main`**.
2. **Environment variables** (Production + Preview) from `.env.local.example`:
   `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_REVALIDATE_SECRET`,
   `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, and `CINEMA_PORTAL_URL` (the portal's URL —
   its `*.vercel.app` preview URL until `events.starkwood.au` is live). (`SANITY_API_WRITE_TOKEN` is only
   for `npm run seed` — don't add it to Vercel.)
3. **Deploy**, then open `<deployment-url>/api/health` — expect `"status":"ok"` and every `env` value `true`.
4. **Domains:** add `starkwood.au` (and `events.starkwood.au`, which redirects) in Vercel → Domains; update DNS.
5. **Sanity** (sanity.io/manage): add the production domain to **CORS origins** (with credentials,
   for `/studio`); add a **webhook** → `https://starkwood.au/api/revalidate`, secret = `SANITY_REVALIDATE_SECRET`,
   projection `{_type}`.
6. **Resend:** verify the `starkwood.au` sending domain; send a test enquiry from `/contact`.
7. **DR setup:** add `SANITY_AUTH_TOKEN` + `NEXT_PUBLIC_SANITY_PROJECT_ID` GitHub secrets, run the
   *Sanity backup* workflow once; point an uptime monitor at `/api/health`.
8. Run `npm run test:e2e` against the preview deployment before switching DNS.
