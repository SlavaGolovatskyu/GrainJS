# How to Use React-like JSX Syntax

## Quick Start

### With Build Tool (Vite/Babel) - Recommended

1. **Set up Vite** (easiest option):

Create or update `vite.config.js`:

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsxFactory: 'jsx',
    jsxFragment: 'Fragment',
    jsxImportSource: './core/jsx-compiler-new'
  }
});
```

2. **Write JSX in `.jsx` files**:

```javascript
// Counter.jsx
import { jsx } from './core/jsx-compiler-new/jsx-runtime.js';
import { createSignal } from '../../signals/createSignal/createSignal.js';

function Counter() {
  const [count, setCount] = createSignal(0);
  
  return (
    <button onclick={() => setCount(prev => prev + 1)}>
      {count()}
    </button>
  );
}

export default Counter;
```

3. **Use it**:

```javascript
import { render } from './index.js';
import Counter from './Counter.jsx';

render(Counter, document.getElementById('app'));
```

### Without Build Tool (Direct jsx() calls)

If you can't use a build tool, you can call `jsx()` directly:

```javascript
import { jsx } from './core/jsx-compiler-new/jsx-runtime.js';
import { createSignal } from '../../signals/createSignal/createSignal.js';

function Counter() {
  const [count, setCount] = createSignal(0);
  
  // Instead of JSX, call jsx() directly
  return jsx('button', 
    { onclick: () => setCount(prev => prev + 1) },
    count()
  );
}
```

## What Gets Transformed

**Your JSX code:**
```javascript
return (
  <button onclick={() => setCount(prev => prev + 1)}>
    {count()}
  </button>
);
```

**Gets transformed to:**
```javascript
import { jsx } from './core/jsx-compiler-new/jsx-runtime.js';

return jsx('button', 
  { onclick: () => setCount(prev => prev + 1) },
  count()
);
```

## Key Points

1. **JSX syntax** - Write `<div>test</div>` just like React
2. **Expressions** - Use `{expression}` for dynamic content
3. **Event handlers** - Use `onclick={() => ...}` (or `onClick`)
4. **Components** - Capitalized names are treated as components
5. **Fragments** - Use `<>...</>` for fragments

The compiler/runtime handles everything else automatically!

