import { JSDOM } from 'jsdom';

const dom = new JSDOM(
  '<!DOCTYPE html><html><body><div id="app"></div></body></html>'
);
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.Node = dom.window.Node;
globalThis.HTMLElement = dom.window.HTMLElement;

const { createComponent } = await import('../core/component/component.js');
const { jsx } = await import('../core/jsx-compiler-new/jsx-runtime.js');
const { render } = await import('../core/render/render.js');
const {
  FormProvider,
  Form,
  Field,
  ErrorMessage,
} = await import('../forms/index.js');

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

let submitted = null;

const App = createComponent(() =>
  jsx(FormProvider, {
    initialValues: { email: '' },
    validate: (v) => (!v.email ? { email: 'Required' } : {}),
    onSubmit: async (values) => {
      submitted = values.email;
    },
    children: jsx(
      Form,
      null,
      jsx(Field, { name: 'email', type: 'email', 'data-testid': 'email' }),
      jsx(ErrorMessage, { name: 'email', 'data-testid': 'err' }),
      jsx('button', { type: 'submit' }, 'Save')
    ),
  })
);

const root = document.getElementById('app');
render(App, root);

const input = root.querySelector('input[name="email"]');
assert(input, 'email input mounted');

// Submit empty → error visible after touch-all
const formEl = root.querySelector('form');
formEl.dispatchEvent(
  new dom.window.Event('submit', { bubbles: true, cancelable: true })
);

await new Promise((r) => setTimeout(r, 30));

assert(submitted === null, 'did not submit invalid');
const err = root.querySelector('span');
// ErrorMessage may render after validate
assert(
  root.textContent.includes('Required') || err?.textContent === 'Required',
  'shows Required error'
);

// Fill and submit
input.value = 'user@example.com';
input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
await new Promise((r) => setTimeout(r, 10));

formEl.dispatchEvent(
  new dom.window.Event('submit', { bubbles: true, cancelable: true })
);
await new Promise((r) => setTimeout(r, 40));

assert(submitted === 'user@example.com', 'submitted value');

console.log('forms-provider-smoke: PASS');
