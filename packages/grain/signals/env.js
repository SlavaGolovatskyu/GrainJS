/** Global SSR mode flag — set by ssr/context.js to avoid circular imports. */
let serverMode = false;

export function setServerMode(value) {
  serverMode = !!value;
}

export function isServer() {
  return serverMode;
}
