import { createComponent } from '../../core/component/component.js';
import { jsx } from '../../core/jsx-compiler-new/jsx-runtime.js';
import { ensureHistoryListener, getLocationSignal } from '../location/location.js';
import { matchRoutes } from '../match/match.js';
import { setCurrentRouteMatch } from '../context/context.js';
import { publishParams } from '../useParams/useParams.js';
import { Route } from '../Route/Route.js';
import {
  setNavigateBasename,
  stripBasename,
  normalizeBasename,
} from '../navigate/navigate.js';

function asArray(value) {
  if (value == null || value === false) return [];
  return Array.isArray(value) ? value.flat(Infinity) : [value];
}

/**
 * Turn Router children / routes prop into { path, component, children }[].
 */
export function routesFromChildren(children) {
  const nodes = asArray(children);
  const routes = [];

  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue;

    const type = node.type;
    const isRouteType =
      type === Route || type?.$$route === true || type?.name === 'Route';

    if (!isRouteType) continue;

    const props = node.props || {};
    const nested = [
      ...asArray(props.children),
      ...asArray(node.children),
    ];

    routes.push({
      path: props.path ?? '/',
      component: props.component,
      children: routesFromChildren(nested),
    });
  }

  return routes;
}

/**
 * Matches location against Route children (or `routes` array) and renders the page.
 *
 * @param {{ basename?: string, routes?: array, children?: any, pageProps?: object }} props
 */
export const Router = createComponent((props) => {
  ensureHistoryListener();
  const basename = normalizeBasename(props.basename ?? '');
  setNavigateBasename(basename);

  const location = getLocationSignal();

  const routes =
    props.routes ??
    routesFromChildren(props.children);

  const pathname = stripBasename(location().pathname, basename);
  const matched = matchRoutes(routes, pathname);

  setCurrentRouteMatch(matched);
  publishParams(matched?.params ?? {});

  const Page = matched?.component;
  if (!Page) {
    return jsx('div', { 'data-router': 'empty' }, 'No route matched');
  }

  const pageProps = {
    ...(props.pageProps || {}),
    params: matched.params,
    location: location(),
  };

  return jsx(
    'div',
    {
      'data-router': 'outlet',
      'data-path': matched.path,
      'data-basename': basename || undefined,
    },
    jsx(Page, pageProps)
  );
});
