# grainlet

Fine-grained reactive UI: **signals**, **JSX**, **History API routing**, and **SSR / hydrate**.

## Install

```bash
npm install grainlet
```

For Vite JSX (dev only — install as `devDependencies`):

```bash
npm install -D grainlet-vite vite @babel/core @babel/plugin-syntax-jsx
```

Or scaffold a project:

```bash
npx create-grainlet my-app
```

## Usage

```js
import { createSignal, render } from 'grainlet';

function App() {
  const [count, setCount] = createSignal(0);
  return (
    <button type="button" onClick={() => setCount((c) => c + 1)}>
      {count()}
    </button>
  );
}

render(App, document.getElementById('app'));
```

## Vite

```js
import { defineConfig } from 'vite';
import { grainJsx } from 'grainlet-vite';

export default defineConfig({
  plugins: [grainJsx()],
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'grainlet',
  },
});
```

## Entry points

| Import | Purpose |
|--------|---------|
| `grainlet` | Public API (signals, render, hydrate, router, SSR) |
| `grainlet/jsx-runtime` | Automatic JSX runtime |
| `grainlet-vite` | `grainJsx()` Vite plugin (separate package, `devDependency`) |

## Control flow

```js
import { Show, For, Switch, Match, Suspense, createResource } from 'grainlet';
```

| Component | Role |
|-----------|------|
| `Show` | Render children when `when` is truthy (else `fallback`) |
| `For` | Map `each` list to children; prefers `item.id` keys |
| `Switch` / `Match` | First matching `when` branch |
| `Suspense` | `fallback` while nested `createResource` is pending |
| `createResource` | Async data `[resource]` — `resource()` reads value |

Prefer these over `{cond() && <X/>}` so conditionals update without re-running the parent.

## SSR

```js
import { renderToString, wrapHtmlDocument, hydrate } from 'grainlet';

const body = renderToString(App, {}, { url: 'http://localhost/' });
```

On the server, `createEffect` is a no-op; `createMemo` evaluates once for the HTML snapshot.
