import { JSDOM } from 'jsdom';

const dom = new JSDOM(
  '<!DOCTYPE html><html><body><div id="app"></div></body></html>'
);
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node;
globalThis.HTMLElement = dom.window.HTMLElement;

const { createSignal, For } = await import('../index.js');
const { createComponent } = await import('../core/component/component.js');
const { render } = await import('../core/render/render.js');
const {
  template,
  mountTemplate,
  bindTemplateText,
  bindTemplateProp,
  bindTemplateEvent,
  walkPath,
} = await import('../core/dom/template.js');

const proto = template(
  '<tr><td class="col-md-1"> </td><td class="col-md-4"><a> </a></td><td class="col-md-1"><a>x</a></td></tr>'
);

globalThis.__appRenderCount = 0;

const App = createComponent(() => {
  globalThis.__appRenderCount++;
  const [data, setData] = createSignal([]);
  const [selected, setSelected] = createSignal(null);
  globalThis.__setData = setData;
  globalThis.__setSelected = setSelected;

  return {
    type: 'table',
    props: { className: 'test-data' },
    children: [
      {
        type: 'tbody',
        props: {},
        children: [
          {
            type: For,
            props: {
              each: data,
              children: (row) =>
                mountTemplate(proto, (el) => {
                  bindTemplateProp(el, 'className', () =>
                    selected() === row.id ? 'danger' : ''
                  );
                  bindTemplateProp(el, 'data-id', () => String(row.id));
                  bindTemplateText(walkPath(el, [0, 0]), () => row.id);
                  bindTemplateEvent(walkPath(el, [1, 0]), 'onclick', () =>
                    setSelected(row.id)
                  );
                  bindTemplateText(walkPath(el, [1, 0, 0]), () => row.label);
                  bindTemplateEvent(walkPath(el, [2, 0]), 'onclick', () =>
                    setData((d) => d.filter((r) => r.id !== row.id))
                  );
                }),
            },
            children: [],
            isComponent: true,
          },
        ],
        isComponent: false,
      },
    ],
    isComponent: false,
  };
});

const root = document.getElementById('app');
render(App, root);

function rows() {
  return [...root.querySelectorAll('tbody tr')];
}

function ids() {
  return rows().map((tr) => tr.getAttribute('data-id'));
}

try {
  const renders0 = __appRenderCount;
  __setData([
    { id: 1, label: 'a' },
    { id: 2, label: 'b' },
    { id: 3, label: 'c' },
  ]);
  if (rows().length !== 3) throw new Error('create failed');
  if (__appRenderCount !== renders0) {
    throw new Error('App re-rendered on create');
  }
  if (rows()[0].querySelector('td').textContent !== '1') {
    throw new Error('id text hole broken');
  }
  if (rows()[0].querySelector('a').textContent !== 'a') {
    throw new Error('label text hole broken');
  }

  __setData((d) =>
    d.map((row, i) =>
      i === 0 ? { id: row.id, label: row.label + ' !!!' } : row
    )
  );
  if (rows()[0].querySelector('a').textContent !== 'a !!!') {
    throw new Error('update failed');
  }
  if (__appRenderCount !== renders0) {
    throw new Error('App re-rendered on update');
  }

  __setSelected(2);
  if (!rows()[1].classList.contains('danger')) {
    throw new Error('select failed');
  }

  __setData((d) => {
    const next = d.slice();
    const tmp = next[0];
    next[0] = next[2];
    next[2] = tmp;
    return next;
  });
  if (ids().join(',') !== '3,2,1') throw new Error('swap failed: ' + ids());

  rows()[1].querySelectorAll('a')[1].dispatchEvent(new dom.window.Event('click'));
  if (ids().join(',') !== '3,1') throw new Error('remove failed: ' + ids());

  __setData([]);
  if (rows().length !== 0) throw new Error('clear failed');

  // Regression: template bindings must dispose on clear (shared slots with dom.js).
  // Otherwise selected() keeps zombie subscribers and select becomes O(leaked rows).
  for (let i = 0; i < 20; i++) {
    __setData([
      { id: i * 3 + 1, label: 'a' },
      { id: i * 3 + 2, label: 'b' },
      { id: i * 3 + 3, label: 'c' },
    ]);
    __setData([]);
  }
  __setData([
    { id: 1, label: 'a' },
    { id: 2, label: 'b' },
    { id: 3, label: 'c' },
  ]);
  const t0 = performance.now();
  for (let i = 0; i < 50; i++) {
    __setSelected(i % 2 === 0 ? 1 : 2);
  }
  const selectMs = performance.now() - t0;
  if (selectMs > 50) {
    throw new Error(`select too slow after churn (${selectMs.toFixed(1)}ms) — binding leak?`);
  }

  console.log('PASS template+For smoke');
} catch (e) {
  console.error('FAIL', e.message);
  process.exit(1);
}
