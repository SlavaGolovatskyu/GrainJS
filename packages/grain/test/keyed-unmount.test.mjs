import { JSDOM } from 'jsdom';

const dom = new JSDOM(
  '<!DOCTYPE html><html><body><div id="app"></div></body></html>'
);
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node;
globalThis.HTMLElement = dom.window.HTMLElement;

const { createSignal, createEffect, onCleanup } = await import(
  '../signals/index.js'
);
const { createComponent } = await import('../core/component/component.js');
const { jsx } = await import('../core/jsx-compiler-new/jsx-runtime.js');
const { render } = await import('../core/render/render.js');

function makeTicker() {
  let alive = 0;
  let ticks = 0;
  const Widget = createComponent(() => {
    alive++;
    createEffect(() => {
      const id = setInterval(() => {
        ticks++;
      }, 10);
      onCleanup(() => {
        clearInterval(id);
        alive--;
      });
    });
    return jsx('span', null, 'widget');
  });
  return {
    Widget,
    get alive() {
      return alive;
    },
    get ticks() {
      return ticks;
    },
  };
}

async function wait(ms) {
  await new Promise((r) => setTimeout(r, ms));
}

/** Unkeyed component sibling of a keyed node must unmount in keyed patch. */
async function testDirectUnkeyedComponent() {
  const ticker = makeTicker();
  const Header = createComponent(() => jsx('header', null, 'header'));
  let setShow;
  const App = createComponent(() => {
    const [show, _setShow] = createSignal(true);
    setShow = _setShow;
    return jsx(
      'div',
      null,
      jsx(Header, { key: 'header' }),
      show() ? jsx(ticker.Widget, null) : null
    );
  });

  const root = document.createElement('div');
  document.body.appendChild(root);
  render(App, root);

  if (ticker.alive !== 1) {
    throw new Error(`expected alive=1 after mount, got ${ticker.alive}`);
  }

  setShow(false);
  await wait(50);

  if (ticker.alive !== 0 || ticker.ticks !== 0) {
    throw new Error(
      `leak: alive=${ticker.alive} ticks=${ticker.ticks} after removing unkeyed component`
    );
  }
  root.remove();
}

/** Unkeyed DOM wrapper containing a component must unmount nested hosts. */
async function testUnkeyedDomWrapper() {
  const ticker = makeTicker();
  const Header = createComponent(() => jsx('header', null, 'header'));
  let setShow;
  const App = createComponent(() => {
    const [show, _setShow] = createSignal(true);
    setShow = _setShow;
    return jsx(
      'div',
      null,
      jsx(Header, { key: 'header' }),
      show()
        ? jsx('div', { class: 'wrap' }, jsx(ticker.Widget, null))
        : null
    );
  });

  const root = document.createElement('div');
  document.body.appendChild(root);
  render(App, root);

  if (ticker.alive !== 1) {
    throw new Error(`expected alive=1 after mount, got ${ticker.alive}`);
  }

  setShow(false);
  await wait(50);

  if (ticker.alive !== 0 || ticker.ticks !== 0) {
    throw new Error(
      `leak: alive=${ticker.alive} ticks=${ticker.ticks} after removing DOM wrapper`
    );
  }
  root.remove();
}

await testDirectUnkeyedComponent();
await testUnkeyedDomWrapper();
console.log('keyed-unmount tests passed');
process.exit(0);
