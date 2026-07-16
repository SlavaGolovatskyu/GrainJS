import { createSignal, createEffect, onCleanup } from '../../signals/index.js';
import { jsx, Fragment } from '../jsx-compiler-new/jsx-runtime.js';
import {
  pushSuspenseContext,
  popSuspenseContext,
} from './context.js';

/**
 * Show fallback while any createResource under children is pending.
 * Children stay mounted (hidden) so in-flight resources keep running.
 *
 *   <Suspense fallback={<div class="loader">Loading...</div>}>
 *     <Child />
 *   </Suspense>
 */
export function Suspense(props) {
  const [showFallback, setShowFallback] = createSignal(false);
  const pending = new Set();

  const ctx = {
    track(resource) {
      pending.add(resource);
      setShowFallback(true);
    },
  };

  createEffect(() => {
    if (!showFallback()) return;
    let busy = false;
    for (const res of pending) {
      if (typeof res.loading === 'function' && res.loading()) {
        busy = true;
      }
    }
    if (!busy) {
      pending.clear();
      setShowFallback(false);
    }
  });

  return jsx(SuspenseBoundary, {
    ctx,
    showFallback,
    fallback: props.fallback,
    children: props.children,
  });
}

function SuspenseBoundary(props) {
  pushSuspenseContext(props.ctx);
  onCleanup(() => popSuspenseContext());

  const suspended = props.showFallback();

  // Keep children mounted while showing fallback so resources are not remounted.
  if (suspended) {
    return jsx(
      Fragment,
      null,
      props.fallback ?? null,
      jsx(
        'span',
        {
          style: 'display:none',
          'aria-hidden': 'true',
          'data-suspense-pending': '',
        },
        props.children
      )
    );
  }

  return props.children;
}
