import { render, h } from 'preact';
import { App } from './App.jsx';

export function mount(el) {
  el.innerHTML = '';
  render(h(App), el);
  return el;
}

export function unmount(el) {
  render(null, el);
}
