import { jsx } from '../../core/jsx-compiler-new/jsx-runtime.js';
import { navigate, getNavigateBasename, withBasename } from '../navigate/navigate.js';
import { useLocation } from '../useLocation/useLocation.js';
import { stripBasename } from '../navigate/navigate.js';

function isModifiedEvent(e) {
  return e.metaKey || e.altKey || e.ctrlKey || e.shiftKey;
}

function readProp(value) {
  return typeof value === 'function' ? value() : value;
}

/**
 * Client-side link. `href` is an app path (basename applied for the real URL).
 * Resolves accessor props from grainlet-vite wrap-jsx-accessors.
 */
export function Link(props) {
  const location = useLocation();
  const children = props.children;

  const getHref = () => {
    const raw = props.href ?? props.to ?? '#';
    const href = readProp(raw);
    return href == null || href === '' ? '#' : href;
  };

  const getClass = () => {
    const raw = props.className ?? props.class ?? '';
    const className = readProp(raw) || '';
    const basename = getNavigateBasename();
    const fullHref = withBasename(getHref(), basename);
    const appPath = stripBasename(location().pathname, basename);
    let active = false;
    try {
      const targetApp = stripBasename(
        new URL(fullHref, window.location.origin).pathname,
        basename
      );
      active = targetApp === appPath;
    } catch {
      active = false;
    }
    const activeClass = props.activeClass ?? 'active';
    return [className, active ? activeClass : ''].filter(Boolean).join(' ') || undefined;
  };

  const handleClick = (e) => {
    if (typeof props.onclick === 'function') props.onclick(e);
    if (typeof props.onClick === 'function') props.onClick(e);
    if (e.defaultPrevented) return;
    if (e.button !== 0 || isModifiedEvent(e)) return;
    if (props.target && props.target !== '_self') return;

    const href = getHref();
    const basename = getNavigateBasename();
    const fullHref = withBasename(href, basename);

    try {
      const url = new URL(fullHref, window.location.origin);
      if (url.origin !== window.location.origin) return;
      e.preventDefault();
      navigate(href, {
        replace: readProp(props.replace),
        state: readProp(props.state),
      });
    } catch {
      // invalid URL — let browser handle
    }
  };

  return jsx(
    'a',
    {
      href: () => withBasename(getHref(), getNavigateBasename()),
      class: getClass,
      onclick: handleClick,
    },
    children
  );
}
