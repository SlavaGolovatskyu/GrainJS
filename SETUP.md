# Setup

## Monorepo

```bash
npm install
npm run dev
```

The publishable library lives in `packages/grain`. Apps import it as `grain`.

## JSX without Vite

```js
import { jsx } from 'grain/jsx-runtime';
```

See `apps/examples/08-jsx-counter.html`.

## Full JSX with Vite

Already configured at the workspace root (`jsxImportSource: 'grain'`). For a standalone app:

```js
import { grainJsx } from 'grain/vite';

export default {
  plugins: [grainJsx()],
  esbuild: { jsx: 'automatic', jsxImportSource: 'grain' },
};
```
