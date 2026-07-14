import { jsx } from '../../core/jsx-compiler-new/jsx-runtime.js';
import { navigate, getNavigateBasename, withBasename } from '../navigate/navigate.js';
import { useLocation } from '../useLocation/useLocation.js';
import { stripBasename } from '../navigate/navigate.js';

function isModifiedEvent(e) {
  return e.metaKey || e.altKey || e.ctrlKey || e.shiftKey;
}

/**
 * Client-side link. `href` is an app path (basename applied for the real URL).
 */
export function Link(props) {
  const location = useLocation();
  const href = props.href ?? props.to ?? '#';
  const className = props.className ?? props.class ?? '';
  const children = props.children;
  const basename = getNavigateBasename();
  const fullHref = withBasename(href, basename);

  const handleClick = (e) => {
    if (typeof props.onclick === 'function') props.onclick(e);
    if (typeof props.onClick === 'function') props.onClick(e);
    if (e.defaultPrevented) return;
    if (e.button !== 0 || isModifiedEvent(e)) return;
    if (props.target && props.target !== '_self') return;

    try {
      const url = new URL(fullHref, window.location.origin);
      if (url.origin !== window.location.origin) return;
      e.preventDefault();
      navigate(href, {
        replace: props.replace,
        state: props.state,
      });
    } catch {
      // invalid URL — let browser handle
    }
  };

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

  const cls = [className, active ? props.activeClass ?? 'active' : '']
    .filter(Boolean)
    .join(' ');

  return jsx(
    'a',
    { href: fullHref, class: cls || undefined, onclick: handleClick },
    children
  );
}
