import { onCleanup } from '../../signals/index.js';
import { isServer } from '../../signals/env.js';
import { currentComponent } from '../../signals/reactive-context/reactive-context.js';
import { jsx } from '../jsx-compiler-new/jsx-runtime.js';
import { createDom, patchDom } from '../dom/dom.js';
import { asArray, readProp } from './resolve.js';

const portalState = new WeakMap();

function normalizePortalChildren(children) {
  const list = asArray(children).filter(
    (child) => child != null && child !== false && child !== true
  );
  if (list.length === 0) return null;
  if (list.length === 1) return list[0];
  return list;
}

function clearPortalChildren(owner) {
  if (!owner?._children) return;
  for (const key of [...owner._children.keys()]) {
    if (
      key === 'portal' ||
      key.startsWith('portal.') ||
      key.startsWith('portal:')
    ) {
      owner._children.get(key)?.instance?.unmount();
      owner._children.delete(key);
    }
  }
}

function disposePortalContent(state, owner) {
  clearPortalChildren(owner);
  if (state.node?.parentNode) {
    state.node.parentNode.removeChild(state.node);
  }
  state.node = null;
}

function disposePortalState(state, owner) {
  disposePortalContent(state, owner);
  if (state.createdWrapper && state.root?.parentNode) {
    state.root.parentNode.removeChild(state.root);
  }
  state.root = null;
  state.createdWrapper = false;
  state.mountEl = null;
  state.isSVG = false;
  state.isHead = false;
}

function ensurePortalRoot(state, owner, mountEl, isSVG) {
  const isHead =
    typeof document !== 'undefined' && mountEl === document.head;

  if (
    state.root &&
    state.mountEl === mountEl &&
    state.isSVG === isSVG &&
    state.isHead === isHead
  ) {
    return state.root;
  }

  disposePortalContent(state, owner);

  if (state.createdWrapper && state.root?.parentNode) {
    state.root.parentNode.removeChild(state.root);
  }

  state.mountEl = mountEl;
  state.isSVG = isSVG;
  state.isHead = isHead;

  if (isHead) {
    state.root = mountEl;
    state.createdWrapper = false;
  } else if (isSVG) {
    state.root = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    state.root.setAttribute('data-grainlet-portal', '');
    mountEl.appendChild(state.root);
    state.createdWrapper = true;
  } else {
    state.root = document.createElement('div');
    state.root.setAttribute('data-grainlet-portal', '');
    mountEl.appendChild(state.root);
    state.createdWrapper = true;
  }

  return state.root;
}

/**
 * Render children into document.body (or `mount`), escaping parent overflow/stacking.
 *
 *   <Portal>
 *     <div class="popup">...</div>
 *   </Portal>
 *
 *   <Portal mount={document.querySelector('main')}>...</Portal>
 *   <Portal mount={svgEl} isSVG>...</Portal>
 */
export function Portal(props) {
  return jsx(PortalAnchor, {
    mount: props.mount,
    isSVG: props.isSVG,
    children: props.children,
  });
}

function PortalAnchor(props) {
  // SSR: keep children in place (no document to portal into).
  if (isServer() || typeof document === 'undefined') {
    return props.children ?? null;
  }

  const owner = currentComponent;
  if (!owner) {
    return props.children ?? null;
  }

  let state = portalState.get(owner);
  if (!state) {
    state = {
      root: null,
      node: null,
      createdWrapper: false,
      mountEl: null,
      isSVG: false,
      isHead: false,
    };
    portalState.set(owner, state);
    onCleanup(() => {
      disposePortalState(state, owner);
      portalState.delete(owner);
    });
  }

  const mountEl = readProp(props.mount) || document.body;
  const isSVG = !!readProp(props.isSVG);
  const root = ensurePortalRoot(state, owner, mountEl, isSVG);
  const childVdom = normalizePortalChildren(props.children);

  if (childVdom == null) {
    disposePortalContent(state, owner);
  } else if (!state.node) {
    state.node = createDom(childVdom, owner, 'portal');
    root.appendChild(state.node);
  } else {
    state.node = patchDom(root, state.node, childVdom, owner, 'portal');
  }

  return null;
}
