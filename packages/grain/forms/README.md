# Forms (`grainlet/forms`)

Formik-inspired form state for grainlet: **signals**, **context**, nested paths, **built-in validators**, and submission helpers.

Import from **`grainlet/forms`** (not the main `grainlet` entry):

```js
import {
  createForm,
  FormProvider,
  Form,
  Field,
  ErrorMessage,
  FieldArray,
  useFormContext,
  useField,
  getIn,
  setIn,
  required,
  isEmail,
  isNumber,
  isEmpty,
  minLength,
  maxLength,
  min,
  max,
  matches,
  isUrl,
  oneOf,
  notOneOf,
  equalsField,
  compose,
  rules,
} from 'grainlet/forms';
```

| Export | Role |
|--------|------|
| `createForm(config)` | Headless form bag (signals + helpers) |
| `FormProvider` | Context provider around `createForm` |
| `Form` | `<form>` wired to `handleSubmit` / `handleReset` |
| `Field` | Bound input (or custom `as` / `component`) |
| `ErrorMessage` | Shows error when field is touched |
| `FieldArray` | `push` / `remove` / `swap` / … for array fields |
| `useFormContext` | Read the nearest `FormProvider` bag |
| `useField` | `[field, meta, helpers]` for custom inputs |
| `getIn` / `setIn` | Lodash-like nested path helpers |
| `required`, `isEmail`, `isNumber`, … | Built-in field validators |
| `rules({ … })` | Path → validators map |
| `compose` / `all` | Run validators in order (first error wins) |

Defaults: `validateOnChange` / `validateOnBlur` = `true`, `validateOnMount` = `false`, `enableReinitialize` = `false`.

Optional peer for advanced schema validation (Yup):

```bash
npm install yup
```

---

## Quick start

Prefer **`rules`** + built-in validators — no hand-rolled `errors` objects:

```jsx
import {
  FormProvider,
  Form,
  Field,
  ErrorMessage,
  required,
  isEmail,
  minLength,
} from 'grainlet/forms';

function Signup() {
  return (
    <FormProvider
      initialValues={{ email: '', password: '' }}
      rules={{
        email: [
          required('Email is required'),
          isEmail('Enter a valid email'),
        ],
        password: [
          required('Password is required'),
          minLength(8, 'Use at least 8 characters'),
        ],
      }}
      onSubmit={async (values, { setStatus }) => {
        await api.signup(values);
        setStatus('ok');
      }}
    >
      <Form>
        <label>
          Email
          <Field name="email" type="email" />
        </label>
        <ErrorMessage name="email" />

        <label>
          Password
          <Field name="password" type="password" />
        </label>
        <ErrorMessage name="password" />

        <button type="submit">Sign up</button>
      </Form>
    </FormProvider>
  );
}
```

Or attach validators on the field:

```jsx
<Field name="email" type="email" validate={[required(), isEmail()]} />
```

---

## Headless: `createForm`

```jsx
import { createForm, required, isEmail } from 'grainlet/forms';
import { Show } from 'grainlet';

function Login() {
  const form = createForm({
    initialValues: { email: '', remember: false },
    rules: { email: [required(), isEmail()] },
    onSubmit: async (values) => {
      await api.login(values);
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <input
        name="email"
        type="email"
        value={form.values().email}
        onInput={form.handleChange}
        onBlur={form.handleBlur}
      />
      <Show when={form.touched().email && form.errors().email}>
        <p>{form.errors().email}</p>
      </Show>

      <label>
        <input
          name="remember"
          type="checkbox"
          checked={form.values().remember}
          onChange={form.handleChange}
        />
        Remember me
      </label>

      <button type="submit" disabled={form.isSubmitting()}>
        {form.isSubmitting() ? 'Signing in…' : 'Sign in'}
      </button>
      <button type="button" onClick={form.handleReset}>
        Reset
      </button>
    </form>
  );
}
```

