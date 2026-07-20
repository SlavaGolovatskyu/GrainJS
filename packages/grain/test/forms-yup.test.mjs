import * as Yup from 'yup';
import { createForm } from '../forms/createForm.js';

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

const schema = Yup.object({
  email: Yup.string().email('Invalid email').required('Required'),
  firstName: Yup.string().min(2, 'Too Short!').required('Required'),
});

{
  const form = createForm({
    initialValues: { email: 'bad', firstName: 'a' },
    validationSchema: schema,
    validateOnChange: false,
    validateOnBlur: false,
  });

  const errors = await form.validateForm();
  assert(errors.email === 'Invalid email', 'yup email');
  assert(errors.firstName === 'Too Short!', 'yup firstName');

  form.setFieldValue('email', 'ok@example.com', false);
  form.setFieldValue('firstName', 'Ada', false);
  const ok = await form.validateForm();
  assert(Object.keys(ok).length === 0, 'yup passes');
}

{
  const form = createForm({
    initialValues: { email: '', firstName: 'Ada' },
    validationSchema: schema,
  });
  const msg = await form.validateField('email');
  assert(msg === 'Required', 'validateAt email');
}

console.log('forms-yup: PASS');
