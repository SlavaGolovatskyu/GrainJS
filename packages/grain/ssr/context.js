import { setServerMode, isServer } from '../signals/env.js';

let ssrContext = null;

export function getSSRContext() {
  return ssrContext;
}

export { isServer };

/**
 * Run `fn` in SSR mode (effects skipped; memos sync-evaluated).
 * Optionally stash request URL / extras on the context.
 */
export function runWithSSR(fn, context = {}) {
  const previous = ssrContext;
  ssrContext = { ...context };
  setServerMode(true);
  try {
    return fn();
  } finally {
    setServerMode(false);
    ssrContext = previous;
  }
}
