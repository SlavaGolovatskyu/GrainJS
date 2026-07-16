import { createSignal } from '../../signals/createSignal/createSignal.js';
import {
  currentComponent,
  setCurrentComponent,
} from '../../signals/reactive-context/reactive-context.js';
import { readProp } from './resolve.js';

function defaultKeyOf(item, index) {
  if (item == null) return index;
  if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') {
    return item;
  }
  if (typeof item === 'object') {
    if (item.id != null) return item.id;
    if (item.key != null) return item.key;
  }
  return index;
}

/**
 * Row component: re-runs when its item signal changes.
 * Index is only read when the map callback declares a second parameter,
 * so reorder does not refresh item-only rows.
 */
function ForRow(props) {
  const render = props.render;
  if (typeof render !== 'function') {
    return render;
  }
  const item = props.getItem();
  if (render.length > 1) {
    return render(item, props.getIndex());
  }
  return render(item);
}

function createRow(item, index, render) {
  // Detach from For's hook registry so dynamic rows don't break call order.
  const prev = currentComponent;
  setCurrentComponent(null);

  const [getItem, setItem] = createSignal(item);
  const [getIndex, setIndex] = createSignal(index);
  const props = { getItem, getIndex, render };
  const vnode = { type: ForRow, props, children: undefined };

  setCurrentComponent(prev);

  return { setItem, setIndex, props, vnode };
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
  // Stable bag across For re-renders (hooks-style signal reuse).
  const [getBag] = createSignal({ rows: new Map() });
  const bag = getBag();

  const list = readProp(props.each);
  const items = Array.isArray(list) ? list : list == null ? [] : [list];

  const keyed =
    typeof props.keyed === 'function'
      ? props.keyed
      : props.keyed === false
        ? (_item, index) => index
        : defaultKeyOf;

  if (items.length === 0) {
    bag.rows.clear();
    return props.fallback ?? null;
  }

  const seen = new Set();
  const out = [];

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const key = keyed(item, index);
    seen.add(key);

    let row = bag.rows.get(key);
    if (!row) {
      row = createRow(item, index, props.children);
      bag.rows.set(key, row);
    } else {
      row.setItem(item);
      row.setIndex(index);
      // Parent remade the map callback — swap props identity so patch updates rows once.
      if (row.props.render !== props.children) {
        row.props = {
          getItem: row.props.getItem,
          getIndex: row.props.getIndex,
          render: props.children,
        };
        row.vnode.props = row.props;
      }
    }

    row.vnode.key = key;
    row.props.key = key;
    out.push(row.vnode);
  }

  for (const key of [...bag.rows.keys()]) {
    if (!seen.has(key)) {
      bag.rows.delete(key);
    }
  }

  return out;
}
