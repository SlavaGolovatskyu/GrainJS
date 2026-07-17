import { createSignal, createEffect } from '../../signals/index.js';
import { isServer } from '../../signals/env.js';
import { getSuspenseContext } from './context.js';
import {
  trackSSRThenables,
  getSSRResourceCache,
} from '../../ssr/context.js';

function stableInputKey(input) {
  if (input === true) return 'true';
  if (input == null) return String(input);
  if (typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
    return String(input);
  }
  try {
    return JSON.stringify(input);
  } catch {
    return String(input);
  }
}

function resourceCacheKey(fetchFn, input) {
  return `${stableInputKey(input)}::${fetchFn.length}:${fetchFn.name || 'fn'}:${String(fetchFn).slice(0, 120)}`;
}

/**
 * Async data as a reactive resource (Solid-like).
 *
 *   const [data] = createResource(id, (id) => fetch(`/api/${id}`).then(r => r.json()));
 *   // or no source: createResource(() => fetch(...))
 *
 * Reading `data()` while pending registers with the nearest Suspense.
 * On SSR, in-flight promises are tracked for `renderToStringAsync`.
 */
export function createResource(source, fetcher) {
  let sourceFn;
  let fetchFn;

  if (typeof fetcher === 'function') {
    sourceFn = typeof source === 'function' ? source : () => source;
    fetchFn = fetcher;
  } else {
    sourceFn = () => true;
    fetchFn = source;
  }

  if (typeof fetchFn !== 'function') {
    throw new TypeError('createResource requires a fetcher function');
  }

  const [data, setData] = createSignal(undefined);
  const [error, setError] = createSignal(undefined);
  const [state, setState] = createSignal('pending');
  // pending | ready | refreshing | errored

  let version = 0;
  let hasLoaded = false;
  let currentPromise = null;

  const load = (input, refreshing) => {
    const v = ++version;
    setState(refreshing ? 'refreshing' : 'pending');
    setError(undefined);

    const cache = isServer() ? getSSRResourceCache() : null;
    const key = cache ? resourceCacheKey(fetchFn, input) : null;

    currentPromise = Promise.resolve()
      .then(() => fetchFn(input, { value: data(), refetching: refreshing }))
      .then((result) => {
        if (v !== version) return;
        if (cache && key) {
          cache.set(key, { status: 'ready', value: result });
        }
        setData(() => result);
        setState('ready');
      })
      .catch((err) => {
        if (v !== version) return;
        if (cache && key) {
          cache.set(key, { status: 'errored', error: err });
        }
        setError(() => err);
        setState('errored');
      });

    if (isServer()) {
      trackSSRThenables(currentPromise);
    }

    return currentPromise;
  };

  if (!isServer()) {
    createEffect(() => {
      const input = sourceFn();
      if (input === false || input === null || input === undefined) {
        setState('ready');
        setData(undefined);
        return;
      }
      const refreshing = hasLoaded;
      hasLoaded = true;
      load(input, refreshing);
    });
  } else {
    // SSR: use cache from prior async pass when available; else kick off once.
    try {
      const input = sourceFn();
      if (input === false || input === null || input === undefined) {
        setState('ready');
      } else {
        const cache = getSSRResourceCache();
        const key = resourceCacheKey(fetchFn, input);
        const hit = cache?.get(key);
        if (hit?.status === 'ready') {
          setData(() => hit.value);
          setState('ready');
          hasLoaded = true;
        } else if (hit?.status === 'errored') {
          setError(() => hit.error);
          setState('errored');
        } else {
          load(input, false);
        }
      }
    } catch (err) {
      setError(() => err);
      setState('errored');
    }
  }

  const resource = () => {
    const s = state();
    const suspense = getSuspenseContext();
    if (suspense && (s === 'pending' || s === 'refreshing')) {
      suspense.track(resource);
      if (currentPromise) {
        trackSSRThenables(currentPromise);
      }
    }
    if (s === 'errored') {
      const err = error();
      if (err) throw err;
    }
    return data();
  };

  resource.state = state;
  resource.error = error;
  resource.loading = () => {
    const s = state();
    return s === 'pending' || s === 'refreshing';
  };
  resource.latest = data;
  resource.promise = () => currentPromise;
  resource.refetch = () => {
    const input = sourceFn();
    if (input === false || input === null || input === undefined) return;
    load(input, true);
  };

  return [resource];
}
