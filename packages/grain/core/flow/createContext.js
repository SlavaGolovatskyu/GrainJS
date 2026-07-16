import { onCleanup, untrack } from '../../signals/index.js';

/** @type {WeakMap<object, unknown[]>} */
const stacks = new WeakMap();

/**
 * Babel wraps non-identifier JSX attrs (`value={[a,b]}` → `() => [a,b]`).
 * Unwrap those; keep signal accessors and intentional function values.
 */
function resolveProviderValue(value) {
  if (typeof value !== 'function') return value;
  try {
    const result = untrack(() => value());
    if (result !== null && typeof result === 'object') {
      return result;
    }
  } catch {
    // keep original
  }
  return value;
}

/**
 * Create a context object with a `.Provider` and optional default value.
 *
 *   const ThemeContext = createContext('light');
 *
 *   <ThemeContext.Provider value="dark">
 *     <Child />
 *   </ThemeContext.Provider>
 *
 *   const theme = useContext(ThemeContext);
 *
 * Pass a signal (or store) as `value` for reactive updates without remounting.
 */
export function createContext(defaultValue) {
  const context = {
    id: Symbol('context'),
    defaultValue,
    Provider: null,
  };
  stacks.set(context, []);
  context.Provider = function Provider(props) {
    const stack = stacks.get(context);
    stack.push(resolveProviderValue(props.value));
    onCleanup(() => {
      stack.pop();
    });
    return props.children;
  };
  return context;
}

/**
 * Read the nearest Provider value for `context`, or its defaultValue.
 */
export function useContext(context) {
  const stack = stacks.get(context);
  if (stack?.length) return stack[stack.length - 1];
  return context.defaultValue;
}
