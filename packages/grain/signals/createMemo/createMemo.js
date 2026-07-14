import { createSignal } from '../createSignal/createSignal.js';
import { createEffect } from '../createEffect/createEffect.js';
import { isServer } from '../env.js';

export function createMemo(fn) {
  // createEffect is a no-op on the server — evaluate once for SSR HTML.
  if (isServer()) {
    const [get] = createSignal(fn());
    return get;
  }

  const [get, set] = createSignal();

  createEffect(() => {
    set(fn());
  });

  return get;
}
