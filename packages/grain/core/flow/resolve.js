import { Fragment } from '../jsx-compiler-new/jsx-runtime.js';

export function asArray(value) {
  if (value == null || value === false) return [];
  return Array.isArray(value) ? value.flat(Infinity) : [value];
}

/** Resolve `when` / `each` — Babel may wrap call expressions as accessors. */
export function readProp(value) {
  if (typeof value === 'function') {
    try {
      return value();
    } catch {
      return value;
    }
  }
  return value;
}

/**
 * Render Show/For/Match children. Function children are callbacks;
 * never return a bare function (DOM would treat it as a text accessor).
 */
export function renderChild(children, value, index) {
  if (typeof children === 'function') {
    return arguments.length > 2 ? children(value, index) : children(value);
  }
  return children;
}

export function flattenFlowChildren(children) {
  const out = [];
  for (const node of asArray(children)) {
    if (!node || typeof node !== 'object') continue;
    if (node.type === Fragment) {
      out.push(...flattenFlowChildren(node.props?.children ?? node.children));
      continue;
    }
    out.push(node);
  }
  return out;
}

export function vnodeKey(vdom) {
  if (vdom == null || typeof vdom !== 'object') return undefined;
  if (vdom.key != null) return vdom.key;
  return vdom.props?.key;
}

export function withKey(vdom, key) {
  if (vdom == null || typeof vdom !== 'object' || Array.isArray(vdom)) {
    return vdom;
  }
  return {
    ...vdom,
    key,
    props: { ...(vdom.props || {}), key },
  };
}
