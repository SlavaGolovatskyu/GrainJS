import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { fineGrainedJsx } from './core/jsx-compiler-new/fine-grained-jsx.vite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const jsxRuntimePath = resolve(__dirname, './core/jsx-compiler-new');

export default defineConfig({
  plugins: [
    fineGrainedJsx(),
    {
      name: 'spa-path-rewrites',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const path = req.url?.split('?')[0] ?? '';
          if (path === '/routing' || path.startsWith('/routing/')) {
            req.url = '/signals-example/12-routing.html';
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
    jsxImportSource: './core/jsx-compiler-new',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@app': resolve(__dirname, './apps/zenwayro/src'),
      './core/jsx-compiler-new/jsx-dev-runtime': resolve(
        jsxRuntimePath,
        './jsx-dev-runtime.js'
      ),
      './core/jsx-compiler-new/jsx-runtime': resolve(
        jsxRuntimePath,
        './jsx-runtime.js'
      ),
      '../core/jsx-compiler-new/jsx-dev-runtime': resolve(
        jsxRuntimePath,
        './jsx-dev-runtime.js'
      ),
      '../core/jsx-compiler-new/jsx-runtime': resolve(
        jsxRuntimePath,
        './jsx-runtime.js'
      ),
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
