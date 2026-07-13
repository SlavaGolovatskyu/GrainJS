import {
  setCurrentComponent,
  currentComponent,
} from '../../signals-core/reactive-context/reactive-context.js';
import { createEffect } from '../../signals-core/createEffect/createEffect.js';
import { componentSignalRegistry } from '../../signals-core/createSignal/createSignal.js';
import { jsxCompiler } from '../jsx-compiler/jsx-compiler.js';
import { createDom, patchDom, unmountDomTree } from '../dom/dom.js';

function normalizeRenderResult(result, instance) {
  if (result && typeof result === 'object' && result.html) {
    instance._currentFunctions = result.functions || null;
    return jsxCompiler.compile(result.html);
  }

  if (typeof result === 'string') {
    instance._currentFunctions = null;
    return jsxCompiler.compile(result);
  }

  instance._currentFunctions = null;
  return result;
}

export function createComponent(ComponentFn) {
  function Component(props = {}) {
    const instance = {
      _effects: [],
      _cleanups: [],
      _mounted: false,
      _element: null,
      _parentElement: null,
      _componentFn: ComponentFn,
      _props: props,
      _renderCount: 0,
      _effectsInitialized: false,
      _children: new Map(),
      _renderEffect: null,
      _currentFunctions: null,
      _bindings: [],

      registerComponent() {
        // No-op: JSX passes function types directly
      },

      update(nextProps) {
        this._props = nextProps;
        if (this._mounted && this._renderEffect) {
          this._renderEffect();
        }
      },

      _mountChild(path, type, childProps) {
        let factory = type;
        if (!type.$$component) {
          if (!type.$$wrapped) {
            type.$$wrapped = createComponent(type);
          }
          factory = type.$$wrapped;
        }

        const existing = this._children.get(path);

        if (existing && existing.factory === factory) {
          existing.instance.update(childProps);
          return existing.host;
        }

        if (existing) {
          existing.instance.unmount();
          this._children.delete(path);
        }

        const host = document.createElement('span');
        host.style.display = 'contents';
        host.setAttribute('data-component', '');

        const child = factory(childProps);
        child.mount(host);
        this._children.set(path, { instance: child, factory, host });
        return host;
      },

      mount(parentElement) {
        if (this._mounted) return;

        this._parentElement = parentElement;
        this._mounted = true;

        const previousComponent = currentComponent;
        setCurrentComponent(this);

        const effect = () => {
          if (!this._mounted) return;

          const prev = currentComponent;
          setCurrentComponent(this);

          this._renderCount++;
          if (componentSignalRegistry.has(this)) {
            componentSignalRegistry.get(this).index = 0;
          }

          const isFirstRender = !this._effectsInitialized;
          let result = this._componentFn(this._props);

          // Keep owner as currentComponent while building DOM so text/prop
          // bindings can register and track signals without re-running this fn.
          result = normalizeRenderResult(result, this);

          if (!this._element) {
            this._element = createDom(result, this, '0');
            parentElement.appendChild(this._element);
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

          setCurrentComponent(prev);
        };

        // createEffect registers on this (currentComponent) and runs immediately
        createEffect(effect);
        // Bind to the effect on _effects so update/dispose share the same fn
        this._renderEffect = this._effects[this._effects.length - 1] || effect;

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

    return instance;
  }

  Component.$$component = true;
  return Component;
}
