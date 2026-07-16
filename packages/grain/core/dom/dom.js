import { Fragment } from '../jsx-compiler-new/jsx-runtime.js';
import { createBindingEffect } from '../../signals/createEffect/createEffect.js';

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

const LISTENERS = Symbol('listeners');
const PREV_PROPS = Symbol('prevProps');
const TEXT_DISPOSE = Symbol('textDispose');
const PROP_DISPOSES = Symbol('propDisposes');
const NODE_KEY = Symbol('nodeKey');
const REF_KEY = Symbol('ref');

function invokeRef(ref, el) {
  if (typeof ref === 'function') ref(el);
}

function applyRef(el, nextRef, prevRef) {
  if (prevRef === nextRef) return;
  invokeRef(prevRef, null);
  invokeRef(nextRef, el);
  if (nextRef != null) {
    el[REF_KEY] = nextRef;
  } else {
    delete el[REF_KEY];
  }
}

function clearRefTree(node) {
  if (!node || node.nodeType !== Node.ELEMENT_NODE) return;
  const ref = node[REF_KEY];
  if (ref != null) {
    invokeRef(ref, null);
    delete node[REF_KEY];
  }
  const children = node.children;
  for (let i = 0; i < children.length; i++) {
    clearRefTree(children[i]);
  }
}

function eventName(key) {
  if (key === 'onClick' || key === 'onclick') return 'click';
  if (key.startsWith('on') && key.length > 2) {
    return key.slice(2).toLowerCase();
  }
  return null;
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

function toText(value) {
  if (value == null || value === false || value === true) return '';
  return String(value);
}

/** Accessor results that should render as DOM, not String(value). */
function isStructuredChild(value) {
  if (Array.isArray(value)) return true;
  return value != null && typeof value === 'object' && 'type' in value;
}

function disposeTextBinding(node) {
  if (node && node[TEXT_DISPOSE]) {
    node[TEXT_DISPOSE]();
    node[TEXT_DISPOSE] = null;
  }
}

function bindText(node, accessor) {
  disposeTextBinding(node);
  node[TEXT_DISPOSE] = createBindingEffect(() => {
    const next = toText(accessor());
    if (node.nodeValue !== next) {
      node.nodeValue = next;
    }
  });
  return node;
}

function createTextFromValue(value) {
  if (isAccessor(value)) {
    return bindText(document.createTextNode(''), value);
  }
  return document.createTextNode(toText(value));
}

/**
 * Babel wraps expressions like `{props.children}` as `() => props.children`.
 * Those accessors often return vnodes/arrays — render them as DOM, not text.
 * Nested wrappers (`() => () => value`) must be unwrapped before String().
 */
function unwrapAccessorValue(value) {
  let current = value;
  let depth = 0;
  while (typeof current === 'function' && depth < 8) {
    current = current();
    depth += 1;
  }
  return current;
}

function createDynamicChild(accessor, owner, path) {
  const host = document.createElement('span');
  host.style.display = 'contents';
  host.setAttribute('data-fg', 'dynamic');

  disposeTextBinding(host);
  host[TEXT_DISPOSE] = createBindingEffect(() => {
    const value = unwrapAccessorValue(accessor());
    if (isStructuredChild(value)) {
      const kids = Array.isArray(value) ? normalizeChildren(value) : [value];
      patchChildren(host, kids, owner, path);
      return;
    }
    clearChildRange(owner, path);
    const text = toText(value);
    if (
      host.childNodes.length === 1 &&
      host.firstChild.nodeType === Node.TEXT_NODE
    ) {
      disposeTextBinding(host.firstChild);
      if (host.firstChild.nodeValue !== text) {
        host.firstChild.nodeValue = text;
      }
      return;
    }
    while (host.firstChild) {
      removeNode(host, host.firstChild, owner, path);
    }
    host.appendChild(document.createTextNode(text));
  });

  return host;
}

function isDynamicHost(node) {
  return (
    node &&
    node.nodeType === Node.ELEMENT_NODE &&
    node.getAttribute?.('data-fg') === 'dynamic'
  );
}

function disposePropBinding(el, key) {
  const map = el[PROP_DISPOSES];
  if (map?.has(key)) {
    map.get(key)();
    map.delete(key);
  }
}

function setStaticProp(el, key, value) {
  if (key === 'className' || key === 'class') {
    el.className = value == null ? '' : String(value);
    return;
  }

  if (key === 'style') {
    if (typeof value === 'string') {
      el.style.cssText = value;
    } else if (value && typeof value === 'object') {
      el.style.cssText = '';
      Object.assign(el.style, value);
    } else {
      el.style.cssText = '';
    }
    return;
  }

  if (key === 'value' && 'value' in el) {
    if (el.value !== String(value ?? '')) {
      el.value = value == null ? '' : value;
    }
    return;
  }

  if (BOOLEAN_ATTRS.has(key)) {
    const on = Boolean(value);
    el[key] = on;
    if (on) el.setAttribute(key, '');
    else el.removeAttribute(key);
    return;
  }

  if (value == null || value === false) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, value === true ? '' : String(value));
  }
}

