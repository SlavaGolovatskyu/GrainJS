# Zenwayro (Grain SPA)

Product UI rewritten from [`frontend/`](../../frontend/) (Next.js) onto **grain** — Voyage design system, MapLibre explore/plan, quiz, JWT auth, trips, community, legal, admin.

## Run

```bash
npm run dev
```

Open [http://localhost:3000/zenwayro](http://localhost:3000/zenwayro).

`Router` basename `/zenwayro` (Vite SPA rewrite).

## Env

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_URL` | `http://localhost:3001` | Backend API |
| `VITE_GOOGLE_CLIENT_ID` | — | Google Identity Services (Continue with Google) |
| `VITE_MAP_ASSETS_BASE` | `''` | MapLibre style / PMTiles CDN base (OSM fallback if empty) |

## Layout

```
apps/zenwayro/src/
  api/             http + domain modules (auth, trips, pois, …) + endpoints
  utils/           slugify, errors, images
  lib/             pending quiz / trip resume
  design-system/   tokens, ui, layouts
  i18n/            en.json + t()
  pages/           home, auth, quiz, trips, explore, plan, popular, legal, admin
  components/      MapView, Toast, NotificationsPanel
```

## Port phases (from `frontend/`)

0. Foundation — split API, helpers, toast, assets  
1. Auth + quiz pending resume + home popular preview  
2. Explore POIs / filters / engagement  
3. Trips invitations + notifications SSE  
4. Plan editor (itinerary mutations, share, routes)  
5. Popular directory/detail + shared plan by slug  
6. Settings photo + admin panels + isAdmin gate  
7. Hardening — strip demo fallbacks where APIs work  

## Auth

Credentials + Google GIS → `POST /api/auth/sync`. Tokens in `localStorage`; `401` refreshes via `/api/auth/refresh`. Guest quiz prefs stored as `pendingQuiz` and flushed after login.

## Smoke

```bash
npx vite-node scripts/smoke-zenwayro.mjs
```

## Notes

Plain PascalCase Grain components; use flow (`Show`/`For`/`Suspense`) where helpful. Do not delete `frontend/` until parity is signed off.
