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
import {
  Show,
  For,
  Switch,
  Match,
  Suspense,
  ErrorBoundary,
  Portal,
  createContext,
  useContext,
  createResource,
} from 'grainlet';
```

| Component | Role |
|-----------|------|
| `Show` | Render children when `when` is truthy (else `fallback`) |
| `For` | Map `each` list to children; prefers `item.id` keys |
| `Switch` / `Match` | First matching `when` branch |
| `Suspense` | `fallback` while nested `createResource` is pending |
| `ErrorBoundary` | Catch render/update errors; `fallback` or `(error, reset) => …` |
| `Portal` | Render children into `document.body` (or `mount`) |
| `createContext` / `useContext` | Share data without prop drilling (`Provider` + consume) |
| `createResource` | Async data `[resource]` — `resource()` reads value |

Prefer these over `{cond() && <X/>}` so conditionals update without re-running the parent.

```js
<ErrorBoundary
  fallback={(error, reset) => (
    <div>
      <p>Something went wrong: {error.message}</p>
      <button type="button" onClick={reset}>Try Again</button>
    </div>
  )}
>
  <ErrorProne />
</ErrorBoundary>
```

Event handlers and `setTimeout` callbacks are not caught (same as Solid).

```js
<div style={{ overflow: 'hidden' }}>
  <Portal>
    <div class="popup">Escapes overflow clipping</div>
  </Portal>
</div>

<Portal mount={document.querySelector('#portal-root')}>
  <p>Custom mount node</p>
</Portal>

{/* SVG: wrap in <g>; head: no wrapper */}
<Portal mount={svgEl} isSVG>
  <circle r="4" />
</Portal>
```

```js
const CounterContext = createContext();

function CounterProvider(props) {
  const [count, setCount] = createSignal(props.count ?? 0);
  return (
    <CounterContext.Provider value={[count, setCount]}>
      {props.children}
    </CounterContext.Provider>
  );
}

function useCounter() {
  const value = useContext(CounterContext);
  if (!value) throw new Error('Missing CounterProvider');
  return value;
}

function Child() {
  const [count, setCount] = useCounter();
  return (
    <button type="button" onClick={() => setCount((n) => n + 1)}>
      {count()}
    </button>
  );
}
```

Pass a signal (or store) as `value` so consumers stay reactive without remounting the Provider.

## Refs

Attach `ref` to any host element to get the DOM node (Solid-compatible):

```js
// Callback
<input ref={(el) => { inputEl = el; }} />

// Signal setter (stable function identity)
const [el, setEl] = createSignal(null);
<div ref={setEl} />

// Variable form — requires grainJsx() (rewrites to an assignment callback)
let box;
<div ref={box} />

// Forwarding
function Field(props) {
  return <input ref={props.ref} />;
}
<Field ref={setEl} />
```

Refs are set when the node is created and cleared with `null` when it is removed (e.g. inside `Show`).

## TypeScript

Types ship with the package (no extra install). Use the same Vite config with `jsxImportSource: 'grainlet'`:

```ts
import { createSignal, render, type Accessor } from 'grainlet';

function App() {
  const [count, setCount] = createSignal(0);
  return (
    <button type="button" onClick={() => setCount((c) => c + 1)}>
      {count()}
    </button>
  );
}

render(App, document.getElementById('app')!);
```

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "grainlet"
  }
}
```

`grainlet-vite` includes typings for `grainJsx()`.

## Routing

History API router — no hash required:

```js
import {
  Router,
  Route,
  Link,
  navigate,
  useParams,
  useLocation,
} from 'grainlet';

function User() {
  const params = useParams();
  const location = useLocation();
  return (
    <section>
      <h2>User {params().id}</h2>
      <p>{location().pathname}</p>
    </section>
  );
}

function App() {
  return (
    <>
      <nav>
        <Link href="/" activeClass="active">Home</Link>
        <Link href="/users/1" activeClass="active">User 1</Link>
      </nav>
      <Router basename="/app">
        <Route path="/" component={Home} />
        <Route path="/users/:id" component={User} />
        <Route path="*" component={NotFound} />
      </Router>
    </>
  );
}

// Imperative navigation (respects Router basename)
navigate('/users/3');
```

| API | Role |
|-----|------|
| `Router` | Match location to `Route` children (optional `basename`) |
| `Route` | `path` + `component` (`:param`, `*` catch-all) |
| `Link` | Client-side `<a>`; `activeClass` when the path matches |
| `navigate(to)` | Push/replace history |
| `useParams()` | Signal of route params (`params().id`) |
| `useLocation()` | Signal of `{ pathname, search, hash, state }` |

## SSR

```js
import { renderToString, wrapHtmlDocument, hydrate } from 'grainlet';

const body = renderToString(App, {}, { url: 'http://localhost/' });
```

On the server, `createEffect` is a no-op; `createMemo` evaluates once for the HTML snapshot.
