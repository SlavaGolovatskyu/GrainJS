/**
 * Counter component using JSX syntax
 * 
 * This file requires Vite to transform JSX to jsx() calls.
 * Run: npm run dev
 */

import { createSignal, render } from 'grain';
// Vite should auto-inject this, but adding it explicitly to ensure it works
import { jsx } from 'grain/jsx-runtime';

export function Counter() {
  const [count, setCount] = createSignal(0);

  // This is actual JSX syntax! It gets transformed by Vite
  return (
    <div>
      <div class="counter-display">{count()}</div>
      <button onclick={() => setCount(prev => prev + 1)}>
        Increment
      </button>
      <button onclick={() => setCount(prev => prev - 1)}>
        Decrement
      </button>
      <button onclick={() => setCount(0)}>
        Reset
      </button>
    </div>
  );
}

render(Counter, document.getElementById('app'));
