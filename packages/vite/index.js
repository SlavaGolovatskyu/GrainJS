import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Vite pre-plugin: wrap reactive JSX expressions as accessors before esbuild JSX.
 * Requires @babel/core and @babel/plugin-syntax-jsx (peerDependencies).
 *
 *   import { grainJsx } from 'grainlet-vite'
 *   plugins: [grainJsx()]
 *
 * Two Babel passes: wrap accessors first, then compile static host trees to
 * templates. A single pass would re-wrap mountTemplate() calls as accessors.
 */
export function grainJsx() {
  return {
    name: 'grainlet-jsx',
    enforce: 'pre',
    async transform(code, id) {
      if (!/\.[cm]?[jt]sx$/.test(id)) return null;
      if (id.includes('node_modules')) return null;

      let babel;
      let syntaxJsx;
      let wrapPlugin;
      let templatePlugin;
      try {
        babel = await import('@babel/core');
        syntaxJsx = (await import('@babel/plugin-syntax-jsx')).default;
        const wrapMod = await import(
          pathToFileURL(resolve(__dirname, './wrap-jsx-accessors.babel.js')).href
        );
        wrapPlugin = wrapMod.default;
        const tmplMod = await import(
          pathToFileURL(resolve(__dirname, './jsx-templates.babel.js')).href
        );
        templatePlugin = tmplMod.default;
      } catch (err) {
        this.warn(
          `grainlet-vite: missing babel deps or plugin failed (${err.message}). ` +
            'Install @babel/core and @babel/plugin-syntax-jsx.'
        );
        return null;
      }

      const parserOpts = {
        sourceType: 'module',
        plugins: ['jsx'],
      };

      const wrapped = await babel.transformAsync(code, {
        filename: id,
        babelrc: false,
        configFile: false,
        sourceMaps: true,
        plugins: [syntaxJsx, wrapPlugin],
        parserOpts,
      });

      if (!wrapped?.code) return null;

      const result = await babel.transformAsync(wrapped.code, {
        filename: id,
        babelrc: false,
        configFile: false,
        sourceMaps: true,
        inputSourceMap: wrapped.map || undefined,
        plugins: [syntaxJsx, templatePlugin],
        parserOpts,
      });

      if (!result?.code) return null;
      return { code: result.code, map: result.map };
    },
  };
}
