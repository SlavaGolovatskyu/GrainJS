import { Fragment } from '../jsx-compiler-new/jsx-runtime.js';

export const BOOLEAN_ATTRS = new Set([
  'disabled',
  'checked',
  'selected',
  'readonly',
  'required',
  'multiple',
  'hidden',
  'autofocus',
  'controls',
  'loop',
  'muted',
  'open',
]);

export function isFragmentType(type) {
  return type === Fragment;
}

export function isComponentType(type) {
  return typeof type === 'function' && !isFragmentType(type);
}

export function isAccessor(value) {
  return typeof value === 'function';
}

export function toText(value) {
  if (value == null || value === false || value === true) return '';
  return String(value);
}

export function normalizeChildren(children) {
  if (children == null || children === false) return [];
  const list = Array.isArray(children) ? children.flat(Infinity) : [children];
  return list.filter(
    (child) => child !== null && child !== undefined && child !== false
  );
}

export function vnodeKey(vdom) {
  if (vdom == null || typeof vdom !== 'object') return undefined;
  if (vdom.key != null) return vdom.key;
  return vdom.props?.key;
}
