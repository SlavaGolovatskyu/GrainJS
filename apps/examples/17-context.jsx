import {
  createSignal,
  createContext,
  useContext,
  render,
} from 'grainlet';

const CounterContext = createContext();

function useCounter() {
  const value = useContext(CounterContext);
  if (!value) {
    throw new Error('Missing CounterProvider');
  }
  return value;
}

function CounterProvider(props) {
  const [count, setCount] = createSignal(props.count ?? 0);
  return (
    <CounterContext.Provider value={[count, setCount]}>
      {props.children}
    </CounterContext.Provider>
  );
}

function Intermediate(props) {
  // No count props — context skips this layer.
  return <div class="intermediate">{props.children}</div>;
}

function Display() {
  const [count] = useCounter();
  return <p class="count">Count: {count()}</p>;
}

function Controls() {
  const [, setCount] = useCounter();
  return (
    <div class="toolbar">
      <button type="button" onClick={() => setCount((n) => n - 1)}>
        −
      </button>
      <button type="button" onClick={() => setCount((n) => n + 1)}>
        +
      </button>
      <button type="button" onClick={() => setCount(0)}>
        Reset
      </button>
    </div>
  );
}

function NestedOverride() {
  const [count, setCount] = createSignal(100);
  return (
    <section class="panel nested">
      <h2>Nested Provider (nearest wins)</h2>
      <CounterContext.Provider value={[count, setCount]}>
        <p class="hint">This subtree sees count starting at 100.</p>
        <Display />
        <Controls />
      </CounterContext.Provider>
    </section>
  );
}

function Demo() {
  return (
    <div class="demo">
      <h1>Context</h1>
      <p class="lead">
        <code>createContext</code> + <code>useContext</code> share state without
        prop drilling. Intermediate components do not take a count prop.
      </p>

      <CounterProvider count={1}>
        <section class="panel">
          <h2>Shared counter</h2>
          <Intermediate>
            <Display />
            <Controls />
          </Intermediate>
        </section>
        <NestedOverride />
      </CounterProvider>
    </div>
  );
}

render(Demo, document.getElementById('app'));
