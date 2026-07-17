import { asComponentFactory } from '../component/component.js';

/**
 * Mount a component into a container.
 * Accepts either a createComponent factory or a plain function (auto-wrapped).
 */
export function render(Component, container, props = {}) {
  if (typeof Component !== 'function') {
    throw new TypeError('render() expects a component function');
  }
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
  if (typeof Component !== 'function') {
    throw new TypeError('hydrate() expects a component function');
  }

  const factory = asComponentFactory(Component);
  const componentInstance = factory(props);
  componentInstance.mount(container, { hydrate: true });

  return componentInstance;
}