### Bag API (signals + helpers)

```js
const form = createForm({ initialValues: { name: '' }, onSubmit });

form.values();
form.errors();
form.touched();
form.status();
form.isSubmitting();
form.isValidating();
form.submitCount();
form.dirty();
form.isValid();

form.handleChange;
form.handleBlur;
form.handleSubmit;
form.handleReset;

await form.setFieldValue('name', 'Ada');
await form.setFieldTouched('name', true);
form.setFieldError('name', 'Nope');
await form.validateForm();
await form.validateField('name');
await form.submitForm();
form.resetForm();
```

---

## `FormProvider` + render props

```jsx
<FormProvider
  initialValues={{ name: 'jared' }}
  rules={{ name: [required()] }}
  onSubmit={(values, actions) => {
    console.log(values);
    actions.setSubmitting(false);
  }}
>
  {(form) => (
    <form onSubmit={form.handleSubmit}>
      <input
        name="name"
        value={form.values().name}
        onInput={form.handleChange}
        onBlur={form.handleBlur}
      />
      <Show when={form.errors().name}>
        <div>{form.errors().name}</div>
      </Show>
      <button type="submit" disabled={!form.dirty() || form.isSubmitting()}>
        Save
      </button>
    </form>
  )}
</FormProvider>
```

---

## Validation

### Built-in validators + `rules` (recommended)

Each helper returns a validator `(value, values, meta) => message | undefined`. Empty values skip type checks like `isEmail` / `isNumber` — pair them with `required()`.

| Helper | Fails when |
|--------|------------|
| `required()` / `isNotEmpty()` | value is empty |
| `isEmpty()` | value is **not** empty |
| `isEmail()` / `email()` | non-empty value is not an email |
| `isNumber()` / `number()` | non-empty value is not a finite number |
| `isInteger()` / `integer()` | non-empty value is not an integer |
| `minLength(n)` / `maxLength(n)` | string length out of range |
| `min(n)` / `max(n)` | numeric value out of range |
| `matches(re)` / `pattern(re)` | string does not match |
| `isUrl()` / `url()` | non-empty value is not a URL |
| `oneOf(list)` / `notOneOf(list)` | value (not) in list |
| `equalsField(path)` | value !== other field (e.g. confirm password) |
| `test(fn, msg)` | custom predicate returns false |
| `compose(...validators)` / `all(...)` | first error in the chain |

Custom messages — pass a string (last argument for helpers that take a number first):

```js
required('Email is required')
isEmail('Enter a valid email')
minLength(8, 'Use at least 8 characters')
min(18, 'You must be 18+')
notOneOf(['admin'], 'That username is reserved')
equalsField('password', 'Passwords must match')
```

Omit the message to use the built-in default (`'Required'`, `'Invalid email'`, …).

#### Translated error messages (i18n)

Messages can be a **string** or a **`() => string`**. Functions are resolved when validation runs, so locale switches apply without rebuilding the form.

**1. Resolve with your `t()` when defining rules** (fine if the form remounts on locale change, or you only need the language at mount):

```jsx
import { t } from './i18n';
import {
  FormProvider,
  Form,
  Field,
  ErrorMessage,
  required,
  isEmail,
  minLength,
} from 'grainlet/forms';

// en: { "validation.required": "Required", "validation.email": "Invalid email", … }
// uk: { "validation.required": "Обовʼязково", "validation.email": "Невірний email", … }

<FormProvider
  initialValues={{ email: '', password: '' }}
  rules={{
    email: [
      required(t('validation.required')),
      isEmail(t('validation.email')),
    ],
    password: [
      required(t('validation.required')),
      minLength(8, t('validation.minLength', { count: 8 })),
    ],
  }}
  onSubmit={onSubmit}
>
  <Form>
    <Field name="email" type="email" />
    <ErrorMessage name="email" />
    <Field name="password" type="password" />
    <ErrorMessage name="password" />
    <button type="submit">{t('common.submit')}</button>
  </Form>
</FormProvider>
```

