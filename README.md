# frontend-core

A small Solid-style reactive UI stack: **signals**, **components** (fine-grained JSX), and **History API routing**.

Packages live next to each other and are re-exported from root [`index.js`](index.js):

| Package | Role |
|---------|------|
| [`signals/`](signals/) | `createSignal`, `createEffect`, `createMemo`, `onCleanup` |
| [`core/`](core/) | `createComponent`, `render`, JSX runtime, DOM patching |
| [`route/`](route/) | `Router`, `Route`, `A`, `navigate`, `useParams`, `useLocation` |

Public API names follow Solid; effect nesting and cleanup behave closer to Preact-style ownership (parent render effects are not wiped by nested effects).

## Features

- Reactive signals with automatic dependency tracking
- Fine-grained DOM updates (text/prop bindings) via accessors
- Nestable `createEffect` / `onCleanup` with correct dispose
- Stable component instances (in-place prop updates, no full remount by default)
- JSX with Vite + automatic runtime under `core/jsx-compiler-new`
- Client-side History API routing (`basename` supported)

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the examples index.

SPA demos that need History API under a path prefix:

- Routing demo: [/routing](http://localhost:3000/routing)
- Zenwayro app: [/zenwayro](http://localhost:3000/zenwayro)

## Quick start

```javascript
import {
  createSignal,
  createComponent,
  render,
  Router,
  Route,
  A,
} from './index.js';

const Counter = createComponent(() => {
  const [count, setCount] = createSignal(0);

  return (
    <div>
      <p>{count()}</p>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Increment
      </button>
    </div>
  );
});

const App = createComponent(() => (
  <Router basename="/app">
    <nav>
      <A href="/" activeClass="active">
        Home
      </A>
    </nav>
    <Route path="/" component={Counter} />
  </Router>
));

render(App, document.getElementById('app'));
```

Pass the **component factory** to `render` (not a JSX element factory wrapping it), matching the examples.

## Core API

### `createSignal(initialValue)`

```javascript
const [count, setCount] = createSignal(0);
count(); // read
setCount(1); // write (skipped if Object.is-equal)
setCount((c) => c + 1);
```

### `createEffect(fn)`

Tracks signal reads and re-runs when they change. Returned cleanup runs before the next run and on dispose.

```javascript
createEffect(() => {
  console.log(count());
  return () => {
    /* cleanup */
  };
});
```

### `createMemo(fn)` / `onCleanup(fn)`

Memoized derived values; `onCleanup` registers dispose work for the current effect or component.

### `createComponent(fn)` / `render(Component, container, props?)`

Components return JSX (or HTML template results). Effects registered during render belong to the instance and dispose on unmount.

### Routing

```javascript
import { Router, Route, A, navigate, useParams, useLocation } from './index.js';

<Router basename="/routing">
  <Route path="/" component={Home} />
  <Route path="/users/:id" component={User} />
  <Route path="*" component={NotFound} />
</Router>;
```

- `A` — same-origin link with `preventDefault` + `navigate`
- `navigate(path, { replace?, state? })` — basename applied automatically
- `useParams()` / `useLocation()` — reactive getters for the active match / location

## JSX notes

- Prefer reading signals in JSX as `{count()}`; the Vite plugin wraps call expressions into fine-grained text bindings when safe.
- Control flow that returns elements should stay eager (`{show() && <X />}`), not `{() => <X />}`.
- For component props like `title` / `disabled`, read into locals in the component body (`const title = props.title`) so MemberExpressions are not stringified as accessors.
- Optional chaining matters when a signal can be `null` before conditional unmount: `{profile()?.name}`.

See also [`core/jsx-compiler-new/README.md`](core/jsx-compiler-new/README.md).

## Repository layout

```
signals/           reactive primitives
core/              components, DOM, JSX
route/             History API router
signals-example/   demos 01–12
apps/zenwayro/     product app on this stack
index.js           public barrel exports
vite.config.js     fine-grained JSX + SPA rewrites (/routing, /zenwayro)
```

## Examples

Under [`signals-example/`](signals-example/) (linked from root `index.html`):

| Example | Topic |
|---------|--------|
| 01–07 | Counter, todos, timer, memo, forms, composition, effects |
| 10 | Nested render isolation |
| 11 | Async fetch / AbortController |
| 12 | Routing at `/routing` |

App: [`apps/zenwayro/README.md`](apps/zenwayro/README.md).

## License

MIT
