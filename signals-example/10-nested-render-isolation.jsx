import { createSignal, createComponent, render } from '../index.js';

/**
 * Each factory closes over its own render counter. The number only increases when
 * that component's ComponentFn runs (its render effect). Use this to verify that
 * updating one leaf does not re-run ancestors or sibling branches.
 */

function withRenderCount(name, ComponentFn) {
  let renders = 0;
  return createComponent((props) => {
    renders += 1;
    return ComponentFn(props, renders, name);
  });
}

const StaticPanel = withRenderCount('StaticPanel', (_props, renders) => (
  <div class="node static">
    <div class="node-head">
      <strong>StaticPanel</strong>
      <span class="badge">renders: {renders}</span>
    </div>
    <p class="hint">Owns no interactive state. This badge must stay put when leaves update.</p>
  </div>
));

const DeepLeaf = withRenderCount('DeepLeaf', (props, renders) => {
  const [count, setCount] = createSignal(0);
  return (
    <div class="node leaf">
      <div class="node-head">
        <strong>{props.label || 'DeepLeaf'}</strong>
        <span class="badge">renders: {renders}</span>
      </div>
      <div class="value">{count()}</div>
      <button type="button" onclick={() => setCount((c) => c + 1)}>
        Increment {props.label || 'DeepLeaf'}
      </button>
    </div>
  );
});

const NestedC = withRenderCount('NestedC', (_props, renders) => (
  <div class="node">
    <div class="node-head">
      <strong>NestedC</strong>
      <span class="badge">renders: {renders}</span>
    </div>
    <DeepLeaf label="Leaf-C" />
  </div>
));

const NestedB = withRenderCount('NestedB', (_props, renders) => (
  <div class="node">
    <div class="node-head">
      <strong>NestedB</strong>
      <span class="badge">renders: {renders}</span>
    </div>
    <NestedC />
  </div>
));

const NestedA = withRenderCount('NestedA', (_props, renders) => (
  <div class="node">
    <div class="node-head">
      <strong>NestedA</strong>
      <span class="badge">renders: {renders}</span>
    </div>
    <NestedB />
  </div>
));

const LeftLeaf = withRenderCount('LeftLeaf', (_props, renders) => {
  const [count, setCount] = createSignal(0);
  return (
    <div class="node leaf">
      <div class="node-head">
        <strong>LeftLeaf</strong>
        <span class="badge">renders: {renders}</span>
      </div>
      <div class="value">{count()}</div>
      <button type="button" onclick={() => setCount((c) => c + 1)}>
        Increment LeftLeaf
      </button>
    </div>
  );
});

const LeftMid = withRenderCount('LeftMid', (_props, renders) => (
  <div class="node">
    <div class="node-head">
      <strong>LeftMid</strong>
      <span class="badge">renders: {renders}</span>
    </div>
    <LeftLeaf />
  </div>
));

const LeftTrunk = withRenderCount('LeftTrunk', (_props, renders) => (
  <div class="node trunk left">
    <div class="node-head">
      <strong>LeftTrunk</strong>
      <span class="badge">renders: {renders}</span>
    </div>
    <LeftMid />
  </div>
));

const RightLeaf = withRenderCount('RightLeaf', (_props, renders) => {
  const [count, setCount] = createSignal(10);
  return (
    <div class="node leaf">
      <div class="node-head">
        <strong>RightLeaf</strong>
        <span class="badge">renders: {renders}</span>
      </div>
      <div class="value">{count()}</div>
      <button type="button" onclick={() => setCount((c) => c + 1)}>
        Increment RightLeaf
      </button>
    </div>
  );
});

const RightMid = withRenderCount('RightMid', (_props, renders) => (
  <div class="node">
    <div class="node-head">
      <strong>RightMid</strong>
      <span class="badge">renders: {renders}</span>
    </div>
    <RightLeaf />
  </div>
));

const RightTrunk = withRenderCount('RightTrunk', (_props, renders) => (
  <div class="node trunk right">
    <div class="node-head">
      <strong>RightTrunk</strong>
      <span class="badge">renders: {renders}</span>
    </div>
    <RightMid />
  </div>
));

const App = withRenderCount('App', (_props, renders) => (
  <div class="app">
    <div class="node-head app-head">
      <strong>App</strong>
      <span class="badge">renders: {renders}</span>
    </div>
    <p class="legend">
      Increment a leaf. Only that leaf's renders badge should increase.
      Ancestors (App, trunks, mids, Nested*) and the other branch should stay unchanged.
    </p>
    <div class="grid">
      <LeftTrunk />
      <RightTrunk />
      <div class="deep-column">
        <NestedA />
        <StaticPanel />
      </div>
    </div>
  </div>
));

render(App, document.getElementById('app'));
