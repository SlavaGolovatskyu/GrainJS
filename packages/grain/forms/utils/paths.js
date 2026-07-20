/**
 * Parse lodash-like path: "a.b[0].c" | "['owner.name']"
 * @param {string|Array<string|number>} path
 * @returns {Array<string|number>}
 */
export function toPath(path) {
  if (Array.isArray(path)) return path;
  if (path == null || path === '') return [];
  const str = String(path);
  // Bracket-quoted single key: ['owner.name']
  const quoted = str.match(/^\[\s*['"](.+)['"]\s*\]$/);
  if (quoted) return [quoted[1]];

  const parts = [];
  str.replace(
    /[^.[\]]+|\[(?:(-?\d+)|(['"])(.*?)\2)\]/g,
    (match, index, _q, quotedKey) => {
      if (quotedKey !== undefined) parts.push(quotedKey);
      else if (index !== undefined) parts.push(Number(index));
      else parts.push(match);
      return match;
    }
  );
  return parts;
}

/**
 * @param {unknown} obj
 * @param {string|Array<string|number>} path
 * @param {unknown} [fallback]
 */
export function getIn(obj, path, fallback = undefined) {
  const keys = toPath(path);
  let cur = obj;
  for (const key of keys) {
    if (cur == null) return fallback;
    cur = cur[key];
  }
  return cur === undefined ? fallback : cur;
}

/**
 * Immutable set at path. Creates arrays/objects as needed.
 * @param {unknown} obj
 * @param {string|Array<string|number>} path
 * @param {unknown} value
 */
export function setIn(obj, path, value) {
  const keys = toPath(path);
  if (keys.length === 0) return value;

  const root = cloneContainer(obj, keys[0]);
  let cur = root;
  let src = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const nextKey = keys[i + 1];
    const existing = src != null ? src[key] : undefined;
    const child = cloneContainer(existing, nextKey);
    cur[key] = child;
    cur = child;
    src = existing;
  }

  cur[keys[keys.length - 1]] = value;
  return root;
}

function cloneContainer(existing, nextKey) {
  if (typeof nextKey === 'number') {
    return Array.isArray(existing) ? existing.slice() : [];
  }
  if (existing != null && typeof existing === 'object' && !Array.isArray(existing)) {
    return { ...existing };
  }
  return {};
}

/** Deep equality for form dirty checks. */
export function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (a == null || b == null) return a === b;
  if (typeof a !== 'object') return false;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

/** Deep clone plain objects/arrays (form values). */
export function deepClone(value) {
  if (value == null || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(deepClone);
  const out = {};
  for (const key of Object.keys(value)) {
    out[key] = deepClone(value[key]);
  }
  return out;
}

/** Build a touched map mirroring values shape (all true). */
export function touchAll(values, value = true) {
  if (values == null || typeof values !== 'object') return {};
  if (Array.isArray(values)) {
    return values.map((item) =>
      item != null && typeof item === 'object' ? touchAll(item, value) : value
    );
  }
  const out = {};
  for (const key of Object.keys(values)) {
    const v = values[key];
    out[key] =
      v != null && typeof v === 'object' ? touchAll(v, value) : value;
  }
  return out;
}

/** True if errors object has any string (or nested) error. */
export function hasErrors(errors) {
  if (errors == null) return false;
  if (typeof errors === 'string') return errors.length > 0;
  if (Array.isArray(errors)) return errors.some(hasErrors);
  if (typeof errors === 'object') {
    return Object.keys(errors).some((k) => hasErrors(errors[k]));
  }
  return false;
}

/**
 * Deep-merge error objects. Prefer later sources. Skip undefined.
 * @param {...unknown} sources
 */
export function mergeErrors(...sources) {
  let result = {};
  for (const src of sources) {
    if (src == null) continue;
    result = mergeErrorsPair(result, src);
  }
  return result;
}

function mergeErrorsPair(a, b) {
  if (b == null || b === undefined) return a;
  if (typeof b === 'string') return b;
  if (typeof a !== 'object' || a == null || typeof b !== 'object') return b;

  if (Array.isArray(b)) {
    const base = Array.isArray(a) ? a.slice() : [];
    const len = Math.max(base.length, b.length);
    const out = [];
    for (let i = 0; i < len; i++) {
      if (b[i] === undefined) out[i] = base[i];
      else if (base[i] === undefined) out[i] = b[i];
      else out[i] = mergeErrorsPair(base[i], b[i]);
    }
    return out;
  }

  const out = { ...a };
  for (const key of Object.keys(b)) {
    if (b[key] === undefined) continue;
    out[key] =
      out[key] === undefined ? b[key] : mergeErrorsPair(out[key], b[key]);
  }
  return out;
}
