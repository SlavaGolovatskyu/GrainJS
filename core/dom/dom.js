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

function resolveValue(value, owner) {
  if (
    typeof value === 'string' &&
    value.startsWith('__func_') &&
    value.endsWith('__') &&
    owner?._currentFunctions?.has(value)
  ) {
    return owner._currentFunctions.get(value);
  }
  return value;
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
  const props = { ...(vdom.props || {}) };
  const kids = normalizeChildren(vdom.children);
  if (kids.length > 0 && props.children === undefined) {
    props.children = kids.length === 1 ? kids[0] : kids;
  }
  return props;
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

    let value = resolveValue(next[key], owner);
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

  el[PREV_PROPS] = next;
}

function clearChildRange(owner, pathPrefix) {
  if (!owner?._children) return;
  for (const key of [...owner._children.keys()]) {
    if (key === pathPrefix || key.startsWith(pathPrefix + '.')) {
      const entry = owner._children.get(key);
      if (entry?.instance) {
        entry.instance.unmount();
      }
      owner._children.delete(key);
    }
  }
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
  if (node && node.parentNode === parentEl) {
    parentEl.removeChild(node);
  }
}

export function createDom(vdom, owner, path = '0') {
  if (vdom == null || vdom === false || vdom === true) {
    return document.createTextNode('');
  }

  if (typeof vdom === 'string' || typeof vdom === 'number') {
    return document.createTextNode(String(vdom));
  }

  if (isAccessor(vdom)) {
    return createTextFromValue(vdom);
  }

  if (Array.isArray(vdom)) {
    const host = document.createElement('span');
    host.style.display = 'contents';
    normalizeChildren(vdom).forEach((child, i) => {
      host.appendChild(createDom(child, owner, `${path}.${i}`));
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
    normalizeChildren(vdom.children).forEach((child, i) => {
      host.appendChild(createDom(child, owner, `${path}.${i}`));
    });
    return host;
  }

  if (isComponentType(type)) {
    return owner._mountChild(path, type, componentProps(vdom));
  }

  const el = document.createElement(type);
  applyProps(el, vdom.props, owner);
  normalizeChildren(vdom.children).forEach((child, i) => {
    el.appendChild(createDom(child, owner, `${path}.${i}`));
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
    clearChildRange(owner, path);
    if (oldDom && oldDom.nodeType === Node.TEXT_NODE) {
      bindText(oldDom, newVdom);
      return oldDom;
    }
    return replaceNode(parent, oldDom, createTextFromValue(newVdom));
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
        entry.instance.update(props);
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
  const max = Math.max(oldNodes.length, newChildren.length);

  for (let i = 0; i < max; i++) {
    const childPath = `${path}.${i}`;
    const oldNode = oldNodes[i];
    const newChild = newChildren[i];

    if (newChild === undefined) {
      if (oldNode) removeNode(parentEl, oldNode, owner, childPath);
      continue;
    }

    if (!oldNode) {
      parentEl.appendChild(createDom(newChild, owner, childPath));
      continue;
    }

    patchDom(parentEl, oldNode, newChild, owner, childPath);
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
