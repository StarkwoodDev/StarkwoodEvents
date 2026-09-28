# Starkwood Events website

Marketing site for Starkwood Events (Melbourne) — Next.js 16 App Router, Sanity CMS, Resend.

- **Project status & go-live checklist:** [docs/STATUS.md](docs/STATUS.md)
- **Error handling, backups & recovery runbooks:** [docs/DISASTER_RECOVERY.md](docs/DISASTER_RECOVERY.md)

## Local development

```bash
cp .env.local.example .env.local   # fill in values
npm install
npm run dev                        # http://localhost:3000, CMS at /studio
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` / `build` / `start` | Next.js dev server / production build / serve build |
| `npm test` | Vitest unit + component tests |
| `npm run test:e2e` | Playwright smoke tests (builds and starts the app) |
| `npm run lint` | ESLint |
| `npm run seed` | Seed Sanity with starter content (needs `SANITY_API_WRITE_TOKEN`) |
| `npm run backup:sanity` | Export the Sanity dataset to `backups/` |

## Deployment

Deployed on Vercel from the `main` branch. Health check: `GET /api/health`.
See [docs/STATUS.md](docs/STATUS.md#next-steps-to-go-live).