**2. Lazy messages** — pass a getter so the next validate/blur/submit picks up the current locale:

```jsx
rules={{
  email: [
    required(() => t('validation.required')),
    isEmail(() => t('validation.email')),
  ],
  password: [
    required(() => t('validation.required')),
    minLength(8, () => t('validation.minLength', { count: 8 })),
  ],
}}
```

**3. Field-level with translations**

```jsx
<Field
  name="email"
  type="email"
  validate={[
    required(() => t('validation.required')),
    isEmail(() => t('validation.email')),
  ]}
/>
<ErrorMessage name="email">
  {(msg) => <p class="error" role="alert">{msg}</p>}
</ErrorMessage>
```

**4. Shared rules factory** (keeps pages thin):

```js
// validation/signupRules.js
import { required, isEmail, minLength, equalsField } from 'grainlet/forms';

export function signupRules(t) {
  return {
    email: [
      required(() => t('validation.required')),
      isEmail(() => t('validation.email')),
    ],
    password: [
      required(() => t('validation.required')),
      minLength(8, () => t('validation.passwordMin', { count: 8 })),
    ],
    confirm: [
      required(() => t('validation.required')),
      equalsField('password', () => t('validation.passwordMatch')),
    ],
  };
}

// SignupPage.jsx
<FormProvider
  initialValues={{ email: '', password: '', confirm: '' }}
  rules={signupRules(t)}
  onSubmit={onSubmit}
>
  …
</FormProvider>
```

`ErrorMessage` already shows whatever string the validator returned, so translated text flows through with no extra wiring.

#### Form-level `rules`

```jsx
import {
  FormProvider,
  Form,
  Field,
  ErrorMessage,
  required,
  isEmail,
  minLength,
  notOneOf,
  equalsField,
} from 'grainlet/forms';

<FormProvider
  initialValues={{ email: '', username: '', password: '', confirm: '' }}
  rules={{
    email: [required(), isEmail()],
    username: [
      required(),
      minLength(3),
      notOneOf(['admin', 'root'], 'Nice try'),
    ],
    password: [required(), minLength(8)],
    confirm: [required(), equalsField('password', 'Passwords must match')],
  }}
  onSubmit={console.log}
>
  <Form>
    <Field name="email" type="email" />
    <ErrorMessage name="email" />
    <Field name="username" />
    <ErrorMessage name="username" />
    <Field name="password" type="password" />
    <ErrorMessage name="password" />
    <Field name="confirm" type="password" />
    <ErrorMessage name="confirm" />
    <button type="submit">Continue</button>
  </Form>
</FormProvider>
```

#### Field-level validators

```jsx
<Field name="email" validate={[required(), isEmail()]} />
<Field name="age" validate={[required(), isNumber(), min(18, '18+ only')]} />
```

#### Compose / `rules()` helper

```js
import { compose, required, isEmail, isNumber, min, rules } from 'grainlet/forms';

const emailRules = compose(required(), isEmail());

// Same map shape as FormProvider `rules`, usable as `validate`:
const validate = rules({
  email: [required(), isEmail()],
  age: [required(), isNumber(), min(18)],
});
```

#### Async / custom

```js
import { test, required } from 'grainlet/forms';

const uniqueUsername = test(async (value) => {
  if (!value) return true;
  const res = await api.checkUsername(value);
  return res.available;
}, 'Already taken');

// rules: { username: [required(), uniqueUsername] }
```

### Yup `validationSchema` (optional)

```jsx
import * as Yup from 'yup';

<FormProvider
  initialValues={{ firstName: '', email: '' }}
  validationSchema={Yup.object({
    firstName: Yup.string().min(2).required(),
    email: Yup.string().email().required(),
  })}
  onSubmit={console.log}
>
  …
</FormProvider>
```

