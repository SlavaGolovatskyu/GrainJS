# grainlet monorepo

Workspace root for the **grainlet** library, Vite tooling, scaffolder, and local apps.

| Path | Role |
|------|------|
| [`packages/grain`](packages/grain) | Runtime npm package `grainlet` (signals, JSX runtime, route, SSR) |
| [`packages/vite`](packages/vite) | Dev package `grainlet-vite` (Vite JSX plugin) |
| [`packages/create-grainlet`](packages/create-grainlet) | `npx create-grainlet` project scaffolder |
| [`apps/examples`](apps/examples) | Framework demos |
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

**Scaffold (recommended):**

```bash
npx create-grainlet my-app
cd my-app
npm install
npm run dev
```

**Manual install:**

```bash
npm install grainlet
npm install -D grainlet-vite vite @babel/core @babel/plugin-syntax-jsx
```

```js
import { createSignal, render } from 'grainlet';
import { grainJsx } from 'grainlet-vite';
```

Vite:

```js
import { defineConfig } from 'vite';
import { grainJsx } from 'grainlet-vite';

export default defineConfig({
  plugins: [grainJsx()],
  esbuild: { jsx: 'automatic', jsxImportSource: 'grainlet' },
});
```

`grainlet` is a production dependency. `grainlet-vite` and Babel peers are **devDependencies** only.

See [`packages/grain/README.md`](packages/grain/README.md) for the full public API.

## Publish packages

Bump versions in the packages you changed, then:

```bash
npm run publish:libs
# with 2FA:  npm run publish:libs -- --otp=123456
# preview:   npm run publish:libs -- --dry-run
```

Only packages whose **local version is not yet on npm** are published (order: `grainlet-vite` → `create-grainlet` → `grainlet`).

Or pack individually:

```bash
npm run pack:lib      # grainlet
npm run pack:vite     # grainlet-vite
npm run pack:create   # create-grainlet
```

## Features

- Reactive signals with automatic dependency tracking
- Fine-grained DOM updates via JSX accessors
- Nestable `createEffect` / `onCleanup`
- History API routing (`Router`, `Route`, `Link`)
- SSR via `renderToString` + client `hydrate`

## License

MIT
