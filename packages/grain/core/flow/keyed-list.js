import { createSignal } from '../../signals/createSignal/createSignal.js';
import {
  currentComponent,
  setCurrentComponent,
} from '../../signals/reactive-context/reactive-context.js';

export function defaultKeyOf(item, index) {
  if (item == null) return index;
  if (
    typeof item === 'string' ||
    typeof item === 'number' ||
    typeof item === 'boolean'
  ) {
    return item;
  }
  if (typeof item === 'object') {
    if (item.id != null) return item.id;
    if (item.key != null) return item.key;
  }
  return index;
}

export function resolveKeyed(keyedProp) {
  if (typeof keyedProp === 'function') return keyedProp;
  if (keyedProp === false) return (_item, index) => index;
  return defaultKeyOf;
}

export function normalizeEach(list) {
  return Array.isArray(list) ? list : list == null ? [] : [list];
}

/**
 * Row component: re-runs when its item signal changes.
 * Index is only read when the map callback declares a second parameter.
 */
export function ListRow(props) {
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

export function createListRow(item, index, render) {
  // Detach from parent hook registry so dynamic rows don't break call order.
  const prev = currentComponent;
  setCurrentComponent(null);

  const [getItem, setItem] = createSignal(item);
  const [getIndex, setIndex] = createSignal(index);
  const rowProps = { getItem, getIndex, render };
  const vnode = { type: ListRow, props: rowProps, children: undefined };

  setCurrentComponent(prev);

  return { setItem, setIndex, props: rowProps, vnode };
}

/**
 * Sync `bag.rows` for `items[start:end)` and return an array of vnodes.
 *
 * @param {{ rows: Map<unknown, object> }} bag
 * @param {unknown[]} items
 * @param {(item: unknown, index: number) => unknown} keyed
 * @param {unknown} render
 * @param {{
 *   start?: number,
 *   end?: number,
 *   mapRow?: (row: object, index: number, item: unknown) => unknown,
 * }} [options]
 */
export function syncKeyedRows(bag, items, keyed, render, options = {}) {
  const start = options.start ?? 0;
  const end = options.end ?? items.length;
  const mapRow = options.mapRow;
  const seen = new Set();
  const out = [];

  for (let index = start; index < end; index++) {
    const item = items[index];
    const key = keyed(item, index);
    seen.add(key);

    let row = bag.rows.get(key);
    if (!row) {
      row = createListRow(item, index, render);
      bag.rows.set(key, row);
    } else {
      if (!Object.is(row.props.getItem(), item)) {
        row.setItem(item);
      }
      if (!Object.is(row.props.getIndex(), index)) {
        row.setIndex(index);
      }
      if (row.props.render !== render) {
        row.props = {
          getItem: row.props.getItem,
          getIndex: row.props.getIndex,
          render,
        };
        row.vnode.props = row.props;
      }
    }

    row.vnode.key = key;
    row.props.key = key;

    out.push(mapRow ? mapRow(row, index, item) : row.vnode);
  }

  for (const key of [...bag.rows.keys()]) {
    if (!seen.has(key)) {
      bag.rows.delete(key);
    }
  }

  return out;
}
