import { createSignal } from '../../signals/createSignal/createSignal.js';
import { isServer } from '../../signals/env.js';
import { currentComponent } from '../../signals/reactive-context/reactive-context.js';
import { readProp } from './resolve.js';
import {
  resolveKeyed,
  normalizeEach,
  reconcileKeyedList,
  clearKeyedList,
  mapKeyedVnodes,
} from './keyed-list.js';

function renderForSSR(props) {
  const items = normalizeEach(readProp(props.each));
  if (items.length === 0) {
    return props.fallback ?? null;
  }
  return mapKeyedVnodes(items, resolveKeyed(props.keyed), props.children);
}

/**
 * Map a reactive list to children. Prefer stable keys via item.id or `keyed`.
 * Only rows whose item/index actually change re-render; siblings stay mounted.
 *
 *   <For each={todos()} fallback={<p>Empty</p>}>
 *     {(todo) => <li>{todo.text}</li>}
 *   </For>
 */
export function For(props) {
  if (isServer()) {
    return renderForSSR(props);
  }

  const owner = currentComponent;
  const [getBag] = createSignal({ rows: new Map() });
  const bag = getBag();

  const items = normalizeEach(readProp(props.each));
  const parent = owner?._parentElement;

  if (!parent) {
    return null;
  }

  if (items.length === 0) {
    clearKeyedList(parent, bag, owner);
    return props.fallback ?? null;
  }

  reconcileKeyedList(
    parent,
    bag,
    items,
    resolveKeyed(props.keyed),
    props.children,
    owner
  );

  // Placeholder text node kept as `_element` so parent patchDom has a stable
  // child; real rows are siblings under the same component host.
  return null;
}
