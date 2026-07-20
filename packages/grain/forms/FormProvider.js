import { createEffect } from '../index.js';
import { jsx } from '../core/jsx-compiler-new/jsx-runtime.js';
import { createForm } from './createForm.js';
import { FormContext } from './context.js';

function readProp(value) {
  return typeof value === 'function' ? value() : value;
}

/**
 * Provide form state/helpers to descendants.
 * Supports function children: `{(form) => ...}`
 */
export function FormProvider(props) {
  const initialValues = readProp(props.initialValues);
  if (initialValues == null) {
    throw new Error('FormProvider: initialValues is required');
  }

  const config = {
    initialValues,
    initialErrors: readProp(props.initialErrors),
    initialTouched: readProp(props.initialTouched),
    initialStatus: readProp(props.initialStatus),
    onSubmit: props.onSubmit,
    onReset: props.onReset,
    validate: props.validate,
    validationSchema: props.validationSchema,
    rules: readProp(props.rules),
    validateOnChange: readProp(props.validateOnChange),
    validateOnBlur: readProp(props.validateOnBlur),
    validateOnMount: readProp(props.validateOnMount),
    enableReinitialize: readProp(props.enableReinitialize),
  };

  for (const key of Object.keys(config)) {
    if (config[key] === undefined) delete config[key];
  }

  const form = createForm(config);

  createEffect(() => {
    form.updateConfig({
      initialValues: readProp(props.initialValues),
      initialErrors: readProp(props.initialErrors),
      initialTouched: readProp(props.initialTouched),
      initialStatus: readProp(props.initialStatus),
      onSubmit: props.onSubmit,
      onReset: props.onReset,
      validate: props.validate,
      validationSchema: props.validationSchema,
      rules: readProp(props.rules),
      validateOnChange: readProp(props.validateOnChange),
      validateOnBlur: readProp(props.validateOnBlur),
      validateOnMount: readProp(props.validateOnMount),
      enableReinitialize: readProp(props.enableReinitialize) ?? false,
    });
  });

  const children = props.children;
  const content =
    typeof children === 'function' ? children(form) : children;

  return jsx(FormContext.Provider, { value: form }, content);
}
