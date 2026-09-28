# Disaster Recovery & Error Handling

How the Starkwood Events site behaves when something breaks, and how to get it back.

## What we are protecting

| Asset | Where it lives | Backed up by |
|---|---|---|
| Source code, static images, hardcoded events | GitHub `DhanukaDB/StarkwoodEvents` | Git history (every clone is a full copy) |
| CMS content (events, services, testimonials, sponsors, site settings, uploaded images) | Sanity dataset `production` | `npm run backup:sanity` + weekly GitHub Action (see below) |
| Deployments | Vercel | Every deployment is immutable; roll back instantly |
| Secrets (API keys, webhook secret) | Vercel env vars + `.env.local` | **Not backed up automatically** — keep a copy in the team password manager |

**Targets:** RTO (time to restore) &lt; 1 hour. RPO (max content loss) ≤ 7 days with the weekly
backup; run a manual backup before any large content change to bring this to zero.

## Built-in resilience (already in the code)

| Failure | What visitors see | Where |
|---|---|---|
| Sanity is down / slow / misconfigured | Pages keep rendering from the Next.js cache (1 h revalidate). If never cached, pages render with built-in fallbacks: default phone/email/address, static events, empty lists. The error is logged as `[sanity] fetch for "<tag>" failed`. | `sanity/client.ts` → `safeFetch` |
| A page throws while rendering | Branded "This page didn't load" screen with **Try again**, phone and email, and a reference code that matches the Vercel log entry. | `app/error.tsx` |
| The root layout itself fails | Self-contained fallback page (no CSS/fonts needed) with phone, email and **Try again**. | `app/global-error.tsx` |
| Unknown URL or deleted event/service | Branded 404 linking to Events and Home. | `app/not-found.tsx` |
| Email (Resend) fails — bad key, unverified domain, quota | Visitor is told it failed and shown phone/email to contact directly. Logged as `[contact] failed to send enquiry email`. | `app/contact/actions.ts` |
| Sanity webhook fails | Returns 500 with a generic message (no internal detail leaked); logged as `[revalidate] webhook failed`. Content still refreshes within 1 h via time-based revalidation. | `app/api/revalidate/route.ts` |

## Monitoring

`GET /api/health` returns:

```json
{ "status": "ok", "checks": { "sanity": "ok", "env": { "RESEND_API_KEY": true, "...": true } }, "time": "..." }
```

- **200** — everything reachable. **503** — Sanity unreachable (site still serves cached content).
- `env` shows which required variables are set (true/false only — values are never exposed).
- Point an uptime monitor (Vercel Checks, UptimeRobot, Better Stack — free tiers are fine) at
  `https://starkwood.au/api/health`, every 5 minutes, alerting on non-200.
- Search Vercel → Project → **Logs** for `[sanity]`, `[contact]`, `[revalidate]`, `[health]`, `[app]`.

## Backups

### Manual (before big content changes)

```bash
npm run backup:sanity        # writes backups/sanity-production-<UTC timestamp>.tar.gz
```

Requires `NEXT_PUBLIC_SANITY_PROJECT_ID` in `.env.local` and being logged in (`npx sanity login`)
or `SANITY_AUTH_TOKEN` set. `backups/` is git-ignored — copy the file somewhere safe (Drive/OneDrive).

### Automatic (weekly)

`.github/workflows/sanity-backup.yml` runs every Sunday 16:00 UTC and on demand
(GitHub → Actions → *Sanity backup* → *Run workflow*). The export is stored as a workflow
artifact for 90 days.

**One-time setup** — GitHub → repo → Settings → Secrets and variables → Actions:

- `SANITY_AUTH_TOKEN` — sanity.io/manage → project → API → Tokens → add a **Viewer** token.
- `NEXT_PUBLIC_SANITY_PROJECT_ID` — the Sanity project ID.

Until both are set the workflow skips with a warning instead of failing.

## Recovery runbooks

### 1. A bad deploy is live

1. Vercel → Project → **Deployments** → pick the last good deployment → **⋯ → Instant Rollback**
   (or `vercel rollback <deployment-url>`). Takes seconds; no rebuild.
2. Fix forward on a branch, verify on the preview URL, then merge.

### 2. CMS content was deleted or corrupted

1. Download the latest backup (local `backups/` or the GitHub Action artifact).
2. Restore — **this overwrites matching documents**:
   ```bash
   npx sanity datasets import sanity-production-<stamp>.tar.gz production \
     -p <projectId> --replace
   ```
   To inspect first, import into a scratch dataset (`npx sanity datasets create restore-test`)
   and point a preview deployment at it via `NEXT_PUBLIC_SANITY_DATASET`.
3. Trigger revalidation: publish any document in Studio (fires the webhook), or redeploy.

### 3. Sanity has an outage

Nothing to do for visitors — cached pages keep serving. `/api/health` returns 503 until it
recovers. Check status.sanity.io. Avoid redeploying during the outage: a fresh build would
render fallback content in place of the cached real content.

### 4. Contact form emails stop arriving

1. `/api/health` → confirm `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`, `CONTACT_TO_EMAIL` are `true`.
2. Vercel logs → search `[contact]` for the Resend error name (e.g. `invalid_from_address`
   means the sender domain is not verified in Resend).
3. Resend dashboard → Emails / Domains. Visitors are shown the phone number meanwhile.

### 5. Vercel account/project is lost

The repo is self-contained. Create a new Vercel project from GitHub, re-enter the env vars
(listed in `.env.local.example`) from the password manager, re-point the `starkwood.au` DNS,
and update the Sanity webhook URL + CORS origins in sanity.io/manage.

### 6. Leaked secret

Rotate at the source (Resend → API keys; Sanity → API tokens / webhook secret), update the
Vercel env var, redeploy. Update the password manager copy.