Prefer `rules` for everyday forms; use Yup when you already have schemas.

### Escape hatch: raw `validate`

Still supported for rare cases — return an errors object (or Promise). Prefer `rules` / field `validate` arrays instead.

```js
validate: async (values) => {
  const errors = {};
  if (await isBanned(values.email)) errors.email = 'Blocked';
  return errors;
};
```

### When validation runs

| Trigger | Controlled by |
|---------|----------------|
| Change (`handleChange`, `setFieldValue`, `setValues`) | `validateOnChange` (default `true`) |
| Blur (`handleBlur`, `setFieldTouched`, `setTouched`) | `validateOnBlur` (default `true`) |
| Mount | `validateOnMount` (default `false`) |
| Submit | Always |

Use `undefined` for “no error” — never `null` (keeps `isValid` correct).

---

## Nested objects and arrays

Paths use lodash-like strings: `social.facebook`, `friends[0]`.

### Nested objects

```jsx
<FormProvider
  initialValues={{
    social: { facebook: '', twitter: '' },
  }}
  rules={{
    'social.facebook': [required()],
    'social.twitter': [required()],
  }}
  onSubmit={console.log}
>
  <Form>
    <Field name="social.facebook" placeholder="Facebook" />
    <Field name="social.twitter" placeholder="Twitter" />
    <button type="submit">Save</button>
  </Form>
</FormProvider>
```

### Literal keys with dots

```jsx
<FormProvider
  initialValues={{ 'owner.name': '' }}
  onSubmit={console.log}
>
  <Form>
    <Field name="['owner.name']" />
    <button type="submit">Save</button>
  </Form>
</FormProvider>
```

### `FieldArray`

```jsx
import { For } from 'grainlet';
import {
  FormProvider,
  Form,
  Field,
  FieldArray,
  ErrorMessage,
  required,
} from 'grainlet/forms';

function FriendsForm() {
  return (
    <FormProvider
      initialValues={{ friends: [''] }}
      onSubmit={console.log}
    >
      <Form>
        <FieldArray name="friends">
          {(helpers) => (
            <div>
              <For each={helpers.form.values().friends}>
                {(_friend, index) => (
                  <div>
                    <Field
                      name={`friends[${index}]`}
                      validate={[required()]}
                    />
                    <ErrorMessage name={`friends[${index}]`} />
                    <button
                      type="button"
                      onClick={() => helpers.remove(index())}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </For>
              <button type="button" onClick={() => helpers.push('')}>
                Add friend
              </button>
            </div>
          )}
        </FieldArray>
        <button type="submit">Submit</button>
      </Form>
    </FormProvider>
  );
}
```

`FieldArray` helpers: `push`, `unshift`, `pop`, `remove`, `insert`, `swap`, `move`, `replace`, plus `form` and `name`.

### Path utils

```js
import { getIn, setIn } from 'grainlet/forms';

const values = { social: { facebook: 'a' }, friends: ['x', 'y'] };
getIn(values, 'social.facebook'); // 'a'
getIn(values, 'friends[1]');      // 'y'

const next = setIn(values, 'social.twitter', 'b');
// next.social.twitter === 'b'; values unchanged
```

---

## Submission lifecycle

Calling `handleSubmit` / `submitForm`:

1. Touch all fields (so hidden errors become visible)
2. Set `isSubmitting` → `true`, increment `submitCount`
3. Run full validation (`isValidating` → `true`)
4. On errors: abort, clear validating/submitting
5. On success: run `onSubmit(values, helpers)`
   - If `onSubmit` returns a **Promise**, `isSubmitting` clears when it settles
   - If `onSubmit` is **sync**, call `setSubmitting(false)` yourself