function bindProp(el, key, accessor) {
  disposePropBinding(el, key);
  if (!el[PROP_DISPOSES]) {
    el[PROP_DISPOSES] = new Map();
  }
  el[PROP_DISPOSES].set(
    key,
    createBindingEffect(() => {
      setStaticProp(el, key, accessor());
    })
  );
}

function normalizeChildren(children) {
  if (children == null || children === false) return [];
  const list = Array.isArray(children) ? children.flat(Infinity) : [children];
  return list.filter((child) => child !== null && child !== undefined && child !== false);
}

function componentProps(vdom) {
  const base = vdom.props || {};
  const kids = normalizeChildren(vdom.children);
  // Preserve props identity when children already live on props (e.g. For rows).
  if (kids.length === 0 || base.children !== undefined) {
    return base;
  }
  return {
    ...base,
    children: kids.length === 1 ? kids[0] : kids,
  };
}

export function applyProps(el, props, owner) {
  const next = props || {};
  const prev = el[PREV_PROPS] || {};
  const listeners = el[LISTENERS] || (el[LISTENERS] = new Map());

  for (const key of Object.keys(prev)) {
    if (key === 'children' || key === 'key' || key === 'ref') continue;
    if (!(key in next)) {
      const ev = eventName(key);
      if (ev && listeners.has(ev)) {
        el.removeEventListener(ev, listeners.get(ev));
        listeners.delete(ev);
      } else {
        disposePropBinding(el, key);
        if (key === 'className' || key === 'class') {
          el.className = '';
        } else if (BOOLEAN_ATTRS.has(key)) {
          el.removeAttribute(key);
          el[key] = false;
        } else if (key !== 'style') {
          el.removeAttribute(key);
        }
      }
    }
  }

  for (const key of Object.keys(next)) {
    if (key === 'children' || key === 'key' || key === 'ref') continue;

    let value = next[key];
    const ev = eventName(key);

    if (ev) {
      disposePropBinding(el, key);
      if (typeof value === 'function') {
        const prevFn = listeners.get(ev);
        if (prevFn) el.removeEventListener(ev, prevFn);
        el.addEventListener(ev, value);
        listeners.set(ev, value);
      }
      continue;
    }

    if (isAccessor(value)) {
      bindProp(el, key, value);
      continue;
    }

    disposePropBinding(el, key);
    setStaticProp(el, key, value);
  }

  applyRef(el, next.ref, prev.ref);
  el[PREV_PROPS] = next;
}

function clearChildRange(owner, pathPrefix) {
  if (!owner?._children) return;
  for (const key of [...owner._children.keys()]) {
    if (
      key === pathPrefix ||
      key.startsWith(pathPrefix + '.') ||
      key.startsWith(pathPrefix + ':')
    ) {
      const entry = owner._children.get(key);
      if (entry?.instance) {
        entry.instance.unmount();
      }
      owner._children.delete(key);
    }
  }
}

