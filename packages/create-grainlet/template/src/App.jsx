import { createSignal } from 'grainlet';

export function App() {
  const [count, setCount] = createSignal(0);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>__PROJECT_NAME__</h1>
      <p>Grainlet + Vite is ready.</p>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        Count: {count()}
      </button>
    </main>
  );
}
