import { SCENARIOS, DEFAULT_RUNS } from './shared/scenarios.js';
import {
  measure,
  median,
  memoryMb,
  runAction,
  clickAction,
} from './shared/measure.js';

const FRAMEWORKS = [
  {
    id: 'grainlet',
    name: 'Grainlet',
    load: () => import('./implementations/grainlet/mount.js'),
  },
  {
    id: 'react',
    name: 'React',
    load: () => import('./implementations/react/mount.js'),
  },
  {
    id: 'preact',
    name: 'Preact',
    load: () => import('./implementations/preact/mount.js'),
  },
  // {
  //   id: 'solid',
  //   name: 'Solid',
  //   load: () => import('./implementations/solid/mount.jsx'),
  // },
];

const appRoot = document.getElementById('app');
const resultsEl = document.getElementById('results');
const statusEl = document.getElementById('status');
const fwSelect = document.getElementById('framework');
const runsInput = document.getElementById('runs');

let current = null;

async function mountFramework(id) {
  if (current) {
    current.api.unmount(current.handle);
    current = null;
    appRoot.innerHTML = '';
  }
  const entry = FRAMEWORKS.find((f) => f.id === id);
  if (!entry) throw new Error(`Unknown framework: ${id}`);
  const api = await entry.load();
  const handle = api.mount(appRoot);
  current = { id, api, handle, name: entry.name };
  // Let framework effects/paint commit button ids before scenarios run.
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  return current;
}

async function runScenario(scenario, runs) {
  const samples = [];
  // Warmup
  for (const step of scenario.setup) await runAction(step);
  for (const step of scenario.actions) await runAction(step);
  await runAction('clear');

  for (let i = 0; i < runs; i++) {
    for (const step of scenario.setup) await runAction(step);
    const ms = await measure(async () => {
      for (const step of scenario.actions) await runAction(step);
    });
    samples.push(ms);
    await runAction('clear');
  }

  return {
    id: scenario.id,
    name: scenario.name,
    median: median(samples),
    samples,
  };
}

async function runBenchForFramework(fwId, runs) {
  statusEl.textContent = `Mounting ${fwId}…`;
  await mountFramework(fwId);
  const memBefore = memoryMb();
  const scenarios = [];
  for (const scenario of SCENARIOS) {
    statusEl.textContent = `${fwId}: ${scenario.name}…`;
    scenarios.push(await runScenario(scenario, runs));
  }
  const memAfter = memoryMb();
  return {
    framework: fwId,
    name: current.name,
    scenarios,
    memoryMb:
      memBefore != null && memAfter != null
        ? { before: memBefore, after: memAfter }
        : null,
  };
}

function renderResults(all) {
  const headers = ['Scenario', ...all.map((r) => r.name)];
  const rows = SCENARIOS.map((s) => {
    const cells = all.map((r) => {
      const hit = r.scenarios.find((x) => x.id === s.id);
      return hit ? hit.median.toFixed(2) : '—';
    });
    return [s.name, ...cells];
  });

  const table = [
    `<table class="results-table"><thead><tr>${headers
      .map((h) => `<th>${h}</th>`)
      .join('')}</tr></thead><tbody>`,
    ...rows.map(
      (row) =>
        `<tr>${row.map((c, i) => `<t${i === 0 ? 'h' : 'd'}>${c}${i ? ' ms' : ''}</t${i === 0 ? 'h' : 'd'}>`).join('')}</tr>`
    ),
    '</tbody></table>',
  ].join('');

  const memLine = all
    .filter((r) => r.memoryMb)
    .map(
      (r) =>
        `${r.name}: ${r.memoryMb.before.toFixed(1)} → ${r.memoryMb.after.toFixed(1)} MB`
    )
    .join(' · ');

  resultsEl.innerHTML =
    table +
    (memLine
      ? `<p class="mem">Heap (Chromium): ${memLine}</p>`
      : '<p class="mem">Heap: n/a (enable Chromium performance.memory)</p>') +
    `<p class="note">Medians over ${runsInput.value || DEFAULT_RUNS} runs after warmup. Not an official js-framework-benchmark ranking.</p>`;

  console.table(
    Object.fromEntries(
      SCENARIOS.map((s) => [
        s.name,
        Object.fromEntries(
          all.map((r) => {
            const hit = r.scenarios.find((x) => x.id === s.id);
            return [r.name, hit ? Number(hit.median.toFixed(2)) : null];
          })
        ),
      ])
    )
  );
}

async function runSelected() {
  const runs = Math.max(1, Number(runsInput.value) || DEFAULT_RUNS);
  const fw = fwSelect.value;
  const ids = fw === 'all' ? FRAMEWORKS.map((f) => f.id) : [fw];
  const all = [];
  for (const id of ids) {
    all.push(await runBenchForFramework(id, runs));
  }
  renderResults(all);
  statusEl.textContent = 'Done.';
  window.__BENCH__.lastResults = all;
  return all;
}

document.getElementById('run-bench').addEventListener('click', () => {
  runSelected().catch((err) => {
    console.error(err);
    statusEl.textContent = String(err?.message || err);
  });
});

fwSelect.innerHTML =
  `<option value="all">All frameworks</option>` +
  FRAMEWORKS.map((f) => `<option value="${f.id}">${f.name}</option>`).join('');

const params = new URLSearchParams(location.search);
if (params.get('fw')) fwSelect.value = params.get('fw');
if (params.get('runs')) runsInput.value = params.get('runs');

window.__BENCH__ = {
  frameworks: FRAMEWORKS.map((f) => f.id),
  runSelected,
  runBenchForFramework,
  mountFramework,
  lastResults: null,
};

if (params.get('autorun') === '1') {
  runSelected().catch(console.error);
}

statusEl.textContent = 'Ready.';