/** Prefer stable keyed owner paths so list reorder does not remount. */
function childOwnerPath(path, index, vdom) {
  const key = getVdomKey(vdom);
  return key != null ? `${path}:${key}` : `${path}.${index}`;
}

function removeNode(parentEl, node, owner, path) {
  clearChildRange(owner, path);
  disposeTextBinding(node);
  if (node?.[PROP_DISPOSES]) {
    for (const dispose of node[PROP_DISPOSES].values()) {
      dispose();
    }
    node[PROP_DISPOSES].clear();
  }
  clearRefTree(node);
  if (node && node.parentNode === parentEl) {
    parentEl.removeChild(node);
  }
}

function getVdomKey(vdom) {
  if (vdom == null || typeof vdom !== 'object') return undefined;
  if (vdom.key != null) return vdom.key;
  return vdom.props?.key;
}

function setNodeKey(node, key) {
  if (node && key != null) {
    node[NODE_KEY] = key;
    if (node.nodeType === Node.ELEMENT_NODE) {
      node.setAttribute('data-key', String(key));
    }
  }
}

function getNodeKey(node) {
  if (!node) return undefined;
  if (node[NODE_KEY] != null) return node[NODE_KEY];
  if (node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('data-key')) {
    return node.getAttribute('data-key');
  }
  return undefined;
}

export function createDom(vdom, owner, path = '0') {
  if (vdom == null || vdom === false || vdom === true) {
    return document.createTextNode('');
  }

  if (typeof vdom === 'string' || typeof vdom === 'number') {
    return document.createTextNode(String(vdom));
  }

  if (isAccessor(vdom)) {
    return createDynamicChild(vdom, owner, path);
  }

  if (Array.isArray(vdom)) {
    const host = document.createElement('span');
    host.style.display = 'contents';
    host.setAttribute('data-fg', 'fragment');
    normalizeChildren(vdom).forEach((child, i) => {
      const childNode = createDom(child, owner, childOwnerPath(path, i, child));
      setNodeKey(childNode, getVdomKey(child));
      host.appendChild(childNode);
    });
    return host;
  }

  if (typeof vdom !== 'object') {
    return document.createTextNode(String(vdom));
  }

  const { type } = vdom;

  if (isFragmentType(type)) {
    const host = document.createElement('span');
    host.style.display = 'contents';
    host.setAttribute('data-fg', 'fragment');
    setNodeKey(host, getVdomKey(vdom));
    normalizeChildren(vdom.children).forEach((child, i) => {
      const childNode = createDom(child, owner, childOwnerPath(path, i, child));
      setNodeKey(childNode, getVdomKey(child));
      host.appendChild(childNode);
    });
    return host;
  }

  if (isComponentType(type)) {
    const host = owner._mountChild(path, type, componentProps(vdom));
    setNodeKey(host, getVdomKey(vdom));
    return host;
  }

  const el = document.createElement(type);
  applyProps(el, vdom.props, owner);
  setNodeKey(el, getVdomKey(vdom));
  normalizeChildren(vdom.children).forEach((child, i) => {
    const childNode = createDom(child, owner, childOwnerPath(path, i, child));
    setNodeKey(childNode, getVdomKey(child));
    el.appendChild(childNode);
  });
  return el;
}

function replaceNode(parent, oldDom, newDom) {
  if (oldDom === newDom) return newDom;
  if (oldDom) {
    disposeTextBinding(oldDom);
    if (oldDom[PROP_DISPOSES]) {
      for (const dispose of oldDom[PROP_DISPOSES].values()) {
        dispose();
      }
      oldDom[PROP_DISPOSES].clear();
    }
    clearRefTree(oldDom);
  }
  if (oldDom && oldDom.parentNode === parent) {
    parent.replaceChild(newDom, oldDom);
  } else if (parent) {
    parent.appendChild(newDom);
  }
  return newDom;
}

