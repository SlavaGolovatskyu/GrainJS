import { createSignal } from '../createSignal/createSignal.js';
import { createEffect } from '../createEffect/createEffect.js';

export function createMemo(fn) {
  const [get, set] = createSignal();

  createEffect(() => {
    set(fn());
  });

  return get;
}
