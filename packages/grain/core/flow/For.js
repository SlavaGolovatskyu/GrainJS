import { createSignal } from '../../signals/createSignal/createSignal.js';
import { readProp } from './resolve.js';
import {
  resolveKeyed,
  normalizeEach,
  syncKeyedRows,
} from './keyed-list.js';

/**
 * Map a reactive list to children. Prefer stable keys via item.id or `keyed`.
 * Only rows whose item/index actually change re-render; siblings stay mounted.
 *
 *   <For each={todos()} fallback={<p>Empty</p>}>
 *     {(todo) => <li>{todo.text}</li>}
 *   </For>
 */
export function For(props) {
  // Stable bag across For re-renders (hooks-style signal reuse).
  const [getBag] = createSignal({ rows: new Map() });
  const bag = getBag();

  const items = normalizeEach(readProp(props.each));
  const keyed = resolveKeyed(props.keyed);

  if (items.length === 0) {
    bag.rows.clear();
    return props.fallback ?? null;
  }

  return syncKeyedRows(bag, items, keyed, props.children);
}
