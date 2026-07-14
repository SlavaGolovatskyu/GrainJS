import { createSignal, render } from 'grain';

/**
 * Each wrapper closes over its own render counter. The number only increases when
 * that component function runs (its render effect). Press Increment on any
 * node: with accessor bindings, that node's value updates and renders should stay
 * at 1 (unless something eagerly reads the signal during the component function).
 */

function withRenderCount(name, ComponentFn) {
  let renders = 0;
  return function Wrapped(props) {
    renders += 1;
    return ComponentFn(props, renders, name);
  };
}

/** Local counter + Increment so every tier can be poked, not only leaves. */
function usePulse(label) {
  const [n, setN] = createSignal(0);
  return {
    value: (
      <div class="pulse">
        <span class="value">{n()}</span>
        <button type="button" onclick={() => setN((c) => c + 1)}>
          Increment {label}
        </button>
      </div>
    ),
  };
}

const StaticPanel = withRenderCount('StaticPanel', (_props, renders) => (
  <div class="node static">
    <div class="node-head">
      <strong>StaticPanel</strong>
      <span class="badge">renders: {renders}</span>
    </div>
    <p class="hint">No local Increment — should never bump when others update.</p>
  </div>
));

const DeepLeaf = withRenderCount('DeepLeaf', (props, renders) => {
  const label = props.label || 'DeepLeaf';
  const { value } = usePulse(label);
  return (
    <div class="node leaf">
      <div class="node-head">
        <strong>{label}</strong>
        <span class="badge">renders: {renders}</span>
      </div>
      {value}
    </div>
  );
});

const NestedC = withRenderCount('NestedC', (_props, renders) => {
  const { value } = usePulse('NestedC');
  return (
    <div class="node">
      <div class="node-head">
        <strong>NestedC</strong>
        <span class="badge">renders: {renders}</span>
      </div>
      {value}
      <DeepLeaf label="Leaf-C" />
    </div>
  );
});

const NestedB = withRenderCount('NestedB', (_props, renders) => {
  const { value } = usePulse('NestedB');
  return (
    <div class="node">
      <div class="node-head">
        <strong>NestedB</strong>
        <span class="badge">renders: {renders}</span>
      </div>
      {value}
      <NestedC />
    </div>
  );
});

const NestedA = withRenderCount('NestedA', (_props, renders) => {
  const { value } = usePulse('NestedA');
  return (
    <div class="node">
      <div class="node-head">
        <strong>NestedA</strong>
        <span class="badge">renders: {renders}</span>
      </div>
      {value}
      <NestedB />
    </div>
  );
});

const LeftLeaf = withRenderCount('LeftLeaf', (_props, renders) => {
  const { value } = usePulse('LeftLeaf');
  return (
    <div class="node leaf">
      <div class="node-head">
        <strong>LeftLeaf</strong>
        <span class="badge">renders: {renders}</span>
      </div>
      {value}
    </div>
  );
});

const LeftMid = withRenderCount('LeftMid', (_props, renders) => {
  const { value } = usePulse('LeftMid');
  return (
    <div class="node">
      <div class="node-head">
        <strong>LeftMid</strong>
        <span class="badge">renders: {renders}</span>
      </div>
      {value}
      <LeftLeaf />
    </div>
  );
});

const LeftTrunk = withRenderCount('LeftTrunk', (_props, renders) => {
  const { value } = usePulse('LeftTrunk');
  return (
    <div class="node trunk left">
      <div class="node-head">
        <strong>LeftTrunk</strong>
        <span class="badge">renders: {renders}</span>
      </div>
      {value}
      <LeftMid />
    </div>
  );
});

const RightLeaf = withRenderCount('RightLeaf', (_props, renders) => {
  const { value } = usePulse('RightLeaf');
  return (
    <div class="node leaf">
      <div class="node-head">
        <strong>RightLeaf</strong>
        <span class="badge">renders: {renders}</span>
      </div>
      {value}
    </div>
  );
});

const RightMid = withRenderCount('RightMid', (_props, renders) => {
  const { value } = usePulse('RightMid');
  return (
    <div class="node">
      <div class="node-head">
        <strong>RightMid</strong>
        <span class="badge">renders: {renders}</span>
      </div>
      {value}
      <RightLeaf />
    </div>
  );
});

const RightTrunk = withRenderCount('RightTrunk', (_props, renders) => {
  const { value } = usePulse('RightTrunk');
  return (
    <div class="node trunk right">
      <div class="node-head">
        <strong>RightTrunk</strong>
        <span class="badge">renders: {renders}</span>
      </div>
      {value}
      <RightMid />
    </div>
  );
});

const App = withRenderCount('App', (_props, renders) => {
  const { value } = usePulse('App');
  return (
    <div class="app">
      <div class="node-head app-head">
        <strong>App</strong>
        <span class="badge">renders: {renders}</span>
      </div>
      {value}
      <p class="legend">
        Hit Increment on <em>any</em> node. With <code>{'{n()}'}</code> rewritten to an
        accessor, that node&apos;s value should change while its <code>renders</code> badge
        stays at 1 — and no other badges should move.
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
  );
});

render(App, document.getElementById('app'));
