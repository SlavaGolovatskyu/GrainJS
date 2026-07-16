import { createSignal, render, ErrorBoundary } from 'grainlet';

function Bomb(props) {
  if (props.explode()) {
    throw new Error('Boom! Intentional render failure.');
  }
  return <p class="ok">Child rendered successfully.</p>;
}

function Demo() {
  const [explode, setExplode] = createSignal(false);

  return (
    <div class="demo">
      <h1>ErrorBoundary</h1>
      <p class="lead">
        Toggle the bomb to throw during render. The boundary shows a fallback;
        Try Again resets and remounts children. Clicking a plain button that
        throws in an event handler is <em>not</em> caught (by design).
      </p>

      <div class="toolbar">
        <button type="button" onClick={() => setExplode(true)}>
          Trigger render error
        </button>
        <button
          type="button"
          onClick={() => {
            throw new Error('Event handler boom (not caught)');
          }}
        >
          Throw in click handler
        </button>
      </div>

      <ErrorBoundary
        fallback={(error, reset) => (
          <div class="fallback" role="alert">
            <p>Something went wrong: {error.message}</p>
            <button
              type="button"
              onClick={() => {
                setExplode(false);
                reset();
              }}
            >
              Try Again
            </button>
          </div>
        )}
      >
        <Bomb explode={explode} />
      </ErrorBoundary>
    </div>
  );
}

render(Demo, document.getElementById('app'));
