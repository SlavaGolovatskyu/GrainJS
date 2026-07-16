import { Match } from './Match.js';
import {
  flattenFlowChildren,
  readProp,
  renderChild,
} from './resolve.js';

function isMatchType(type) {
  return type === Match || type?.$$match === true || type?.name === 'Match';
}

/**
 * Renders the first matching Match child, or fallback.
 *
 *   <Switch fallback={<div>None</div>}>
 *     <Match when={tab() === 0}><Uno /></Match>
 *     <Match when={tab() === 1}><Dos /></Match>
 *   </Switch>
 */
export function Switch(props) {
  const nodes = flattenFlowChildren(props.children);

  for (const node of nodes) {
    if (!isMatchType(node.type)) continue;
    const matchProps = node.props || {};
    const kids = matchProps.children ?? node.children;
    const value = readProp(matchProps.when);
    if (value) {
      return renderChild(kids, value);
    }
  }

  return props.fallback ?? null;
}
