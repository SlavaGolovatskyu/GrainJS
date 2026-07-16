# create-grainlet

Scaffold a Vite + [grainlet](https://www.npmjs.com/package/grainlet) app.

```bash
npx create-grainlet my-app
cd my-app
npm install
npm run dev
```

The generated project depends on:

| Package | Role |
|---------|------|
| `grainlet` | Runtime (dependency) |
| `grainlet-vite` | JSX Vite plugin (devDependency) |
| `vite` | Bundler (devDependency) |
| `@babel/core`, `@babel/plugin-syntax-jsx` | Peers for the Vite plugin (devDependencies) |
