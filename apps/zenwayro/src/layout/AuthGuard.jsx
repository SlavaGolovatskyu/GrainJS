import { createEffect, navigate, useLocation } from 'grainlet';
import { isAuthenticated } from '../api/client.js';
import { isPublicPathname, routeAuthSignInWithCallback } from '../constants/routes.js';

const BASENAME = '/zenwayro';

function appPath(pathname) {
  if (!pathname) return '/';
  if (pathname === BASENAME || pathname === `${BASENAME}/`) return '/';
  if (pathname.startsWith(`${BASENAME}/`)) return pathname.slice(BASENAME.length) || '/';
  return pathname;
}

export function AuthGuard() {
  const location = useLocation();

  createEffect(() => {
    const path = appPath(location().pathname);
    if (!isAuthenticated() && !isPublicPathname(path)) {
      navigate(routeAuthSignInWithCallback(path));
    }
  });

  return null;
}
