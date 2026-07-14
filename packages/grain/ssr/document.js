/**
 * Wrap a body HTML fragment in a full HTML document for SSR responses.
 */
export function wrapHtmlDocument(body, options = {}) {
  const title = options.title || 'App';
  const head = options.head || '';
  const scripts = (options.scripts || [])
    .map((src) => {
      if (typeof src === 'string') {
        return `<script type="module" src="${src}"></script>`;
      }
      return src;
    })
    .join('\n    ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  ${head}
</head>
<body>
  <div id="app">${body}</div>
  ${scripts}
</body>
</html>`;
}
