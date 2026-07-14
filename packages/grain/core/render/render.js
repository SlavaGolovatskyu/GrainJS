import { createComponent } from '../component/component.js';

function asComponentFactory(type) {
  if (typeof type !== 'function') {
    throw new TypeError('render() expects a component function');
  }
  if (type.$$component) return type;
  if (!type.$$wrapped) {
    type.$$wrapped = createComponent(type);
  }
  return type.$$wrapped;
}

/**
 * Mount a component into a container.
 * Accepts either a createComponent factory or a plain function (auto-wrapped).
 */
export function render(Component, container, props = {}) {
  container.innerHTML = '';

  const factory = asComponentFactory(Component);
  const componentInstance = factory(props);
  componentInstance.mount(container);

  return componentInstance;
}

/**
 * Attach a component to existing server-rendered markup in `container`
 * without clearing it. Re-binds signal accessors and event listeners.
 */
export function hydrate(Component, container, props = {}) {
  if (!container) {
    throw new TypeError('hydrate() requires a container element');
  }

  const factory = asComponentFactory(Component);
  const componentInstance = factory(props);
  componentInstance.mount(container, { hydrate: true });

  return componentInstance;
}
