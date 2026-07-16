# grainlet-vite

Vite plugin for [grainlet](https://www.npmjs.com/package/grainlet) fine-grained JSX.

Wraps reactive JSX expressions as accessors and rewrites Solid-style `ref={ident}`
(for `let`/`var`) to assignment callbacks. Does not wrap `ref` attributes otherwise
(so `ref={props.ref}` and `ref={setEl}` keep working).

## Install (devDependency)

```bash
npm install grainlet
npm install -D grainlet-vite vite @babel/core @babel/plugin-syntax-jsx
```

## Usage

```js
import { defineConfig } from 'vite';
import { grainJsx } from 'grainlet-vite';

export default defineConfig({
  plugins: [grainJsx()],
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'grainlet',
  },
});
```
