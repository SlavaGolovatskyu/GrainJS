import { setServerMode, isServer } from '../signals/env.js';

let ssrContext = null;

export function getSSRContext() {
  return ssrContext;
}

export { isServer };

/**
 * Thenables registered during an SSR render pass (lazy / createResource).
 * Used by renderToStringAsync to await before the next pass.
 */
export function getSSRPending() {
  return ssrContext?.pending ?? null;
}

export function clearSSRPending() {
  if (ssrContext?.pending) {
    ssrContext.pending.clear();
  }
}

/** Register a thenable for renderToStringAsync. No-op off the server. */
export function trackSSRThenables(thenable) {
  if (!ssrContext || thenable == null) return;
  if (typeof thenable.then !== 'function') return;
  if (!ssrContext.pending) {
    ssrContext.pending = new Set();
  }
  ssrContext.pending.add(thenable);
}

/**
 * Per-request cache so createResource resolves sync on later async SSR passes.
 * @returns {Map<string, { status: string, value?: unknown, error?: unknown }> | null}
 */
export function getSSRResourceCache() {
  if (!ssrContext) return null;
  if (!ssrContext.resourceCache) {
    ssrContext.resourceCache = new Map();
  }
  return ssrContext.resourceCache;
}

/**
 * Run `fn` in SSR mode (effects skipped; memos sync-evaluated).
 * Supports async `fn` — keeps server mode on until the promise settles.
 */
export function runWithSSR(fn, context = {}) {
  const previous = ssrContext;
  ssrContext = {
    ...context,
    pending: new Set(),
    resourceCache:
      context.resourceCache instanceof Map
        ? context.resourceCache
        : new Map(),
  };
  setServerMode(true);

  const cleanup = () => {
    setServerMode(false);
    ssrContext = previous;
  };

  try {
    const result = fn();
    if (result != null && typeof result.then === 'function') {
      return Promise.resolve(result).finally(cleanup);
    }
    cleanup();
    return result;
  } catch (err) {
    cleanup();
    throw err;
  }
}
