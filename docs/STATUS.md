# Project Status — Starkwood Events website

**Date:** 2026-09-29 · **Stage:** MVP complete, ready for first Vercel deployment

## Summary

The site is feature-complete for launch. It builds cleanly for production, all automated checks
pass, and it now has error pages, logging, a health endpoint and a backup/restore plan. What
remains is setup on Vercel/Resend/Sanity, not code (see [Next steps](#next-steps-to-go-live)).

## Health check (verified 2026-09-29)

| Check | Result |
|---|---|
| Unit/component tests (Vitest) | ✅ 61 / 61 passing, 25 files |
| Lint (ESLint) | ✅ clean |
| Type check (`tsc --noEmit`) | ✅ clean |
| Production build (`next build`) | ✅ success — 30 pages prerendered |
| Runtime smoke test (`next start`) | ✅ `/` 200, unknown URL 404, `/api/health` 200 with Sanity reachable |
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

## Known issues & risks

| Item | Impact | Action |
|---|---|---|
| `RESEND_API_KEY` and `CONTACT_FROM_EMAIL` are empty locally | Contact form cannot send until set | Create a Resend key, verify `starkwood.au` in Resend, set `CONTACT_FROM_EMAIL=website@starkwood.au` in Vercel |
| `SANITY_REVALIDATE_SECRET` empty locally | Webhook unusable; content still refreshes hourly | Generate a random secret; set in Vercel and in the Sanity webhook |
| Raaga 26 is hardcoded in `lib/static-events.ts` | Must be edited in code, not CMS | Publish it in Sanity, then delete the static entry (CMS version wins automatically) |
| `@sanity/image-url` default export deprecated | Build warning only | Switch `sanity/image.ts` to `createImageUrlBuilder` |
| `vitest.config.ts` loaded as CommonJS | Warning only | Rename to `.mts` or add `"type": "module"` |
| Secrets are not backed up anywhere | Slower recovery if Vercel is lost | Store them in the team password manager |

## Next steps to go live

1. **Vercel:** import `DhanukaDB/StarkwoodEvents`, framework *Next.js*, production branch **`main`**.
2. **Environment variables** (Production + Preview) from `.env.local.example`:
   `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_REVALIDATE_SECRET`,
   `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`. (`SANITY_API_WRITE_TOKEN` is only
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
