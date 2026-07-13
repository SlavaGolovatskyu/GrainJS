import { pushEffect, popEffect, currentComponent } from '../reactive-context/reactive-context.js';

function clearDeps(effect) {
  if (effect._deps) {
    effect._deps.forEach((unsubscribe) => unsubscribe(effect));
    effect._deps.clear();
  }
}

function runCleanups(effect, cleanupFnRef) {
  if (cleanupFnRef.current) {
    try {
      cleanupFnRef.current();
    } catch (error) {
      console.error('Error in effect cleanup:', error);
    }
    cleanupFnRef.current = null;
  }

  if (effect._cleanups) {
    effect._cleanups.forEach((cleanup) => {
      try {
        cleanup();
      } catch (error) {
        console.error('Error in onCleanup callback:', error);
      }
    });
    effect._cleanups = [];
  }
}

export function createEffect(fn) {
  const cleanupFnRef = { current: null };

  const effect = () => {
    if (effect._disabled) {
      return;
    }

    // Drop stale subscriptions before re-tracking
    clearDeps(effect);
    runCleanups(effect, cleanupFnRef);

    if (!effect._deps) {
      effect._deps = new Set();
    }

    const previous = pushEffect(effect);
    let result;
    try {
      result = fn();
    } finally {
      popEffect(previous);
    }

    if (typeof result === 'function') {
      cleanupFnRef.current = result;
    }
  };

  effect._cleanups = [];
  effect._deps = new Set();
  effect._disabled = false;

  const dispose = () => {
    if (effect._disabled) {
      return;
    }
    clearDeps(effect);
    runCleanups(effect, cleanupFnRef);
    effect._disabled = true;
  };

  effect._dispose = dispose;

  // Only create effect on first render when inside a component
  if (currentComponent) {
    if (!currentComponent._effectsInitialized) {
      currentComponent._effects.push(effect);
      effect();
    } else {
      return () => {};
    }
  } else {
    effect();
  }

  return dispose;
}
