import { render } from 'grainlet';
import { App } from './App.jsx';

export function mount(el) {
  el.innerHTML = '';
  return render(App, el);
}

export function unmount(instance) {
  instance?.unmount?.();
}
