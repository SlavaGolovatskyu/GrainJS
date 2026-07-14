import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Vite pre-plugin: wrap reactive JSX expressions as accessors before esbuild JSX.
 * Requires @babel/core and @babel/plugin-syntax-jsx.
 *
 *   import { grainJsx } from 'grain/vite'
 *   plugins: [grainJsx()]
 */
export function grainJsx() {
  return {
    name: 'grain-jsx',
    enforce: 'pre',
    async transform(code, id) {
      if (!/\.[cm]?[jt]sx$/.test(id)) return null;
      if (id.includes('node_modules')) return null;

      let babel;
      let syntaxJsx;
      let wrapPlugin;
      try {
        babel = await import('@babel/core');
        syntaxJsx = (await import('@babel/plugin-syntax-jsx')).default;
        const wrapMod = await import(
          pathToFileURL(resolve(__dirname, './wrap-jsx-accessors.babel.js')).href
        );
        wrapPlugin = wrapMod.default;
      } catch (err) {
        this.warn(
          `grain-jsx: missing babel deps or plugin failed (${err.message}). ` +
            'Install @babel/core and @babel/plugin-syntax-jsx.'
        );
        return null;
      }

      const result = await babel.transformAsync(code, {
        filename: id,
        babelrc: false,
        configFile: false,
        sourceMaps: true,
        plugins: [syntaxJsx, wrapPlugin],
        parserOpts: {
          sourceType: 'module',
          plugins: ['jsx'],
        },
      });

      if (!result?.code) return null;
      return { code: result.code, map: result.map };
    },
  };
}
