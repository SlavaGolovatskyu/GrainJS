# SSR (library)

Import from **`grainlet/ssr`** (not the main `grainlet` entry):

```js
import {
  renderToString,
  renderToStringAsync,
  wrapHtmlDocument,
  runWithSSR,
  isServer,
} from 'grainlet/ssr';
```

| Export | Role |
|--------|------|
| `renderToString(type, props?, { url? })` | Sync HTML string for a component tree |
| `renderToStringAsync(type, props?, { url?, maxPasses? })` | Await `lazy` / `createResource`, then HTML |
| `wrapHtmlDocument(body, options?)` | Full HTML document wrapper |
| `hydrate(type, container, props?)` | Attach to existing DOM |
| `runWithSSR(fn)` / `isServer()` | SSR mode flag (effects skipped; supports async `fn`) |

Client hydration in apps usually uses `hydrate` from `grainlet` (core). Prefer plain function components. Markup includes `data-component` / `data-fg="fragment"` hosts to match the client DOM layer.

Pass `{ url }` so routing location is seeded on the server.

Demo app (workspace): `npm run ssr:demo` → `apps/ssr-demo`.
