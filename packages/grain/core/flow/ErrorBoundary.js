import { createSignal, onCleanup } from '../../signals/index.js';
import { jsx } from '../jsx-compiler-new/jsx-runtime.js';
import {
  pushErrorBoundary,
  popErrorBoundary,
} from './context.js';

/**
 * Catch render/update errors in descendants. Event handlers and timers are not caught.
 *
 *   <ErrorBoundary
 *     fallback={(error, reset) => (
 *       <div>
 *         <p>{error.message}</p>
 *         <button type="button" onClick={reset}>Try Again</button>
 *       </div>
 *     )}
 *   >
 *     <ErrorProne />
 *   </ErrorBoundary>
 */
export function ErrorBoundary(props) {
  const [error, setError] = createSignal(null);
  const reset = () => setError(null);
  const api = {
    catch(err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    },
  };

  return jsx(ErrorBoundaryView, {
    api,
    error,
    reset,
    fallback: props.fallback,
    children: props.children,
  });
}

function ErrorBoundaryView(props) {
  const err = props.error();
  if (err) {
    const fb = props.fallback;
    if (typeof fb === 'function') {
      return fb(err, props.reset);
    }
    return fb ?? null;
  }

  return jsx(ErrorBoundaryProvider, {
    api: props.api,
    children: props.children,
  });
}

function ErrorBoundaryProvider(props) {
  pushErrorBoundary(props.api);
  onCleanup(popErrorBoundary);
  return props.children;
}
