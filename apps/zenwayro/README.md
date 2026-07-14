# Zenwayro (framework port)

Product UI ported from `test1/` onto **signals / core / route** — Voyage navy + coral design system (Tailwind v4), MapLibre explore/plan, quiz, auth (+ JWT refresh), trips, community, legal, admin.

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
| `VITE_GOOGLE_CLIENT_ID` | — | Google Identity Services client ID for Continue with Google |

## Layout

```
apps/zenwayro/src/
  design-system/     tokens, ui (Button/Input/Card/…), layouts (AppShell/Auth/Footer)
  api/               client + JWT refresh + createResource helper
  i18n/              en.json from test1 + t()
  pages/             home, auth, quiz, trips, explore, plan, popular, legal, admin
  components/        MapView (maplibre-gl)
```

## Auth

Credentials login/register against the API. Google uses GIS + `POST /api/auth/sync` `{ provider: 'google', idToken }` (same as NextAuth in test1). Access + refresh tokens in `localStorage`; `401` triggers `/api/auth/refresh`.

## Notes

UI primitives and pages are plain PascalCase functions (React-like); `createComponent` is optional. Plan itinerary uses HTML5 drag-and-drop. Explore city search debounces to `/api/cities/search` with local covered-city fallback.
