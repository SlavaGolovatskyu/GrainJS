import { createSignal } from '../../signals/createSignal/createSignal.js';

function readWindowLocation() {
  if (typeof window === 'undefined') {
    return { pathname: '/', search: '', hash: '', state: null };
  }
  return {
    pathname: window.location.pathname || '/',
    search: window.location.search || '',
    hash: window.location.hash || '',
    state: window.history.state ?? null,
  };
}

const [getLocation, setLocation] = createSignal(readWindowLocation());

let listening = false;

export function ensureHistoryListener() {
  if (listening || typeof window === 'undefined') return;
  listening = true;
  window.addEventListener('popstate', () => {
    setLocation(readWindowLocation());
  });
}

export function getLocationSignal() {
  return getLocation;
}

export function setLocationState(next) {
  setLocation(next);
}

export function readLocation() {
  return getLocation();
}

export { readWindowLocation };
