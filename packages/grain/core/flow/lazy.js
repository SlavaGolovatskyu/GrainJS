import { jsx } from '../jsx-compiler-new/jsx-runtime.js';
import { getSuspenseContext } from './context.js';
import { trackSSRThenables } from '../../ssr/context.js';

/**
 * Lazy-load a component (Preact/React-style).
 *
 *   const Home = lazy(() => import('./pages/home.js'));
 *
 * Wrap in `<Suspense fallback={...}>`. Works with `renderToStringAsync`.
 *
 * @param {() => Promise<{ default: Function } | Function>} loader
 * @returns {Function} component
 */
export function lazy(loader) {
  if (typeof loader !== 'function') {
    throw new TypeError('lazy() expects a function that returns a Promise');
  }

  let Comp = null;
  let error = null;
  let promise = null;

  function ensureLoad() {
    if (Comp || error) return promise;
    if (!promise) {
      promise = Promise.resolve()
        .then(() => loader())
        .then((mod) => {
          const resolved = mod?.default ?? mod;
          if (typeof resolved !== 'function') {
            throw new TypeError(
              'lazy() module must export a component (default or the module itself)'
            );
          }
          Comp = resolved;
          return Comp;
        })
        .catch((err) => {
          error = err instanceof Error ? err : new Error(String(err));
          throw error;
        });
    }
    return promise;
  }

  function LazyComponent(props) {
    if (error) throw error;
    if (Comp) {
      return jsx(Comp, props);
    }

    const p = ensureLoad();
    const suspense = getSuspenseContext();
    if (suspense) {
      suspense.track(p);
    } else {
      trackSSRThenables(p);
    }

    return null;
  }

  LazyComponent.displayName = 'Lazy';
  LazyComponent.$$lazy = true;
  return LazyComponent;
}
