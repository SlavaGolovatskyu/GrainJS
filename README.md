# grain monorepo

Workspace root for the **grain** library and local apps/examples.

| Path | Role |
|------|------|
| [`packages/grain`](packages/grain) | Publishable npm package (`signals`, `core`, `route`, `ssr`) |
| [`apps/examples`](apps/examples) | Framework demos (ex-signals-example) |
| [`apps/zenwayro`](apps/zenwayro) | Product app on the library |
| [`apps/ssr-demo`](apps/ssr-demo) | SSR + hydrate demo server |

## Install (this repo)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- Routing demo: [/routing](http://localhost:3000/routing)
- Zenwayro: [/zenwayro](http://localhost:3000/zenwayro)
- SSR demo: `npm run ssr:demo` → [http://localhost:3001/ssr](http://localhost:3001/ssr)

## Use the library in another project

```bash
npm install grain
npm install -D vite @babel/core @babel/plugin-syntax-jsx
```

```js
import { createSignal, render } from 'grain';
import { grainJsx } from 'grain/vite';
```

Vite:

```js
import { defineConfig } from 'vite';
import { grainJsx } from 'grain/vite';

export default defineConfig({
  plugins: [grainJsx()],
  esbuild: { jsx: 'automatic', jsxImportSource: 'grain' },
});
```

See [`packages/grain/README.md`](packages/grain/README.md) for the full public API.

## Publish the library

```bash
npm pack -w grain   # inspect tarball
npm publish -w grain
```

## Features

- Reactive signals with automatic dependency tracking
- Fine-grained DOM updates via JSX accessors
- Nestable `createEffect` / `onCleanup`
- History API routing (`Router`, `Route`, `Link`)
- SSR via `renderToString` + client `hydrate`

## License

MIT
