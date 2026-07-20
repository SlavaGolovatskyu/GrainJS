import { useFormContext } from './context.js';
import { getIn } from './utils/paths.js';

function readProp(value) {
  return typeof value === 'function' ? value() : value;
}

/**
 * Helpers for array fields (push/remove/swap/…).
 * Children must be a function: `{(helpers) => ...}`
 */
export function FieldArray(props) {
  const form = useFormContext();
  const name = readProp(props.name);
  if (!name) {
    throw new Error('FieldArray: name is required');
  }

  const getArray = () => {
    const cur = getIn(form.values(), name);
    return Array.isArray(cur) ? cur : [];
  };

  const update = (next) => form.setFieldValue(name, next);

  const helpers = {
    name,
    form,
    push: (value) => {
      update([...getArray(), value]);
    },
    unshift: (value) => {
      update([value, ...getArray()]);
    },
    pop: () => {
      const arr = getArray().slice();
      const last = arr.pop();
      update(arr);
      return last;
    },
    remove: (index) => {
      const arr = getArray().slice();
      const [removed] = arr.splice(index, 1);
      update(arr);
      return removed;
    },
    insert: (index, value) => {
      const arr = getArray().slice();
      arr.splice(index, 0, value);
      update(arr);
    },
    swap: (indexA, indexB) => {
      const arr = getArray().slice();
      const tmp = arr[indexA];
      arr[indexA] = arr[indexB];
      arr[indexB] = tmp;
      update(arr);
    },
    move: (from, to) => {
      const arr = getArray().slice();
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      update(arr);
    },
    replace: (index, value) => {
      const arr = getArray().slice();
      arr[index] = value;
      update(arr);
    },
  };

  const children = props.children;
  if (typeof children === 'function') {
    return children(helpers);
  }
  return children ?? null;
}