function sameHostType(oldDom, vdom) {
  if (isAccessor(vdom) || typeof vdom === 'string' || typeof vdom === 'number') {
    return oldDom.nodeType === Node.TEXT_NODE;
  }
  if (vdom == null || typeof vdom !== 'object' || Array.isArray(vdom)) {
    return false;
  }
  if (isFragmentType(vdom.type) || Array.isArray(vdom)) {
    return (
      oldDom.nodeType === Node.ELEMENT_NODE &&
      oldDom.style?.display === 'contents' &&
      !oldDom.hasAttribute('data-component')
    );
  }
  if (isComponentType(vdom.type)) {
    return oldDom.nodeType === Node.ELEMENT_NODE && oldDom.hasAttribute('data-component');
  }
  return (
    oldDom.nodeType === Node.ELEMENT_NODE &&
    oldDom.tagName === String(vdom.type).toUpperCase() &&
    !oldDom.hasAttribute('data-component')
  );
}

export function patchDom(parent, oldDom, newVdom, owner, path = '0') {
  if (newVdom == null || newVdom === false || newVdom === true) {
    clearChildRange(owner, path);
    disposeTextBinding(oldDom);
    const empty = document.createTextNode('');
    return replaceNode(parent, oldDom, empty);
  }

  if (isAccessor(newVdom)) {
    if (isDynamicHost(oldDom)) {
      disposeTextBinding(oldDom);
      // Re-bind on the same host so structured/text updates share one node.
      return replaceNode(parent, oldDom, createDynamicChild(newVdom, owner, path));
    }
    clearChildRange(owner, path);
    return replaceNode(parent, oldDom, createDynamicChild(newVdom, owner, path));
  }

  if (typeof newVdom === 'string' || typeof newVdom === 'number') {
    clearChildRange(owner, path);
    const text = String(newVdom);
    if (oldDom && oldDom.nodeType === Node.TEXT_NODE) {
      disposeTextBinding(oldDom);
      if (oldDom.nodeValue !== text) oldDom.nodeValue = text;
      return oldDom;
    }
    return replaceNode(parent, oldDom, document.createTextNode(text));
  }

  if (Array.isArray(newVdom)) {
    const kids = normalizeChildren(newVdom);
    if (
      oldDom &&
      oldDom.nodeType === Node.ELEMENT_NODE &&
      oldDom.style?.display === 'contents' &&
      !oldDom.hasAttribute('data-component')
    ) {
      patchChildren(oldDom, kids, owner, path);
      return oldDom;
    }
    clearChildRange(owner, path);
    return replaceNode(parent, oldDom, createDom(kids, owner, path));
  }

  if (isFragmentType(newVdom.type)) {
    const kids = normalizeChildren(newVdom.children);
    if (
      oldDom &&
      oldDom.nodeType === Node.ELEMENT_NODE &&
      oldDom.style?.display === 'contents' &&
      !oldDom.hasAttribute('data-component')
    ) {
      patchChildren(oldDom, kids, owner, path);
      return oldDom;
    }
    clearChildRange(owner, path);
    return replaceNode(parent, oldDom, createDom(newVdom, owner, path));
  }

  if (isComponentType(newVdom.type)) {
    const props = componentProps(newVdom);
    if (oldDom && oldDom.hasAttribute?.('data-component') && owner._children?.has(path)) {
      const entry = owner._children.get(path);
      const expectedFactory = newVdom.type.$$component
        ? newVdom.type
        : newVdom.type.$$wrapped;
      if (entry.factory === newVdom.type || entry.factory === expectedFactory) {
        if (entry.instance._props !== props) {
          entry.instance.update(props);
        }
        return entry.host;
      }
      clearChildRange(owner, path);
      const host = owner._mountChild(path, newVdom.type, props);
      return replaceNode(parent, oldDom, host);
    }
    clearChildRange(owner, path);
    const host = owner._mountChild(path, newVdom.type, props);
    return replaceNode(parent, oldDom, host);
  }

  if (!sameHostType(oldDom, newVdom)) {
    clearChildRange(owner, path);
    return replaceNode(parent, oldDom, createDom(newVdom, owner, path));
  }

  applyProps(oldDom, newVdom.props, owner);
  patchChildren(oldDom, normalizeChildren(newVdom.children), owner, path);
  return oldDom;
}

