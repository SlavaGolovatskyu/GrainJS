import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Vite pre-plugin: rewrite JSX expressions to accessors before esbuild JSX.
 * Requires @babel/core and @babel/plugin-syntax-jsx (devDependencies).
 */
export function fineGrainedJsx() {
  return {
    name: 'fine-grained-jsx',
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
          `fine-grained-jsx: missing babel deps or plugin failed (${err.message}). ` +
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
