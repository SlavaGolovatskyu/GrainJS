import { readProp, renderChild } from './resolve.js';

/**
 * Conditionally render children when `when` is truthy.
 *
 *   <Show when={loggedIn()} fallback={<Login />}>
 *     <Dashboard />
 *   </Show>
 *   <Show when={user()}>{(u) => <Profile user={u} />}</Show>
 */
export function Show(props) {
  const value = readProp(props.when);
  if (value) {
    return renderChild(props.children, value);
  }
  return props.fallback ?? null;
}
