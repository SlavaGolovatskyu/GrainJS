import { Fragment } from '../core/jsx-compiler-new/jsx-runtime.js';

const BOOLEAN_ATTRS = new Set([
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

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isFragmentType(type) {
  return type === Fragment;
}

function isComponentType(type) {
  return typeof type === 'function' && !isFragmentType(type);
}

function isAccessor(value) {
  return typeof value === 'function';
}

function resolvePropValue(value) {
  if (isAccessor(value)) {
    try {
      return value();
    } catch {
      return '';
    }
  }
  return value;
}

function toText(value) {
  if (value == null || value === false || value === true) return '';
  return String(value);
}

function isEventProp(key) {
  return key === 'onClick' || key === 'onclick' || /^on[A-Z]/.test(key);
}

function serializeAttrs(props) {
  if (!props) return '';
  const parts = [];

  for (const key of Object.keys(props)) {
    if (key === 'children' || key === 'key' || key === 'ref') continue;
    if (isEventProp(key)) continue;

    let attrName = key;
    if (key === 'className') attrName = 'class';

    const raw = resolvePropValue(props[key]);

    if (BOOLEAN_ATTRS.has(key) || BOOLEAN_ATTRS.has(attrName)) {
      if (raw) parts.push(attrName);
      continue;
    }

    if (raw == null || raw === false) continue;

    if (key === 'style' || attrName === 'style') {
      const css =
        typeof raw === 'string'
          ? raw
          : raw && typeof raw === 'object'
            ? Object.entries(raw)
                .map(([k, v]) => `${k}:${v}`)
                .join(';')
            : '';
      if (css) parts.push(`style="${escapeHtml(css)}"`);
      continue;
    }

    parts.push(`${attrName}="${escapeHtml(raw === true ? '' : raw)}"`);
  }

  return parts.length ? ` ${parts.join(' ')}` : '';
}

const VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
]);

function normalizeChildren(children) {
  if (children == null || children === false) return [];
  const list = Array.isArray(children) ? children.flat(Infinity) : [children];
  return list.filter((child) => child !== null && child !== undefined && child !== false);
}

function wrapContents(inner, marker) {
  return `<span ${marker} style="display:contents">${inner}</span>`;
}

/**
 * Serialize a vnode (or text/accessor) to an HTML string.
 * `renderComponent` resolves function components → vnode.
 */
export function serializeVnode(vdom, renderComponent) {
  if (vdom == null || vdom === false || vdom === true) {
    return '';
  }

  if (typeof vdom === 'string' || typeof vdom === 'number') {
    return escapeHtml(vdom);
  }

  if (isAccessor(vdom)) {
    const resolved = resolvePropValue(vdom);
    if (Array.isArray(resolved)) {
      return normalizeChildren(resolved)
        .map((child) => serializeVnode(child, renderComponent))
        .join('');
    }
    if (resolved != null && typeof resolved === 'object' && 'type' in resolved) {
      return serializeVnode(resolved, renderComponent);
    }
    return escapeHtml(toText(resolved));
  }

  if (Array.isArray(vdom)) {
    const inner = normalizeChildren(vdom)
      .map((child) => serializeVnode(child, renderComponent))
      .join('');
    return wrapContents(inner, 'data-fg="fragment"');
  }

  if (typeof vdom !== 'object') {
    return escapeHtml(String(vdom));
  }

  const { type, props, children } = vdom;

  if (isFragmentType(type)) {
    const inner = normalizeChildren(children)
      .map((child) => serializeVnode(child, renderComponent))
      .join('');
    return wrapContents(inner, 'data-fg="fragment"');
  }

  if (isComponentType(type)) {
    const childProps = { ...(props || {}) };
    const kids = normalizeChildren(children);
    if (kids.length > 0 && childProps.children === undefined) {
      childProps.children = kids.length === 1 ? kids[0] : kids;
    }
    const result = renderComponent(type, childProps);
    const inner = serializeVnode(result, renderComponent);
    return wrapContents(inner, 'data-component=""');
  }

  const tag = String(type);
  const key = vdom.key ?? props?.key;
  const keyAttr = key != null ? ` data-key="${escapeHtml(key)}"` : '';
  const attrs = serializeAttrs(props);
  if (VOID_TAGS.has(tag)) {
    return `<${tag}${attrs}${keyAttr} />`;
  }

  const inner = normalizeChildren(children)
    .map((child) => serializeVnode(child, renderComponent))
    .join('');

  return `<${tag}${attrs}${keyAttr}>${inner}</${tag}>`;
}
