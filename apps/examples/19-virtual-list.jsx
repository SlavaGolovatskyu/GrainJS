import { createSignal, render, VirtualList, Show } from 'grainlet';

const TOTAL = 500;

/** Stable remote photos — same seed ⇒ same image if the row remounts. */
function photoUrl(id, w, h) {
  return `https://picsum.photos/seed/grain-vl-${id}/${w}/${h}`;
}

/**
 * Closed-over render counter. If scroll thrash-remounts a row, `item r` climbs
 * and the photo flashes as it reloads.
 */
function createItem(id) {
  let renders = 0;
  let imgLoads = 0;

  function Item(props) {
    renders += 1;
    const row = props.row;
    const horizontal = props.horizontal;

    return (
      <div
        class={`card flash-${renders % 2} ${horizontal ? 'card--h' : 'card--v'}`}
      >
        <img
          class="card__img"
          src={row.src}
          alt=""
          width={horizontal ? 140 : 72}
          height={horizontal ? 96 : 72}
          loading="lazy"
          decoding="async"
          onLoad={() => {
            imgLoads += 1;
            const el = document.querySelector(`[data-loads="${row.id}"]`);
            if (el) el.textContent = String(imgLoads);
          }}
        />
        <div class="card__body">
          <div class="card__title">{row.label}</div>
          <div class="card__meta">
            <span class="badge">item r:{renders}</span>
            <span class="badge badge--img">
              img loads:<span data-loads={row.id}>{imgLoads}</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return {
    id,
    label: `Photo ${id + 1}`,
    src: photoUrl(id, 160, 120),
    Item,
  };
}

const items = Array.from({ length: TOTAL }, (_, i) => createItem(i));

function VirtualListDemo() {
  const [orientation, setOrientation] = createSignal('vertical');

  return (
    <div class="demo">
      <h1>VirtualList — photo rows</h1>
      <p class="lead">
        Real images from picsum (seeded per id). Scroll hard and watch badges:
        for a row that stays on screen, <code>item r</code> and{' '}
        <code>img loads</code> should stay put. If they climb, the row is
        remounting / re-rendering badly.
      </p>

      <div class="toolbar">
        <button
          type="button"
          class={orientation() === 'vertical' ? 'active' : ''}
          onClick={() => setOrientation('vertical')}
        >
          Vertical
        </button>
        <button
          type="button"
          class={orientation() === 'horizontal' ? 'active' : ''}
          onClick={() => setOrientation('horizontal')}
        >
          Horizontal
        </button>
      </div>

      <div class="stats">
        <span class="badge badge--scroll">
          scroll events: <span id="scroll-count">0</span>
        </span>
        <span class="badge badge--window">
          window updates: <span id="window-count">0</span>
        </span>
        <span class="meta">
          visible: <span id="range-label">—</span> · {TOTAL} photos
        </span>
      </div>

      <Show when={orientation() === 'vertical'}>
        <VirtualList
          orientation="vertical"
          each={items}
          itemHeight={88}
          height={520}
          overscan={4}
          debounceTime={32}
          class="list list--v"
        >
          {(item) => <item.Item row={item} horizontal={false} />}
        </VirtualList>
      </Show>

      <Show when={orientation() === 'horizontal'}>
        <VirtualList
          orientation="horizontal"
          each={items}
          itemWidth={168}
          width={640}
          height={148}
          overscan={3}
          debounceTime={32}
          class="list list--h"
        >
          {(item) => <item.Item row={item} horizontal={true} />}
        </VirtualList>
      </Show>
    </div>
  );
}

render(VirtualListDemo, document.getElementById('app'));

function attachScrollProbe() {
  const scroller = document.querySelector('[data-grainlet-virtual-list]');
  const scrollCountEl = document.getElementById('scroll-count');
  const windowCountEl = document.getElementById('window-count');
  const rangeEl = document.getElementById('range-label');
  if (!scroller || !scrollCountEl || !windowCountEl || !rangeEl) return;
  if (scroller.dataset.probe === '1') return;
  scroller.dataset.probe = '1';

  let scrolls = 0;
  let windowUpdates = 0;
  let lastRange = '';

  const report = () => {
    scrolls += 1;
    scrollCountEl.textContent = String(scrolls);

    const nodes = scroller.querySelectorAll('[data-index]');
    if (!nodes.length) {
      rangeEl.textContent = '—';
      return;
    }
    const start = nodes[0].getAttribute('data-index');
    const end = nodes[nodes.length - 1].getAttribute('data-index');
    const label = `[${start}…${end}]`;
    rangeEl.textContent = label;
    if (label !== lastRange) {
      lastRange = label;
      windowUpdates += 1;
      windowCountEl.textContent = String(windowUpdates);
    }
  };

  scroller.addEventListener('scroll', report, { passive: true });
  report();
}

queueMicrotask(attachScrollProbe);
// Re-attach when switching orientation (Show remounts the list).
document.addEventListener('click', () => queueMicrotask(attachScrollProbe));
