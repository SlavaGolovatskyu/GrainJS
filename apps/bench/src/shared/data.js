const ADJECTIVES = [
  'pretty',
  'large',
  'big',
  'small',
  'tall',
  'short',
  'long',
  'handsome',
  'plain',
  'quaint',
  'clean',
  'elegant',
  'easy',
  'angry',
  'cheap',
  'nice',
  'better',
  'best',
  'modern',
];

const COLOURS = [
  'red',
  'yellow',
  'blue',
  'green',
  'pink',
  'brown',
  'purple',
  'brown',
  'white',
  'black',
  'orange',
];

const NOUNS = [
  'table',
  'chair',
  'house',
  'bbq',
  'desk',
  'car',
  'pony',
  'cookie',
  'sandwich',
  'burger',
  'pizza',
  'mouse',
  'keyboard',
];

let nextId = 1;

export function resetId() {
  nextId = 1;
}

function label() {
  return `${ADJECTIVES[(Math.random() * ADJECTIVES.length) | 0]} ${
    COLOURS[(Math.random() * COLOURS.length) | 0]
  } ${NOUNS[(Math.random() * NOUNS.length) | 0]}`;
}

/** @param {number} count */
export function buildData(count) {
  const data = new Array(count);
  for (let i = 0; i < count; i++) {
    data[i] = { id: nextId++, label: label() };
  }
  return data;
}

/**
 * Swap `pairCount` index pairs (i ↔ length-1-i). Exercises multi-node keyed reorder
 * (not just a single 2-row transposition).
 * @param {unknown[]} data
 * @param {number} [pairCount=100]
 */
export function swapManyPairs(data, pairCount = 100) {
  if (!Array.isArray(data) || data.length < pairCount * 2) return data;
  const next = data.slice();
  for (let i = 0; i < pairCount; i++) {
    const j = next.length - 1 - i;
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
  }
  return next;
}
