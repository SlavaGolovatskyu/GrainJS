/**
 * Shared display:contents host used for fragments, dynamics, and components.
 * @param {string} attr
 * @param {string} [value]
 */
export function createContentsHost(attr, value = '') {
  const host = document.createElement('span');
  host.style.display = 'contents';
  host.setAttribute(attr, value);
  return host;
}
