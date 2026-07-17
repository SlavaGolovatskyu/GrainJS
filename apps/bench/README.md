# Framework compare benchmarks

<img width="1053" height="852" alt="image" src="https://github.com/user-attachments/assets/f1e889c1-631a-4da3-945d-a70a1cfb23a4" />

Local harness comparing **Grainlet**, **React**, **Preact**, and **Solid** on classic keyed-list scenarios (inspired by [js-framework-benchmark](https://github.com/krausest/js-framework-benchmark), but **not** an official ranking).

## Scenarios

| Id | What it measures |
|----|------------------|
| create1000 | Create 1,000 rows |
| create10000 | Create 10,000 rows |
| append1000 | Append 1,000 rows to an existing 1,000 |
| update | Update every 10th row label |
| select | Select first row |
| swap | Swap rows 2 and 999 |
| swapmany | Swap 100 index pairs (i ↔ n-1-i) |
| remove | Remove first row |
| clear | Clear 1,000 rows |

Each scenario warms up once, then runs **N** times (default 10 in the UI, 5 in headless collect). Reported value is the **median** ms.

## Run interactively

```bash
# from repo root
npm install
npm run bench
```

Builds the app and opens **vite preview** on [http://localhost:3020](http://localhost:3020) so chunk URLs always match `dist/`. Pick a framework (or All), set runs, click **Run benchmark**.

If you see `404` on `/assets/mount-*.js`, stop any old server on port 3020, hard-refresh the tab (or close it), and run `npm run bench` again.

```bash
# HMR during harness edits (no hashed dist assets)
npm run bench:dev -w bench

# or from this package
npm run bench -w bench
```

## Headless collect

Requires Playwright browsers once:

```bash
npx playwright install chromium
npm run bench:collect -w bench
```

This builds the app, starts `vite preview`, runs all frameworks, and writes [`results.md`](./results.md).

Optional: `BENCH_RUNS=10 npm run bench:collect -w bench`

## How to read results

- Lower median ms is faster for that scenario.
- Absolute numbers depend on CPU, browser, background load, and throttling — compare **relative** order on the same machine.
- Chromium may also show JS heap before/after when `performance.memory` is available.
- Do not treat this as a substitute for the official js-framework-benchmark suite.

## DOM contract

All implementations share button ids (`run`, `runlots`, `add`, `update`, `clear`, `swaprows`) and table markup so the runner is framework-agnostic.
