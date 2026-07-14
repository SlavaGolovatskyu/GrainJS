import { createSignal } from 'grain';

function Badge(props) {
  return <span class="badge">{props.label}</span>;
}

export function CounterApp() {
  const [count, setCount] = createSignal(0);

  return (
    <div class="ssr-demo">
      <h1>SSR + hydrate</h1>
      <p>
        Count: <strong class="count">{count()}</strong>
      </p>
      <Badge label="nested child" />
      <div class="actions">
        <button type="button" onclick={() => setCount((c) => c + 1)}>
          Increment
        </button>
        <button type="button" onclick={() => setCount(0)}>
          Reset
        </button>
      </div>
      <p class="hint">
        View page source: the count markup is from the server. Increment proves
        hydration attached live signal bindings.
      </p>
    </div>
  );
}
