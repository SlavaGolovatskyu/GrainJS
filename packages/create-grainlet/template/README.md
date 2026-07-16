# __PROJECT_NAME__

Grainlet app scaffolded with [`create-grainlet`](https://www.npmjs.com/package/create-grainlet).

```bash
npm install
npm run dev
```

## Layout

| Path | Purpose |
|------|---------|
| `src/` | App source (JSX components) |
| `public/` | Static assets served at `/` (CSS, images, favicons) |
| `public/styles.css` | Global styles |
| `public/images/` | Images (e.g. `logo.svg` → `/images/logo.svg`) |

- **Runtime:** `grainlet` (production dependency)
- **Tooling:** `grainlet-vite`, `vite`, Babel peers (devDependencies)
