export function render(Component, container, props = {}) {
  // Clear container
  container.innerHTML = '';
  
  // Create and mount component
  const componentInstance = Component(props);
  componentInstance.mount(container);
  
  return componentInstance;
}