function patchChildren(parentEl, newChildren, owner, path) {
  const oldNodes = [...parentEl.childNodes];
  const keyed = newChildren.some((child) => getVdomKey(child) != null);

  if (!keyed) {
    const max = Math.max(oldNodes.length, newChildren.length);
    for (let i = 0; i < max; i++) {
      const oldNode = oldNodes[i];
      const newChild = newChildren[i];
      const childPath = newChild
        ? childOwnerPath(path, i, newChild)
        : `${path}.${i}`;

      if (newChild === undefined) {
        if (oldNode) removeNode(parentEl, oldNode, owner, childPath);
        continue;
      }

      if (!oldNode) {
        const node = createDom(newChild, owner, childPath);
        setNodeKey(node, getVdomKey(newChild));
        parentEl.appendChild(node);
        continue;
      }

      const next = patchDom(parentEl, oldNode, newChild, owner, childPath);
      setNodeKey(next, getVdomKey(newChild));
    }
    return;
  }

  // Keyed reconciliation
  const oldByKey = new Map();
  const oldUnkeyed = [];
  for (const node of oldNodes) {
    const k = getNodeKey(node);
    if (k != null && !oldByKey.has(k)) oldByKey.set(k, node);
    else oldUnkeyed.push(node);
  }

  const used = new Set();
  let unkeyedIdx = 0;

  for (let i = 0; i < newChildren.length; i++) {
    const newChild = newChildren[i];
    const key = getVdomKey(newChild);
    const childPath = childOwnerPath(path, i, newChild);
    let oldNode;

    if (key != null && oldByKey.has(key)) {
      oldNode = oldByKey.get(key);
      oldByKey.delete(key);
    } else if (unkeyedIdx < oldUnkeyed.length) {
      oldNode = oldUnkeyed[unkeyedIdx++];
    }

    if (oldNode) used.add(oldNode);

    let next;
    if (!oldNode) {
      next = createDom(newChild, owner, childPath);
    } else {
      next = patchDom(parentEl, oldNode, newChild, owner, childPath);
    }
    setNodeKey(next, key);

    const ref = parentEl.childNodes[i] || null;
    if (next !== ref) {
      parentEl.insertBefore(next, ref);
    }
  }

  for (const node of oldNodes) {
    if (!used.has(node) && node.parentNode === parentEl) {
      const staleKey = getNodeKey(node);
      const stalePath =
        staleKey != null ? `${path}:${staleKey}` : `${path}.#x`;
      removeNode(parentEl, node, owner, stalePath);
    }
  }
}

function isFragmentHost(node) {
  return (
    node &&
    node.nodeType === Node.ELEMENT_NODE &&
    (node.getAttribute?.('data-fg') === 'fragment' ||
      (node.style?.display === 'contents' && !node.hasAttribute('data-component')))
  );
}

function isComponentHost(node) {
  return node && node.nodeType === Node.ELEMENT_NODE && node.hasAttribute('data-component');
}

function hydrationMismatch(existingNode, vdom, owner, path, reason) {
  console.warn(`[hydrate] mismatch at ${path}: ${reason}`, { existingNode, vdom });
  const fresh = createDom(vdom, owner, path);
  if (existingNode?.parentNode) {
    existingNode.parentNode.replaceChild(fresh, existingNode);
  }
  return fresh;
}

/**
 * Adopt an existing DOM node for `vdom` and attach bindings / listeners.
 * On mismatch, warn and replace with a client-created subtree.
 */
