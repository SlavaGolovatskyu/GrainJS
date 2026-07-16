/**
 * Minimal Vite plugin shape so typings work without pulling Node types into
 * every consumer. Assignable to Vite's `Plugin` when `vite` is installed.
 */
export interface GrainJsxPlugin {
  name: string;
  enforce?: 'pre' | 'post';
  transform?: (
    code: string,
    id: string
  ) =>
    | void
    | null
    | string
    | { code: string; map?: unknown }
    | Promise<void | null | string | { code: string; map?: unknown }>;
}

/**
 * Vite pre-plugin: wrap reactive JSX expressions as accessors and rewrite
 * Solid-style `ref={ident}` (let/var) before esbuild JSX.
 */
export declare function grainJsx(): GrainJsxPlugin;
