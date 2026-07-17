import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import { App } from './App.jsx';

export function mount(el) {
  el.innerHTML = '';
  const root = createRoot(el);
  root.render(createElement(App));
  return root;
}

export function unmount(root) {
  root?.unmount?.();
}
