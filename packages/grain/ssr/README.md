# SSR (library)

Server-side rendering helpers shipped with `grain`.

| Export | Role |
|--------|------|
| `renderToString(type, props?, { url? })` | HTML string for a component tree |
| `wrapHtmlDocument(body, options?)` | Full HTML document wrapper |
| `hydrate(type, container, props?)` | Attach to existing DOM |
| `runWithSSR(fn)` / `isServer()` | SSR mode flag (effects skipped) |

Prefer plain function components. Markup includes `data-component` / `data-fg="fragment"` hosts to match the client DOM layer.

Pass `{ url }` so routing location is seeded on the server.

Demo app (workspace): `npm run ssr:demo` → `apps/ssr-demo`.
