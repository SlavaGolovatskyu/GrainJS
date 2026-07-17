import {
  setCurrentComponent,
  currentComponent,
} from '../../signals/reactive-context/reactive-context.js';
import { createEffect } from '../../signals/createEffect/createEffect.js';
import { componentSignalRegistry } from '../../signals/createSignal/createSignal.js';
import { createDom, patchDom, adoptDom, unmountDomTree } from '../dom/dom.js';
import { createContentsHost } from '../dom/hosts.js';
import { getErrorBoundary } from '../flow/context.js';

/** Ensure `type` is a createComponent factory (caches on `type.$$wrapped`). */
export function asComponentFactory(type) {
  if (type.$$component) return type;
  if (!type.$$wrapped) {
    type.$$wrapped = createComponent(type);
  }
  return type.$$wrapped;
}

const componentProto = {
  registerComponent() {
    // No-op: JSX passes function types directly
  },

  update(nextProps) {
    this._props = nextProps;
    if (this._mounted && this._renderEffect) {
      this._renderEffect();
    }
  },

  _mountChild(path, type, childProps, options = {}) {
    const factory = asComponentFactory(type);
    const existing = this._children.get(path);

    if (existing && existing.factory === factory) {
      // Same props object — skip; otherwise update.
      if (existing.instance._props !== childProps) {
        existing.instance.update(childProps);
      }
      return existing.host;
    }

    if (existing) {
      existing.instance.unmount();
      this._children.delete(path);
    }

    let host = options.host;
    if (!host) {
      host = createContentsHost('data-component', '');
    }

    const child = factory(childProps);
    child.mount(host, { hydrate: !!options.hydrate });
    this._children.set(path, { instance: child, factory, host });
    return host;
  },

  mount(parentElement, options = {}) {
    if (this._mounted) return;

    this._parentElement = parentElement;
    this._mounted = true;
    this._hydrate = !!options.hydrate;

    const previousComponent = currentComponent;
    setCurrentComponent(this);

    const effect = () => {
      if (!this._mounted) return;

      const prev = currentComponent;
      setCurrentComponent(this);

      try {
        this._renderCount++;
        if (componentSignalRegistry.has(this)) {
          componentSignalRegistry.get(this).index = 0;
        }

        const isFirstRender = !this._effectsInitialized;
        const result = this._componentFn(this._props);

        // Keep owner as currentComponent while building DOM so text/prop
        // bindings can register and track signals without re-running this fn.
        if (!this._element) {
          if (this._hydrate) {
            const existing = parentElement.firstChild;
            this._element = adoptDom(existing, result, this, '0');
            this._hydrate = false;
          } else {
            this._element = createDom(result, this, '0');
            parentElement.appendChild(this._element);
          }
        } else {
          this._element = patchDom(
            parentElement,
            this._element,
            result,
            this,
            '0'
          );
        }

        if (isFirstRender) {
          this._effectsInitialized = true;
        }
      } catch (err) {
        const boundary = getErrorBoundary();
        if (boundary) {
          // Defer so the current mount/patch stack can unwind before fallback remount.
          voidMicrotask(() => boundary.catch(err));
          return;
        }
        console.error('Uncaught render error:', err);
        throw err;
      } finally {
        setCurrentComponent(prev);
      }
    };

    // createEffect registers on this (currentComponent) and runs immediately
    createEffect(effect);
    // Same function reference subscribers invoke (do not use _effects.at(-1);
    // nested createEffects are also pushed during the first run).
    this._renderEffect = effect;

    setCurrentComponent(previousComponent);
  },

  unmount() {
    if (!this._mounted) return;

    if (this._cleanups) {
      this._cleanups.forEach((cleanup) => {
        try {
          cleanup();
        } catch (error) {
          console.error('Error in component cleanup:', error);
        }
      });
      this._cleanups = [];
    }

    this._effects.forEach((effect) => {
      if (typeof effect._dispose === 'function') {
        effect._dispose();
      } else {
        effect._disabled = true;
      }
    });
    this._effects = [];

    unmountDomTree(this);

    if (this._element && this._element.parentNode) {
      this._element.parentNode.removeChild(this._element);
    }

    this._mounted = false;
    this._element = null;
    this._renderEffect = null;
  },
};

export function createComponent(ComponentFn) {
  function Component(props = {}) {
    const instance = Object.create(componentProto);
    instance._effects = [];
    instance._cleanups = [];
    instance._mounted = false;
    instance._element = null;
    instance._parentElement = null;
    instance._componentFn = ComponentFn;
    instance._props = props;
    instance._renderCount = 0;
    instance._effectsInitialized = false;
    instance._children = new Map();
    instance._renderEffect = null;
    instance._bindings = [];
    instance._hydrate = false;
    return instance;
  }

  Component.$$component = true;
  Component._ssrFn = ComponentFn;
  return Component;
}
