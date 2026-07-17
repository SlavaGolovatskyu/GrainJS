import { render } from 'solid-js/web';
import { App } from './App.jsx';

export function mount(el) {
  el.innerHTML = '';
  return render(() => <App />, el);
}

export function unmount(dispose) {
  if (typeof dispose === 'function') dispose();
}