```jsx
<FormProvider
  initialValues={{ title: '' }}
  rules={{ title: [required()] }}
  onSubmit={async (values, { setStatus, setFieldError, resetForm }) => {
    try {
      await api.createPost(values);
      setStatus('saved');
      resetForm({ values: { title: '' } });
    } catch (err) {
      setFieldError('title', err.message);
    }
  }}
>
  {(form) => (
    <Form>
      <Field name="title" />
      <ErrorMessage name="title" />
      <Show when={form.status() === 'saved'}>
        <p>Saved!</p>
      </Show>
      <button type="submit" disabled={form.isSubmitting()}>
        {form.isSubmitting() ? 'Saving…' : 'Save'}
      </button>
    </Form>
  )}
</FormProvider>
```

Guard double submits with `disabled={form.isSubmitting()}`.

---

## `useFormContext` and `useField`

```jsx
import { useFormContext, useField, required, isEmail } from 'grainlet/forms';

function SubmitBar() {
  const form = useFormContext();
  return (
    <button type="submit" disabled={form.isSubmitting() || !form.isValid()}>
      Submit ({form.submitCount()})
    </button>
  );
}

function EmailField() {
  const [field, meta] = useField({
    name: 'email',
    validate: [required(), isEmail()],
  });
  return (
    <div>
      <input {...field} type="email" value={field.value} />
      {meta.touched && meta.error ? <p>{meta.error}</p> : null}
    </div>
  );
}
```

---

## Checkboxes, radios, selects

```jsx
<FormProvider
  initialValues={{
    newsletter: true,
    plan: 'pro',
    color: 'red',
  }}
  onSubmit={console.log}
>
  <Form>
    <label>
      <Field name="newsletter" type="checkbox" />
      Subscribe
    </label>

    <label>
      <Field name="plan" type="radio" value="free" />
      Free
    </label>
    <label>
      <Field name="plan" type="radio" value="pro" />
      Pro
    </label>

    <Field name="color" as="select">
      <option value="red">Red</option>
      <option value="blue">Blue</option>
    </Field>

    <button type="submit">Save</button>
  </Form>
</FormProvider>
```

---

## `ErrorMessage` variants

```jsx
<ErrorMessage name="email" />
<ErrorMessage name="email" component="div" />
<ErrorMessage name="email">
  {(msg) => <strong class="error">{msg}</strong>}
</ErrorMessage>
```

---

## Reinitialize

```jsx
function EditUser(props) {
  return (
    <FormProvider
      enableReinitialize
      initialValues={props.user}
      rules={{ email: [required(), isEmail()] }}
      onSubmit={props.onSave}
    >
      <Form>
        <Field name="name" />
        <Field name="email" type="email" />
        <button type="submit">Update</button>
      </Form>
    </FormProvider>
  );
}
```

---

## Config reference

| Option | Default | Description |
|--------|---------|-------------|
| `initialValues` | required | Form values shape |
| `initialErrors` | `{}` | Seed errors |
| `initialTouched` | `{}` | Seed touched |
| `initialStatus` | `undefined` | Arbitrary top-level status |
| `onSubmit` | — | `(values, helpers) => void \| Promise` |
| `onReset` | — | Called from `handleReset` before reset |
| `rules` | — | `{ field: [required(), isEmail()] }` |
| `validate` | — | Escape hatch: sync/async errors object |
| `validationSchema` | — | Optional Yup schema or `() => schema` |
| `validateOnChange` | `true` | Validate after value changes |
| `validateOnBlur` | `true` | Validate after blur / touch |
| `validateOnMount` | `false` | Validate once on create |
| `enableReinitialize` | `false` | Reset when `initialValues` change |

---

## Notes

- Controlled inputs use grainlet accessors (`value={…}` + `onInput` / `onChange`).
- `FormProvider` keeps a stable bag; field updates go through signals — no remount on each keystroke.
- JSX prop accessors from `grainlet-vite` are unwrapped inside `FormProvider` / `Field`.
- There is no `withFormik` / `connect` HOC — use `createForm` or `FormProvider` + `useFormContext`.
