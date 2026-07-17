import { Suspense, lazy, createResource } from 'grainlet';

function delay(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function AsyncGreeting() {
  const [data] = createResource(() =>
    delay(30, { message: 'Hello from createResource' })
  );
  const value = data();
  return <p class="async-greeting">{value?.message ?? '…'}</p>;
}

const LazyPanel = lazy(() =>
  delay(20, {
    default: function Panel() {
      return <p class="lazy-panel">Hello from lazy()</p>;
    },
  })
);

export function AsyncApp() {
  return (
    <div class="ssr-async-demo">
      <h1>SSR async</h1>
      <Suspense fallback={<p class="fallback">Loading resource…</p>}>
        <AsyncGreeting />
      </Suspense>
      <Suspense fallback={<p class="fallback">Loading lazy…</p>}>
        <LazyPanel />
      </Suspense>
      <p class="hint">
        View source: resolved copy should appear without the fallbacks.
      </p>
    </div>
  );
}
