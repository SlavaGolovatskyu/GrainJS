# grain

Fine-grained reactive UI: **signals**, **JSX**, **History API routing**, and **SSR / hydrate**.

## Install

```bash
npm install grain
```

For the Vite JSX plugin (recommended):

```bash
npm install -D vite @babel/core @babel/plugin-syntax-jsx
```

## Usage

```js
import { createSignal, render } from 'grain';

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
import { grainJsx } from 'grain/vite';

export default defineConfig({
  plugins: [grainJsx()],
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'grain',
  },
});
```

## Entry points

| Import | Purpose |
|--------|---------|
| `grain` | Public API (signals, render, hydrate, router, SSR) |
| `grain/jsx-runtime` | Automatic JSX runtime |
| `grain/vite` | `grainJsx()` Vite plugin |

## Control flow

```js
import { Show, For, Switch, Match, Suspense, createResource } from 'grain';
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
import { renderToString, wrapHtmlDocument, hydrate } from 'grain';

const body = renderToString(App, {}, { url: 'http://localhost/' });
```

On the server, `createEffect` is a no-op; `createMemo` evaluates once for the HTML snapshot.
