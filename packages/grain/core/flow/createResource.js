import { createSignal, createEffect } from '../../signals/index.js';
import { isServer } from '../../signals/env.js';
import { getSuspenseContext } from './context.js';

/**
 * Async data as a reactive resource (Solid-like).
 *
 *   const [data] = createResource(id, (id) => fetch(`/api/${id}`).then(r => r.json()));
 *   // or no source: createResource(() => fetch(...))
 *
 * Reading `data()` while pending registers with the nearest Suspense.
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

  const load = (input, refreshing) => {
    const v = ++version;
    setState(refreshing ? 'refreshing' : 'pending');
    setError(undefined);

    Promise.resolve()
      .then(() => fetchFn(input, { value: data(), refetching: refreshing }))
      .then((result) => {
        if (v !== version) return;
        setData(() => result);
        setState('ready');
      })
      .catch((err) => {
        if (v !== version) return;
        setError(() => err);
        setState('errored');
      });
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
    // SSR: kick off once; Suspense will see pending until settle (sync if cached)
    try {
      const input = sourceFn();
      if (input !== false && input !== null && input !== undefined) {
        load(input, false);
      } else {
        setState('ready');
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
  resource.refetch = () => {
    const input = sourceFn();
    if (input === false || input === null || input === undefined) return;
    load(input, true);
  };

  return [resource];
}
