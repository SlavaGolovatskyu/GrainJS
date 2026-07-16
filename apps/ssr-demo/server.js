/**
 * SSR demo server with Vite middleware (JSX transform for both SSR and client).
 *
 *   npm run ssr:demo
 *   open http://localhost:3001/ssr
 */
import http from 'node:http';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { grainJsx } from 'grainlet-vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../..');
const port = Number(process.env.SSR_PORT) || 3001;

const vite = await createViteServer({
  root,
  server: { middlewareMode: true },
  appType: 'custom',
  plugins: [grainJsx()],
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'grainlet',
  },
});

async function renderPage(url) {
  const { renderToString, wrapHtmlDocument } = await vite.ssrLoadModule('grainlet');
  const { CounterApp } = await vite.ssrLoadModule('/apps/ssr-demo/CounterApp.jsx');

  const body = renderToString(CounterApp, {}, { url });
  return wrapHtmlDocument(body, {
    title: 'SSR demo',
    head: `<style>
      body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; }
      .count { font-size: 2rem; }
      .badge { display: inline-block; margin: 0.5rem 0; padding: 0.2rem 0.5rem; background: #eee; border-radius: 4px; }
      .actions button { margin-right: 0.5rem; padding: 0.4rem 0.8rem; }
      .hint { color: #666; font-size: 0.9rem; }
    </style>`,
    scripts: ['/apps/ssr-demo/client.js'],
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = req.url || '/';
    const path = url.split('?')[0];

    if (path === '/ssr' || path === '/ssr/' || path === '/') {
      const html = await renderPage(`http://localhost:${port}${url}`);
      const transformed = await vite.transformIndexHtml(url, html);
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(transformed);
      return;
    }

    vite.middlewares(req, res, () => {
      res.statusCode = 404;
      res.end('Not found');
    });
  } catch (error) {
    vite.ssrFixStacktrace?.(error);
    console.error(error);
    res.statusCode = 500;
    res.end(String(error?.stack || error));
  }
});

server.listen(port, () => {
  console.log(`SSR demo at http://localhost:${port}/ssr`);
});
