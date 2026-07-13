# Setup Guide for JSX Runtime

You have **two options** to use JSX-like syntax:

## Option 1: Simple (No Build Tool) - Works Right Now! ✅

Use the `jsx()` function directly in your HTML files. No setup needed!

**Example:**
```javascript
import { jsx } from '../core/jsx-compiler-new/jsx-runtime.js';

return jsx('button', { onclick: () => setCount(prev => prev + 1) }, count());
```

**See:** `signals-example/08-jsx-counter.html`

## Option 2: Full JSX Syntax (With Vite) - Recommended! 🚀

Write actual JSX syntax like React. Requires Vite setup.

### Setup Steps:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Write JSX in `.jsx` files:**
   ```javascript
   return (
     <button onclick={() => setCount(prev => prev + 1)}>
       {count()}
     </button>
   );
   ```

4. **Open in browser:**
   - Vite will start a dev server (usually at http://localhost:3000)
   - Open `signals-example/09-jsx-counter-vite.html` or your own `.jsx` files

### What Vite Does:

- Transforms JSX syntax to `jsx()` function calls
- Provides hot module replacement (HMR)
- Serves your files with proper module resolution

### File Structure:

```
/
├── package.json
├── vite.config.js
├── index.js
├── signals/
├── core/
└── signals-example/
```

## Quick Start Commands

```bash
# Install Vite (one time)
npm install

# Start dev server (for JSX files)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Which Should You Use?

- **Option 1 (jsx() function)**: 
  - ✅ No setup needed
  - ✅ Works immediately
  - ❌ Not as clean as JSX syntax
  
- **Option 2 (Vite + JSX)**:
  - ✅ Beautiful JSX syntax like React
  - ✅ Better developer experience
  - ✅ Hot reload
  - ❌ Requires npm install and dev server

## Examples

- **Without Vite:** `signals-example/08-jsx-counter.html` - Open directly in browser
- **With Vite:** `signals-example/09-jsx-counter-vite.html` - Requires `npm run dev`

