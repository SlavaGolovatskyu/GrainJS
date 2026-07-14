import { pushEffect, popEffect } from '../reactive-context/reactive-context.js';

/** Run `fn` without tracking signal reads on the current effect. */
export function untrack(fn) {
  const previous = pushEffect(null);
  try {
    return fn();
  } finally {
    popEffect(previous);
  }
}
