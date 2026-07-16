import { JSDOM } from 'jsdom';

const dom = new JSDOM(
  '<!DOCTYPE html><html><body><div id="app"></div></body></html>',
  { pretendToBeVisual: true }
);
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.ResizeObserver =
  dom.window.ResizeObserver ||
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

const { createSignal } = await import('../signals/index.js');
const { createComponent } = await import('../core/component/component.js');
const { jsx } = await import('../core/jsx-compiler-new/jsx-runtime.js');
const { render } = await import('../core/render/render.js');
const { VirtualList } = await import('../core/flow/VirtualList.js');

function flush() {
  return new Promise((r) => setTimeout(r, 0));
}

function rowHosts(root) {
  return [...root.querySelectorAll('[data-index]')];
}

function indices(root) {
  return rowHosts(root).map((el) => Number(el.getAttribute('data-index')));
}

async function testEmptyFallback() {
  const App = createComponent(() =>
    jsx(VirtualList, {
      each: [],
      itemHeight: 20,
      height: 100,
      fallback: jsx('p', { 'data-empty': '' }, 'Empty'),
      children: (item) => jsx('span', null, String(item)),
    })
  );

  const root = document.createElement('div');
  document.body.appendChild(root);
  render(App, root);

  if (!root.querySelector('[data-empty]')) {
    throw new Error('expected fallback for empty each');
  }
  if (root.querySelector('[data-grainlet-virtual-list]')) {
    throw new Error('empty list should not render scroller');
  }
  root.remove();
}

async function testWindowedMountCount() {
  const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, label: `n${i}` }));
  const App = createComponent(() =>
    jsx(VirtualList, {
      each: items,
      itemHeight: 20,
      height: 100,
      overscan: 2,
      children: (item) => jsx('span', null, item.label),
    })
  );

  const root = document.createElement('div');
  document.body.appendChild(root);
  render(App, root);
  await flush();

  const hosts = rowHosts(root);
  if (hosts.length === 0) {
    throw new Error('expected some visible rows');
  }
  if (hosts.length >= 1000) {
    throw new Error(`expected windowed rows, mounted ${hosts.length}`);
  }
  // height 100 / 20 = 5 visible + overscan 2*2 = ~9
  if (hosts.length > 40) {
    throw new Error(`too many rows mounted: ${hosts.length}`);
  }

  const idxs = indices(root);
  if (idxs[0] !== 0) {
    throw new Error(`expected start at 0, got ${idxs[0]}`);
  }
  root.remove();
}

async function testScrollShiftsWindow() {
  const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, label: `n${i}` }));
  const App = createComponent(() =>
    jsx(VirtualList, {
      each: items,
      itemHeight: 20,
      height: 100,
      overscan: 1,
      children: (item) => jsx('span', null, item.label),
    })
  );

  const root = document.createElement('div');
  document.body.appendChild(root);
  render(App, root);
  await flush();

  const before = indices(root);
  const scroller = root.querySelector('[data-grainlet-virtual-list]');
  if (!scroller) throw new Error('missing scroller');

  scroller.scrollTop = 400; // ~ index 20
  scroller.dispatchEvent(new dom.window.Event('scroll', { bubbles: true }));
  await flush();

  const after = indices(root);
  if (after.length === 0) {
    throw new Error('expected rows after scroll');
  }
  if (after[0] <= before[0]) {
    throw new Error(
      `expected window to move down (before=${before[0]}, after=${after[0]})`
    );
  }
  if (after[0] < 15 || after[0] > 25) {
    throw new Error(`expected start near 20, got ${after[0]}`);
  }
  root.remove();
}

