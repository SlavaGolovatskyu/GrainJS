import { createForm } from '../forms/createForm.js';
import { getIn } from '../forms/utils/paths.js';

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// basic change / blur
{
  const form = createForm({
    initialValues: { email: '', name: '' },
    validateOnChange: false,
    validateOnBlur: false,
  });
  form.setFieldValue('email', 'a@b.com', false);
  assert(form.values().email === 'a@b.com', 'setFieldValue');
  form.setFieldTouched('email', true, false);
  assert(form.touched().email === true, 'setFieldTouched');
  assert(form.dirty() === true, 'dirty');
}

// sync validate + submit abort
{
  const form = createForm({
    initialValues: { email: '' },
    validate: (v) => (!v.email ? { email: 'Required' } : {}),
    onSubmit: () => {
      throw new Error('should not submit');
    },
  });
  let rejected = false;
  try {
    await form.submitForm();
  } catch {
    rejected = true;
  }
  assert(rejected, 'submit rejects when invalid');
  assert(form.errors().email === 'Required', 'errors set');
  assert(form.touched().email === true, 'touched all on submit');
  assert(form.isSubmitting() === false, 'not submitting after abort');
  assert(form.submitCount() === 1, 'submitCount');
}

// async onSubmit clears isSubmitting
{
  let submitted = null;
  const form = createForm({
    initialValues: { email: 'ok@x.com' },
    onSubmit: async (values) => {
      await sleep(10);
      submitted = values.email;
    },
  });
  await form.submitForm();
  assert(submitted === 'ok@x.com', 'async submit ran');
  assert(form.isSubmitting() === false, 'isSubmitting cleared');
}

// field-level validate
{
  const form = createForm({
    initialValues: { username: 'admin' },
    validateOnChange: false,
  });
  form.registerField('username', {
    validate: (v) => (v === 'admin' ? 'Nice try' : undefined),
  });
  const msg = await form.validateField('username');
  assert(msg === 'Nice try', 'field validate');
  assert(form.errors().username === 'Nice try', 'field error stored');
}

// nested paths
{
  const form = createForm({
    initialValues: { social: { facebook: '' } },
    validateOnChange: false,
  });
  form.setFieldValue('social.facebook', 'fb', false);
  assert(getIn(form.values(), 'social.facebook') === 'fb', 'nested set');
}

// FieldArray-style helpers via setFieldValue
{
  const form = createForm({
    initialValues: { friends: ['a', 'b'] },
    validateOnChange: false,
  });
  form.setFieldValue('friends', [...form.values().friends, 'c'], false);
  assert(form.values().friends.length === 3, 'array push via setFieldValue');
}

console.log('forms-createForm: PASS');
