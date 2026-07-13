# JSX Compiler New - React-like JSX Support

This provides React-like JSX syntax support. You can write JSX directly in your code, and it will be transformed to use the `jsx()` function, just like React.

## Setup

### Option 1: Using Vite (Recommended)

If you're using Vite, add this to your `vite.config.js`:

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

Then you can write JSX in `.jsx` files:

```javascript
import { jsx } from './core/jsx-compiler-new/jsx-runtime.js';

const Counter = () => {
  const [count, setCount] = createSignal(0);
  
  return (
    <button onclick={() => setCount(prev => prev + 1)}>
      {count()}
    </button>
  );
};
```

### Option 2: Using Babel

Install Babel plugins:

```bash
npm install --save-dev @babel/core @babel/plugin-transform-react-jsx
```

Add to your `babel.config.js`:

```javascript
module.exports = {
  plugins: [
    [
      '@babel/plugin-transform-react-jsx',
      {
        runtime: 'automatic',
        importSource: './core/jsx-compiler-new'
      }
    ]
  ]
};
```

### Option 3: Direct Usage (No Build Step)

If you can't use a build tool, you can use the `jsx()` function directly:

```javascript
import { jsx } from './core/jsx-compiler-new/jsx-runtime.js';

const Counter = () => {
  const [count, setCount] = createSignal(0);
  
  return jsx('button', 
    { onclick: () => setCount(prev => prev + 1) },
    count()
  );
};
```

## Usage Examples

### Basic JSX

```javascript
return (
  <div>
    <h1>Hello World</h1>
    <p>This is JSX!</p>
  </div>
);
```

### With Expressions

```javascript
const name = "John";
const count = createSignal(0);

return (
  <div>
    <p>Hello, {name}!</p>
    <p>Count: {count()}</p>
  </div>
);
```

### With Event Handlers

```javascript
const [count, setCount] = createSignal(0);

return (
  <button onclick={() => setCount(prev => prev + 1)}>
    {count()}
  </button>
);
```

### With Props

```javascript
const Button = ({ onClick, children }) => {
  return (
    <button onclick={onClick} class="btn">
      {children}
    </button>
  );
};

return (
  <Button onClick={() => console.log('clicked')}>
    Click me
  </Button>
);
```

### Fragments

```javascript
return (
  <>
    <div>First</div>
    <div>Second</div>
  </>
);
```

## How It Works

1. **JSX Syntax**: You write JSX like in React: `<div>test</div>`
2. **Transformation**: Build tool (Vite/Babel) transforms it to: `jsx('div', null, 'test')`
3. **Runtime**: The `jsx()` function creates a VDOM object compatible with your component system
4. **Rendering**: Your existing component system handles the VDOM objects

## Differences from React

- Uses `onclick` instead of `onClick` (though both work)
- Uses `class` instead of `className` (though both work - class is converted automatically)
- Compatible with your existing `createComponent` and rendering system

## File Structure

- `jsx-runtime.js` - The runtime function that JSX gets transformed to (like React.createElement)
- `jsx-dev-runtime.js` - Development version with better error messages
- `index.js` - Main exports
