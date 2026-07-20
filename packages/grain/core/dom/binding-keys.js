/** Shared per-node binding slots so template + vnode paths dispose the same way. */
export const TEXT_DISPOSE = Symbol('textDispose');
export const PROP_DISPOSES = Symbol('propDisposes');
export const LISTENERS = Symbol('listeners');
export const PREV_PROPS = Symbol('prevProps');
export const NODE_KEY = Symbol('nodeKey');
export const REF_KEY = Symbol('ref');