export function adoptDom(existingNode, vdom, owner, path = '0') {
  if (vdom == null || vdom === false || vdom === true) {
    if (existingNode && existingNode.nodeType === Node.TEXT_NODE) {
      existingNode.nodeValue = '';
      return existingNode;
    }
    return hydrationMismatch(existingNode, vdom, owner, path, 'expected empty text');
  }

  if (typeof vdom === 'string' || typeof vdom === 'number') {
    const text = String(vdom);
    if (existingNode && existingNode.nodeType === Node.TEXT_NODE) {
      disposeTextBinding(existingNode);
      existingNode.nodeValue = text;
      return existingNode;
    }
    return hydrationMismatch(existingNode, vdom, owner, path, 'expected text node');
  }

  if (isAccessor(vdom)) {
    if (isDynamicHost(existingNode) || isFragmentHost(existingNode)) {
      disposeTextBinding(existingNode);
      existingNode.setAttribute('data-fg', 'dynamic');
      const fresh = createDynamicChild(vdom, owner, path);
      if (existingNode.parentNode) {
        existingNode.parentNode.replaceChild(fresh, existingNode);
      }
      return fresh;
    }
    return hydrationMismatch(existingNode, vdom, owner, path, 'expected dynamic host for accessor');
  }

  if (Array.isArray(vdom)) {
    const kids = normalizeChildren(vdom);
    if (isFragmentHost(existingNode)) {
      adoptChildren(existingNode, kids, owner, path);
      return existingNode;
    }
    return hydrationMismatch(existingNode, kids, owner, path, 'expected fragment host');
  }

  if (typeof vdom !== 'object') {
    return hydrationMismatch(existingNode, vdom, owner, path, 'unexpected vnode');
  }

  if (isFragmentType(vdom.type)) {
    const kids = normalizeChildren(vdom.children);
    if (isFragmentHost(existingNode)) {
      adoptChildren(existingNode, kids, owner, path);
      return existingNode;
    }
    return hydrationMismatch(existingNode, vdom, owner, path, 'expected fragment host');
  }

  if (isComponentType(vdom.type)) {
    if (!isComponentHost(existingNode)) {
      return hydrationMismatch(existingNode, vdom, owner, path, 'expected data-component host');
    }
    return owner._mountChild(path, vdom.type, componentProps(vdom), {
      hydrate: true,
      host: existingNode,
    });
  }

  if (
    !existingNode ||
    existingNode.nodeType !== Node.ELEMENT_NODE ||
    existingNode.tagName !== String(vdom.type).toUpperCase() ||
    existingNode.hasAttribute('data-component')
  ) {
    return hydrationMismatch(existingNode, vdom, owner, path, 'expected host element');
  }

  applyProps(existingNode, vdom.props, owner);
  adoptChildren(existingNode, normalizeChildren(vdom.children), owner, path);
  return existingNode;
}

function adoptChildren(parentEl, newChildren, owner, path) {
  const oldNodes = [...parentEl.childNodes];
  const max = Math.max(oldNodes.length, newChildren.length);

  for (let i = 0; i < max; i++) {
    const oldNode = oldNodes[i];
    const newChild = newChildren[i];
    const childPath = newChild
      ? childOwnerPath(path, i, newChild)
      : `${path}.${i}`;

    if (newChild === undefined) {
      if (oldNode) removeNode(parentEl, oldNode, owner, childPath);
      continue;
    }

    if (!oldNode) {
      parentEl.appendChild(createDom(newChild, owner, childPath));
      continue;
    }

    adoptDom(oldNode, newChild, owner, childPath);
  }
}

export function unmountDomTree(owner) {
  if (owner?._bindings) {
    owner._bindings.forEach((dispose) => {
      try {
        dispose();
      } catch (error) {
        console.error('Error disposing binding:', error);
      }
    });
    owner._bindings = [];
  }
  if (!owner?._children) return;
  for (const entry of owner._children.values()) {
    entry.instance?.unmount();
  }
  owner._children.clear();
}
