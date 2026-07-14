// Export the JSX runtime (this is what JSX gets transformed to)
// This is the main export - Vite will import from here with automatic JSX
export { jsx, Fragment, jsxs } from './jsx-runtime.js';

// Re-export jsx-runtime for explicit imports
export * from './jsx-runtime.js';

