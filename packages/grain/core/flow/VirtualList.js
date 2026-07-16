import { createSignal } from '../../signals/index.js';
import { isServer } from '../../signals/env.js';
import {
  currentComponent,
  setCurrentComponent,
} from '../../signals/reactive-context/reactive-context.js';
import { jsx } from '../jsx-compiler-new/jsx-runtime.js';
import { readProp } from './resolve.js';

function defaultKeyOf(item, index) {
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

function VirtualRow(props) {
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
  const prev = currentComponent;
  setCurrentComponent(null);

  const [getItem, setItem] = createSignal(item);
  const [getIndex, setIndex] = createSignal(index);
  const rowProps = { getItem, getIndex, render };
  const vnode = { type: VirtualRow, props: rowProps, children: undefined };

  setCurrentComponent(prev);

  return { setItem, setIndex, props: rowProps, vnode };
}

function resolveKeyed(keyedProp) {
  if (typeof keyedProp === 'function') return keyedProp;
  if (keyedProp === false) return (_item, index) => index;
  return defaultKeyOf;
}

function resolveOrientation(value) {
  const raw = readProp(value);
  if (raw === 'horizontal' || raw === 'x') return 'horizontal';
  return 'vertical';
}

function buildRows(bag, items, start, end, keyed, render, horizontal) {
  const seen = new Set();
  const out = [];
  const mainSize = bag.itemSize;

  for (let index = start; index < end; index++) {
    const item = items[index];
    const key = keyed(item, index);
    seen.add(key);

    let row = bag.rows.get(key);
    if (!row) {
      row = createRow(item, index, render);
      bag.rows.set(key, row);
    } else {
      // Avoid notifying row effects when the window only slides over the same item.
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

    const slotStyle = horizontal
      ? {
          width: `${mainSize}px`,
          flex: `0 0 ${mainSize}px`,
          height: '100%',
          boxSizing: 'border-box',
        }
      : {
          height: `${mainSize}px`,
          boxSizing: 'border-box',
        };

    out.push(
      jsx(
        'div',
        {
          key,
          'data-index': index,
          style: slotStyle,
        },
        row.vnode
      )
    );
  }

  for (const key of [...bag.rows.keys()]) {
    if (!seen.has(key)) {
      bag.rows.delete(key);
    }
  }

  return out;
}

function cssSize(value) {
  if (value == null || value === false) return undefined;
  return typeof value === 'number' ? `${value}px` : String(value);
}

function mergeScrollerStyle(horizontal, heightProp, widthProp, styleProp) {
  const base = {
    overflow: 'auto',
    position: 'relative',
    WebkitOverflowScrolling: 'touch',
  };

  if (horizontal) {
    const w = cssSize(widthProp);
    const h = cssSize(heightProp);
    if (w != null) base.width = w;
    if (h != null) base.height = h;
  } else {
    const h = cssSize(heightProp);
    const w = cssSize(widthProp);
    if (h != null) base.height = h;
    if (w != null) base.width = w;
  }

  if (styleProp == null) return base;
  if (typeof styleProp === 'string') {
    return (
      Object.keys(base)
        .map((k) => {
          const cssKey = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
          return `${cssKey}:${base[k]}`;
        })
        .join(';') + (styleProp ? `;${styleProp}` : '')
    );
  }
  return { ...base, ...styleProp };
}

function visibleRange(scrollOffset, viewportSize, itemSize, overscan, count) {
  if (itemSize <= 0 || count === 0) {
    return { start: 0, end: 0 };
  }
  const vs = Math.max(viewportSize, 0);
  // Fixed window length from start — avoids end flickering on every pixel from
  // ceil((scroll + viewport) / itemSize), which caused constant slice rebuilds.
  const start = Math.max(0, Math.floor(scrollOffset / itemSize) - overscan);
  const visibleCount = Math.max(1, Math.ceil(vs / itemSize));
  const end = Math.min(count, start + visibleCount + overscan * 2);
  return { start, end };
}

function applyScrollOffset(bag, setScrollOffset, scroll) {
  const next = visibleRange(
    scroll,
    bag.viewportSize,
    bag.itemSize,
    bag.overscan,
    bag.count
  );
  if (next.start === bag.range.start && next.end === bag.range.end) {
    return;
  }
  setScrollOffset(scroll);
}

/** Leading + trailing throttle so the window still tracks during fast flings. */
function scheduleScrollApply(bag, setScrollOffset, scroll) {
  bag.pendingScroll = scroll;
  bag.setScrollOffset = setScrollOffset;
  const wait = bag.debounceTime | 0;
  if (wait <= 0) {
    applyScrollOffset(bag, setScrollOffset, scroll);
    return;
  }

  const now = Date.now();
  const elapsed = now - (bag.lastScrollApply || 0);
  if (elapsed >= wait) {
    bag.lastScrollApply = now;
    if (bag.scrollTimer != null) {
      clearTimeout(bag.scrollTimer);
      bag.scrollTimer = null;
    }
    applyScrollOffset(bag, setScrollOffset, scroll);
    return;
  }

  if (bag.scrollTimer == null) {
    bag.scrollTimer = setTimeout(() => {
      bag.scrollTimer = null;
      bag.lastScrollApply = Date.now();
      applyScrollOffset(bag, bag.setScrollOffset, bag.pendingScroll);
    }, wait - elapsed);
  }
}

/**
 * Windowed list: only mounts items in the viewport (+ overscan).
 * Fixed main-axis size required (`itemHeight` vertical / `itemWidth` horizontal).
 *
 *   <VirtualList each={items()} itemHeight={48} height={400}>
 *     {(item) => <div>{item.label}</div>}
 *   </VirtualList>
 *
 *   <VirtualList orientation="horizontal" each={items()} itemWidth={120} width={480} height={80}>
 *     {(item) => <div>{item.label}</div>}
 *   </VirtualList>
 */
export function VirtualList(props) {
  const [getBag] = createSignal({
    rows: new Map(),
    ro: null,
    el: null,
    cleanupRegistered: false,
    itemSize: 0,
    overscan: 5,
    count: 0,
    viewportSize: 0,
    range: { start: 0, end: 0 },
    horizontal: false,
    debounceTime: 0,
    pendingScroll: 0,
    lastScrollApply: 0,
    scrollTimer: null,
    setScrollOffset: null,
    onScroll: null,
  });
  const bag = getBag();

  const [scrollOffset, setScrollOffset] = createSignal(0);
  const [measuredMain, setMeasuredMain] = createSignal(0);

  if (!bag.cleanupRegistered) {
    bag.cleanupRegistered = true;
    // Must be component-unmount cleanup — effect onCleanup runs before every
    // re-render and would wipe the keyed row bag (forcing full row updates).
    const owner = currentComponent;
    if (owner) {
      if (!owner._cleanups) owner._cleanups = [];
      owner._cleanups.push(() => {
        if (bag.scrollTimer != null) {
          clearTimeout(bag.scrollTimer);
          bag.scrollTimer = null;
        }
        bag.ro?.disconnect();
        bag.ro = null;
        bag.el = null;
        bag.rows.clear();
      });
    }
  }

  const list = readProp(props.each);
  const items = Array.isArray(list) ? list : list == null ? [] : [list];
  const count = items.length;

  if (count === 0) {
    bag.rows.clear();
    return props.fallback ?? null;
  }

  const horizontal = resolveOrientation(props.orientation) === 'horizontal';
  bag.horizontal = horizontal;

  const itemSizeRaw = horizontal
    ? readProp(props.itemWidth ?? props.itemHeight)
    : readProp(props.itemHeight ?? props.itemWidth);
  const itemSize = Number(itemSizeRaw);
  if (!Number.isFinite(itemSize) || itemSize <= 0) {
    throw new TypeError(
      horizontal
        ? 'VirtualList (horizontal) requires a positive itemWidth (or itemHeight)'
        : 'VirtualList requires a positive itemHeight'
    );
  }
  const overscan = Number(readProp(props.overscan) ?? 5);
  const debounceTime = Math.max(0, Number(readProp(props.debounceTime) ?? 0) || 0);
  const heightProp = readProp(props.height);
  const widthProp = readProp(props.width);
  const keyed = resolveKeyed(props.keyed);
  const render = props.children;

  const viewportProp = horizontal ? widthProp : heightProp;
  const viewportSize =
    viewportProp != null && viewportProp !== false
      ? Number(viewportProp) || 0
      : measuredMain();

  bag.itemSize = itemSize;
  bag.overscan = overscan;
  bag.count = count;
  bag.viewportSize = viewportSize;
  bag.debounceTime = debounceTime;
  bag.setScrollOffset = setScrollOffset;

  let range;
  if (isServer()) {
    const vs =
      viewportProp != null && viewportProp !== false
        ? Number(viewportProp) || 0
        : 0;
    range = visibleRange(0, vs, itemSize, overscan, count);
  } else {
    range = visibleRange(
      scrollOffset(),
      viewportSize,
      itemSize,
      overscan,
      count
    );
  }
  bag.range = range;

  const rows = buildRows(
    bag,
    items,
    range.start,
    range.end,
    keyed,
    render,
    horizontal
  );
  const totalMain = count * itemSize;
  const offset = range.start * itemSize;

  const bindScroller = (el) => {
    if (!el) {
      bag.el = null;
      return;
    }
    bag.el = el;
    if (viewportProp == null || viewportProp === false) {
      setMeasuredMain(horizontal ? el.clientWidth : el.clientHeight);
      if (!bag.ro && typeof ResizeObserver !== 'undefined') {
        bag.ro = new ResizeObserver(() => {
          if (!bag.el) return;
          setMeasuredMain(
            bag.horizontal ? bag.el.clientWidth : bag.el.clientHeight
          );
        });
        bag.ro.observe(el);
      }
    }
  };

  const scrollerProps = {
    ref: bindScroller,
    class: props.class ?? props.className,
    style: mergeScrollerStyle(horizontal, heightProp, widthProp, props.style),
    'data-grainlet-virtual-list': '',
    'data-orientation': horizontal ? 'horizontal' : 'vertical',
  };

  if (!isServer()) {
    // Native scroll moves pixels; only rebuild when the index window changes.
    // debounceTime throttles how often we evaluate/apply that window update.
    if (!bag.onScroll) {
      bag.onScroll = (event) => {
        const target = event.currentTarget;
        const scroll = bag.horizontal ? target.scrollLeft : target.scrollTop;
        scheduleScrollApply(bag, bag.setScrollOffset, scroll);
      };
    }
    scrollerProps.onScroll = bag.onScroll;
  }

  const spacerStyle = horizontal
    ? {
        width: `${totalMain}px`,
        height: '100%',
        position: 'relative',
      }
    : {
        height: `${totalMain}px`,
        position: 'relative',
        width: '100%',
      };

  const windowStyle = horizontal
    ? {
        position: 'absolute',
        top: '0',
        left: '0',
        bottom: '0',
        display: 'flex',
        flexDirection: 'row',
        transform: `translateX(${offset}px)`,
      }
    : {
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        transform: `translateY(${offset}px)`,
      };

  return jsx(
    'div',
    scrollerProps,
    jsx(
      'div',
      {
        'data-grainlet-virtual-spacer': '',
        style: spacerStyle,
      },
      jsx(
        'div',
        {
          'data-grainlet-virtual-window': '',
          style: windowStyle,
        },
        ...rows
      )
    )
  );
}
