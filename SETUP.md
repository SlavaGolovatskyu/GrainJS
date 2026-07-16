# Setup

## Monorepo

```bash
npm install
npm run dev
```

Publishable packages:

| Package | Path |
|---------|------|
| `grainlet` | `packages/grain` |
| `grainlet-vite` | `packages/vite` |
| `create-grainlet` | `packages/create-grainlet` |

## New app (scaffold)

```bash
npx create-grainlet my-app
```

## JSX without Vite

```js
import { jsx } from 'grainlet/jsx-runtime';
```

See `apps/examples/08-jsx-counter.html`.

## Full JSX with Vite

Already configured at the workspace root (`jsxImportSource: 'grainlet'`). For a standalone app:

```js
import { grainJsx } from 'grainlet-vite';

export default {
  plugins: [grainJsx()],
  esbuild: { jsx: 'automatic', jsxImportSource: 'grainlet' },
};
```

Install tooling as **devDependencies**:

```bash
npm install grainlet
npm install -D grainlet-vite vite @babel/core @babel/plugin-syntax-jsx
```
