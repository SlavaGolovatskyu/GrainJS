import assert from 'node:assert/strict';
import { createSignal } from '../signals/index.js';
import { jsx } from '../core/jsx-compiler-new/jsx-runtime.js';
import { Suspense } from '../core/flow/Suspense.js';
import { createResource } from '../core/flow/createResource.js';
import { lazy } from '../core/flow/lazy.js';
import { renderToString, renderToStringAsync } from '../ssr/render-to-string.js';

function delay(ms, value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function testResourceAsync() {
  function App() {
    const [data] = createResource(() => delay(20, { title: 'hello-resource' }));
    const value = data();
    return jsx('div', { class: 'res' }, value ? value.title : 'pending');
  }

  function Root() {
    return jsx(Suspense, {
      fallback: jsx('p', null, 'Loading'),
      children: jsx(App, null),
    });
  }

  const html = await renderToStringAsync(Root);
  assert.match(html, /hello-resource/);
  assert.doesNotMatch(html, />Loading</);
  console.log('ok: renderToStringAsync + createResource');
}

async function testLazyAsync() {
  const LazyPage = lazy(() =>
    delay(15, {
      default: function Page() {
        return jsx('h1', null, 'lazy-ready');
      },
    })
  );

  function Root() {
    return jsx(Suspense, {
      fallback: jsx('p', null, 'Loading lazy'),
      children: jsx(LazyPage, null),
    });
  }

  const html = await renderToStringAsync(Root);
  assert.match(html, /lazy-ready/);
  assert.doesNotMatch(html, /Loading lazy/);
  console.log('ok: renderToStringAsync + lazy');
}

async function testSyncUnchanged() {
  function App() {
    const [n] = createSignal(3);
    return jsx('span', { class: 'n' }, String(n()));
  }
  const html = renderToString(App);
  assert.match(html, />3</);
  console.log('ok: renderToString sync unchanged');
}

await testSyncUnchanged();
await testResourceAsync();
await testLazyAsync();
console.log('all render-async tests passed');
