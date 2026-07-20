import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import preact from '@preact/preset-vite';
import solid from 'vite-plugin-solid';
import { grainJsx } from 'grainlet-vite';

const grain = grainJsx();

/** Ensure Grainlet JSX uses grainlet/jsx-runtime (Vite defaults to React). */
function grainletJsxSource() {
  return {
    name: 'grainlet-jsx-source',
    enforce: 'pre',
    transform(code, id) {
      if (
        !/implementations[\\/]grainlet[\\/]/.test(id) ||
        !/\.[cm]?[jt]sx$/.test(id)
      ) {
        return null;
      }
      if (code.includes('@jsxImportSource')) return null;
      return {
        code: `/** @jsxImportSource grainlet */\n${code}`,
        map: null,
      };
    },
  };
}

const grainOnly = {
  ...grain,
  async transform(code, id) {
    if (!/implementations[\\/]grainlet[\\/]/.test(id)) return null;
    return grain.transform.call(this, code, id);
  },
};

export default defineConfig({
  plugins: [
    grainletJsxSource(),
    grainOnly,
    react({
      include: [/implementations[\\/]react[\\/].*\.[tj]sx?$/],
    }),
    preact({
      include: [/implementations[\\/]preact[\\/].*\.[tj]sx?$/],
    }),
    solid({
      include: [/implementations[\\/]solid[\\/].*\.[tj]sx?$/],
    }),
  ],
  server: {
    port: 3020,
    open: true,
  },
  preview: {
    port: 3020,
  },
});
