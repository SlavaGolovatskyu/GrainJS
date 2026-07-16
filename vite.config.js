import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { grainJsx } from 'grainlet-vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    grainJsx(),
    {
      name: 'spa-path-rewrites',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const path = req.url?.split('?')[0] ?? '';
          if (path === '/routing' || path.startsWith('/routing/')) {
            req.url = '/apps/examples/12-routing.html';
          } else if (path === '/zenwayro' || path.startsWith('/zenwayro/')) {
            req.url = '/apps/zenwayro/index.html';
          }
          next();
        });
      },
    },
  ],
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'grainlet',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@app': resolve(__dirname, './apps/zenwayro/src'),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    port: 3000,
    open: true,
  },
});
