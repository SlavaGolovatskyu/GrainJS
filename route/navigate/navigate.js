import {
  ensureHistoryListener,
  readWindowLocation,
  setLocationState,
} from '../location/location.js';
import { normalizePath } from '../match/match.js';

let activeBasename = '';

export function setNavigateBasename(basename = '') {
  activeBasename = normalizeBasename(basename);
}

export function getNavigateBasename() {
  return activeBasename;
}

export function normalizeBasename(basename) {
  if (!basename || basename === '/') return '';
  let b = String(basename);
  if (!b.startsWith('/')) b = `/${b}`;
  if (b.endsWith('/')) b = b.slice(0, -1);
  return b;
}

/** Strip basename from pathname for route matching. */
export function stripBasename(pathname, basename = activeBasename) {
  const base = normalizeBasename(basename);
  const path = normalizePath(pathname || '/');
  if (!base) return path;
  if (path === base) return '/';
  if (path.startsWith(base + '/')) {
    return normalizePath(path.slice(base.length) || '/');
  }
  return path;
}

/** Prefix basename onto an app path for history URLs. */
export function withBasename(to, basename = activeBasename) {
  const base = normalizeBasename(basename);
  const url = typeof to === 'string' ? to : '/';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  const abs = new URL(url, 'http://local.invalid');
  let path = normalizePath(abs.pathname || '/');
  if (base) {
    path = path === '/' ? base : normalizePath(`${base}${path}`);
  }
  return path + (abs.search || '') + (abs.hash || '');
}

/**
 * @param {string} to - app path (basename applied automatically)
 * @param {{ replace?: boolean, state?: unknown, basename?: string }} [options]
 */
export function navigate(to, options = {}) {
  ensureHistoryListener();
  if (typeof window === 'undefined') return;

  if (options.basename != null) {
    setNavigateBasename(options.basename);
  }

  const full = withBasename(to, activeBasename);
  const url = new URL(full, window.location.origin);
  const next = {
    pathname: url.pathname || '/',
    search: url.search || '',
    hash: url.hash || '',
    state: options.state ?? null,
  };

  const current = readWindowLocation();
  const same =
    current.pathname === next.pathname &&
    current.search === next.search &&
    current.hash === next.hash;

  if (options.replace || same) {
    window.history.replaceState(next.state, '', url.pathname + url.search + url.hash);
  } else {
    window.history.pushState(next.state, '', url.pathname + url.search + url.hash);
  }

  setLocationState({
    ...next,
    state: window.history.state ?? next.state,
  });
}
