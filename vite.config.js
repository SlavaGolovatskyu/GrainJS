import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { fineGrainedJsx } from './frontend-core/jsx-compiler-new/fine-grained-jsx.vite.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const jsxRuntimePath = resolve(__dirname, './frontend-core/jsx-compiler-new');

export default defineConfig({
  plugins: [fineGrainedJsx()],
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: './frontend-core/jsx-compiler-new'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      // Fix JSX runtime imports - resolve relative paths to absolute
      './frontend-core/jsx-compiler-new/jsx-dev-runtime': resolve(jsxRuntimePath, './jsx-dev-runtime.js'),
      './frontend-core/jsx-compiler-new/jsx-runtime': resolve(jsxRuntimePath, './jsx-runtime.js'),
      '../frontend-core/jsx-compiler-new/jsx-dev-runtime': resolve(jsxRuntimePath, './jsx-dev-runtime.js'),
      '../frontend-core/jsx-compiler-new/jsx-runtime': resolve(jsxRuntimePath, './jsx-runtime.js')
    }
  },
  server: {
    port: 3000,
    open: true
  }
});