async function testIntraRangeScrollDoesNotRemount() {
  let renders = 0;
  function Row(props) {
    renders += 1;
    return jsx('span', { 'data-row': props.id }, String(props.id));
  }

  const items = Array.from({ length: 100 }, (_, i) => ({ id: i }));
  const App = createComponent(() =>
    jsx(VirtualList, {
      each: items,
      itemHeight: 20,
      height: 100,
      overscan: 2,
      children: (item) => jsx(Row, { id: item.id }),
    })
  );

  const root = document.createElement('div');
  document.body.appendChild(root);
  render(App, root);
  await flush();

  const scroller = root.querySelector('[data-grainlet-virtual-list]');
  // Move into a plateau where start stays fixed (scroll 0–59 → start 0).
  scroller.scrollTop = 25;
  scroller.dispatchEvent(new dom.window.Event('scroll', { bubbles: true }));
  await flush();

  const afterWindowMove = renders;
  if (afterWindowMove < 1) throw new Error('expected rows to mount');

  scroller.scrollTop = 50;
  scroller.dispatchEvent(new dom.window.Event('scroll', { bubbles: true }));
  await flush();

  if (renders !== afterWindowMove) {
    throw new Error(
      `intra-range scroll re-rendered rows (before=${afterWindowMove}, after=${renders})`
    );
  }

  scroller.scrollTop = 200; // crosses into a new window
  scroller.dispatchEvent(new dom.window.Event('scroll', { bubbles: true }));
  await flush();

  if (renders <= afterWindowMove) {
    throw new Error('expected new rows to mount after crossing the window');
  }
  root.remove();
}

async function testHorizontalScrollShiftsWindow() {
  const items = Array.from({ length: 1000 }, (_, i) => ({ id: i, label: `n${i}` }));
  const App = createComponent(() =>
    jsx(VirtualList, {
      orientation: 'horizontal',
      each: items,
      itemWidth: 50,
      width: 200,
      height: 80,
      overscan: 1,
      children: (item) => jsx('span', null, item.label),
    })
  );

  const root = document.createElement('div');
  document.body.appendChild(root);
  render(App, root);
  await flush();

  const before = indices(root);
  const scroller = root.querySelector('[data-grainlet-virtual-list]');
  if (!scroller) throw new Error('missing horizontal scroller');
  if (scroller.getAttribute('data-orientation') !== 'horizontal') {
    throw new Error('expected data-orientation=horizontal');
  }

  const hosts = rowHosts(root);
  if (hosts.length === 0 || hosts.length >= 1000) {
    throw new Error(`expected windowed horizontal rows, got ${hosts.length}`);
  }

  scroller.scrollLeft = 500; // ~ index 10
  scroller.dispatchEvent(new dom.window.Event('scroll', { bubbles: true }));
  await flush();

  const after = indices(root);
  if (after.length === 0) {
    throw new Error('expected rows after horizontal scroll');
  }
  if (after[0] <= before[0]) {
    throw new Error(
      `expected window to move right (before=${before[0]}, after=${after[0]})`
    );
  }
  if (after[0] < 6 || after[0] > 14) {
    throw new Error(`expected start near 10, got ${after[0]}`);
  }
  root.remove();
}

async function testDebounceTimeThrottlesWindowUpdates() {
  let renders = 0;
  function Row(props) {
    renders += 1;
    return jsx('span', null, String(props.id));
  }

  const items = Array.from({ length: 200 }, (_, i) => ({ id: i }));
  const App = createComponent(() =>
    jsx(VirtualList, {
      each: items,
      itemHeight: 20,
      height: 100,
      overscan: 1,
      debounceTime: 50,
      children: (item) => jsx(Row, { id: item.id }),
    })
  );

  const root = document.createElement('div');
  document.body.appendChild(root);
  render(App, root);
  await flush();

  const scroller = root.querySelector('[data-grainlet-virtual-list]');
  const afterMount = renders;

  // Burst of scroll events within the debounce window — should not apply all.
  for (const top of [80, 160, 240, 320]) {
    scroller.scrollTop = top;
    scroller.dispatchEvent(new dom.window.Event('scroll', { bubbles: true }));
  }
  await flush();

  const mid = renders;
  // Allow trailing timer to flush the last scroll.
  await new Promise((r) => setTimeout(r, 80));
  await flush();

  if (mid - afterMount > 20) {
    throw new Error(
      `debounceTime should throttle mid-burst updates (mount=${afterMount}, mid=${mid})`
    );
  }
  if (renders <= afterMount) {
    throw new Error('expected trailing debounce to apply at least one window update');
  }
  root.remove();
}

await testEmptyFallback();
await testWindowedMountCount();
await testScrollShiftsWindow();
await testIntraRangeScrollDoesNotRemount();
await testDebounceTimeThrottlesWindowUpdates();
await testHorizontalScrollShiftsWindow();
console.log('virtual-list tests passed');
process.exit(0);
