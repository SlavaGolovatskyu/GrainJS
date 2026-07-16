import { createSignal } from 'grainlet';

export function App() {
  const [count, setCount] = createSignal(0);

  return (
    <main class="page">
      <div class="page__brand">
        <img class="page__logo" src="/images/logo.svg" alt="" width="40" height="40" />
        <h1 class="page__title">__PROJECT_NAME__</h1>
      </div>
      <p class="page__lead">
        Grainlet + Vite is ready. Put CSS and images in <code>public/</code>.
      </p>
      <button
        type="button"
        class="page__button"
        onClick={() => setCount((c) => c + 1)}
      >
        Count: {count()}
      </button>
    </main>
  );
}
