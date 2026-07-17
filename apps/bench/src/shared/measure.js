export function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function memoryMb() {
  const mem = performance.memory;
  if (!mem) return null;
  return mem.usedJSHeapSize / (1024 * 1024);
}

function raf2() {
  return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
}

/**
 * @param {() => void | Promise<void>} fn
 * @returns {Promise<number>} duration ms
 */
export async function measure(fn) {
  const t0 = performance.now();
  await fn();
  await raf2();
  return performance.now() - t0;
}

/**
 * Click a bench control by id.
 * @param {string} id
 */
export function clickAction(id) {
  const el =
    document.getElementById(id) ||
    document.querySelector(`[data-action="${id}"]`);
  if (!el) throw new Error(`Missing #${id}`);
  el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

export async function waitForRows(min = 1, timeoutMs = 3000) {
  const start = performance.now();
  for (;;) {
    const count = document.querySelectorAll('.test-data tbody tr').length;
    if (count >= min) return count;
    if (performance.now() - start > timeoutMs) {
      throw new Error(`Missing row 0 (found ${count} rows)`);
    }
    await raf2();
  }
}

/**
 * @param {'select' | 'remove'} type
 * @param {number} index
 */
export function rowAction(type, index) {
  const rows = document.querySelectorAll('.test-data tbody tr');
  const row = rows[index];
  if (!row) throw new Error(`Missing row ${index}`);
  if (type === 'select') {
    const link = row.querySelector('td.col-md-4 a');
    if (!link) throw new Error('Missing select link');
    link.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return;
  }
  const del = row.querySelector('td.col-md-1 a');
  if (!del) throw new Error('Missing remove link');
  del.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

/**
 * @param {string | { type: string, index: number }} action
 */
export async function runAction(action) {
  if (typeof action === 'string') {
    clickAction(action);
    await raf2();
    if (action === 'run') await waitForRows(1);
    if (action === 'runlots') await waitForRows(1);
    return;
  }
  await waitForRows(action.index + 1);
  rowAction(action.type, action.index);
  await raf2();
}
