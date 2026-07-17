/**
 * Headless collect: starts Vite preview, runs all frameworks, writes results.md
 *
 *   npm run bench:collect -w bench
 */
import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { chromium } from 'playwright';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const port = 3020;
const base = `http://127.0.0.1:${port}/`;

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForServer(url, attempts = 60) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return;
    } catch {
      // retry
    }
    await wait(500);
  }
  throw new Error(`Server did not start at ${url}`);
}

function startPreview() {
  const child = spawn(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['vite', 'preview', '--host', '127.0.0.1', '--port', String(port)],
    {
      cwd: root,
      stdio: 'pipe',
      shell: process.platform === 'win32',
    }
  );
  return child;
}

function toMarkdown(all, runs) {
  const headers = ['Scenario', ...all.map((r) => r.name)];
  const lines = [
    '# Framework bench results',
    '',
    `_Generated ${new Date().toISOString()} · median of ${runs} runs_`,
    '',
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
  ];

  const scenarios = all[0]?.scenarios || [];
  for (const s of scenarios) {
    const cells = all.map((r) => {
      const hit = r.scenarios.find((x) => x.id === s.id);
      return hit ? `${hit.median.toFixed(2)} ms` : '—';
    });
    lines.push(`| ${s.name} | ${cells.join(' | ')} |`);
  }

  lines.push('');
  lines.push(
    'Not an official [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark) ranking; local harness only.'
  );
  lines.push('');
  return lines.join('\n');
}

async function main() {
  // Ensure production build exists for preview
  await new Promise((resolvePromise, reject) => {
    const build = spawn(
      process.platform === 'win32' ? 'npx.cmd' : 'npx',
      ['vite', 'build'],
      { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' }
    );
    build.on('exit', (code) =>
      code === 0 ? resolvePromise() : reject(new Error(`build failed: ${code}`))
    );
  });

  const server = startPreview();
  try {
    await waitForServer(base);
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const runs = Number(process.env.BENCH_RUNS) || 5;
    await page.goto(`${base}?fw=all&runs=${runs}&autorun=1`, {
      waitUntil: 'networkidle',
    });
    await page.waitForFunction(
      () => document.getElementById('status')?.textContent === 'Done.',
      null,
      { timeout: 600_000 }
    );

    const all = await page.evaluate(async () => {
      // Results already rendered; re-run to capture structured data if needed
      return window.__BENCH__.lastResults || null;
    });

    // Prefer capturing from a fresh evaluate if lastResults missing
    let results = all;
    if (!results) {
      results = await page.evaluate(async (n) => {
        document.getElementById('runs').value = String(n);
        document.getElementById('framework').value = 'all';
        return window.__BENCH__.runSelected();
      }, runs);
    }

    await browser.close();

    const md = toMarkdown(results, runs);
    const out = resolve(root, 'results.md');
    await writeFile(out, md, 'utf8');
    console.log(`Wrote ${out}`);
    console.log(md);
  } finally {
    server.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
