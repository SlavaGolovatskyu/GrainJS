import { jsx } from '../core/jsx-compiler-new/jsx-runtime.js';
import { useFormContext } from './context.js';

/**
 * HTML form wired to FormProvider handleSubmit / handleReset.
 */
export function Form(props) {
  const form = useFormContext();
  const { children, onSubmit, onReset, ...rest } = props;

  return jsx(
    'form',
    {
      ...rest,
      onSubmit: (e) => {
        if (typeof onSubmit === 'function') onSubmit(e);
        if (!e.defaultPrevented) form.handleSubmit(e);
      },
      onReset: (e) => {
        if (typeof onReset === 'function') onReset(e);
        if (!e.defaultPrevented) form.handleReset(e);
      },
    },
    children
  );
}
