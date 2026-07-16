# grainlet-vite

Vite plugin for [grainlet](https://www.npmjs.com/package/grainlet) fine-grained JSX.

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
