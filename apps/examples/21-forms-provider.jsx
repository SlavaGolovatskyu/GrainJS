import { Show, render } from 'grainlet';
import {
  FormProvider,
  Form,
  Field,
  ErrorMessage,
  required,
  isEmail,
  minLength,
  equalsField,
} from 'grainlet/forms';

/**
 * grainlet/forms — FormProvider + Field + rules + ErrorMessage
 */
function SignupDemo() {
  return (
    <div class="demo">
      <h1>grainlet/forms — FormProvider</h1>
      <p class="lead">
        Built-in validators via <code>rules</code>, bound <code>Field</code>s,
        and <code>ErrorMessage</code>. Submit an empty form to see touched
        errors; fill valid values to succeed.
      </p>

      <FormProvider
        initialValues={{
          email: '',
          password: '',
          confirm: '',
        }}
        rules={{
          email: [
            required('Email is required'),
            isEmail('Enter a valid email'),
          ],
          password: [
            required('Password is required'),
            minLength(8, 'Use at least 8 characters'),
          ],
          confirm: [
            required('Please confirm your password'),
            equalsField('password', 'Passwords must match'),
          ],
        }}
        onSubmit={async (values, { setStatus, resetForm }) => {
          await new Promise((r) => setTimeout(r, 400));
          console.log('submitted', values);
          setStatus({ ok: true, email: values.email });
          resetForm({
            values: { email: '', password: '', confirm: '' },
            status: { ok: true, email: values.email },
          });
        }}
      >
        {(form) => (
          <Form>
            <label for="email">Email</label>
            <Field id="email" name="email" type="email" placeholder="you@example.com" />
            <ErrorMessage name="email">
              {(msg) => <p class="error">{msg}</p>}
            </ErrorMessage>

            <label for="password">Password</label>
            <Field
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
            />
            <ErrorMessage name="password">
              {(msg) => <p class="error">{msg}</p>}
            </ErrorMessage>

            <label for="confirm">Confirm password</label>
            <Field
              id="confirm"
              name="confirm"
              type="password"
              placeholder="••••••••"
            />
            <ErrorMessage name="confirm">
              {(msg) => <p class="error">{msg}</p>}
            </ErrorMessage>

            <div class="row">
              <button type="submit" disabled={form.isSubmitting()}>
                {form.isSubmitting() ? 'Saving…' : 'Sign up'}
              </button>
              <button
                type="button"
                class="secondary"
                onClick={form.handleReset}
              >
                Reset
              </button>
            </div>

            <Show when={form.status()?.ok}>
              <div class="success">
                Signed up as <strong>{form.status().email}</strong>. Check the
                console for the payload.
              </div>
            </Show>

            <p class="meta">
              dirty={String(form.dirty())} · valid={String(form.isValid())} ·
              submitCount={form.submitCount()}
            </p>
          </Form>
        )}
      </FormProvider>
    </div>
  );
}

render(SignupDemo, document.getElementById('app'));
