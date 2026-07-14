import { createSignal, Link, navigate } from 'grain';
import {
  login,
  register,
  requestPasswordReset,
  resetPassword,
} from '../api/client.js';
import { Button } from '../design-system/ui/button.jsx';
import { Input } from '../design-system/ui/input.jsx';
import { AuthPageLayout } from '../design-system/layouts/AuthLayout.jsx';
import { Separator } from '../design-system/ui/misc.jsx';
import {
  ContinueWithGoogleButton,
  signInWithGoogle,
} from '../design-system/ui/ContinueWithGoogleButton.jsx';
import { t } from '../i18n/t.js';
import {
  ROUTE_AUTH_FORGOT_PASSWORD,
  ROUTE_AUTH_SIGNIN,
  ROUTE_AUTH_SIGNUP,
  ROUTE_HOME,
  ROUTE_TRIPS,
} from '../constants/routes.js';

export function AuthSignInPage() {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [busy, setBusy] = createSignal(false);

  const goAfterAuth = () => {
    const params = new URLSearchParams(window.location.search);
    const callback = params.get('callbackUrl') || ROUTE_TRIPS;
    navigate(callback.startsWith('/') ? callback : ROUTE_HOME);
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email(), password());
      goAfterAuth();
    } catch (err) {
      setError(err.message || t('auth.invalidCredentials'));
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setBusy(true);
    setError('');
    try {
      await signInWithGoogle();
      goAfterAuth();
    } catch (err) {
      setError(err.message || t('auth.googleSignInFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthPageLayout title={t('auth.signInTitle')}>
      <ContinueWithGoogleButton onClick={onGoogle} disabled={busy()} />
      <div class="relative my-2">
        <Separator />
        <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          {t('common.or')}
        </span>
      </div>
      <form class="flex flex-col gap-4" onSubmit={submit}>
        <div>
          <label class="mb-1 block text-sm text-muted-foreground" for="email">
            {t('auth.email')}
          </label>
          <Input
            id="email"
            type="email"
            required
            placeholder={t('auth.emailPlaceholder')}
            value={email()}
            onInput={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label class="mb-1 block text-sm text-muted-foreground" for="password">
            {t('auth.password')}
          </label>
          <Input
            id="password"
            type="password"
            required
            placeholder={t('auth.passwordPlaceholder')}
            value={password()}
            onInput={(e) => setPassword(e.target.value)}
          />
        </div>
        <Link
          href={ROUTE_AUTH_FORGOT_PASSWORD}
          class="text-sm font-medium text-indigo-600"
        >
          {t('auth.forgotPasswordLink')}
        </Link>
        {error() ? <p class="text-sm text-destructive">{error()}</p> : null}
        <Button type="submit" size="lg" class="w-full" disabled={busy()}>
          {busy() ? t('auth.loading') : t('nav.signIn')}
        </Button>
      </form>
      <p class="mt-4 text-center text-sm text-muted-foreground">
        {t('auth.dontHaveAccount')}{' '}
        <Link href={ROUTE_AUTH_SIGNUP} class="font-medium text-foreground">
          {t('auth.signUpLink')}
        </Link>
      </p>
    </AuthPageLayout>
  );
}

export function AuthSignUpPage() {
  const [name, setName] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [busy, setBusy] = createSignal(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await register({ name: name(), email: email(), password: password() });
      navigate(ROUTE_AUTH_SIGNIN);
    } catch (err) {
      setError(err.message || t('auth.googleSignInFailed'));
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setBusy(true);
    setError('');
    try {
      await signInWithGoogle();
      navigate(ROUTE_TRIPS);
    } catch (err) {
      setError(err.message || t('auth.googleSignInFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthPageLayout title={t('auth.signUpTitle')}>
      <ContinueWithGoogleButton onClick={onGoogle} disabled={busy()} />
      <div class="relative my-2">
        <Separator />
        <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
          {t('common.or')}
        </span>
      </div>
      <form class="flex flex-col gap-4" onSubmit={submit}>
        <div>
          <label class="mb-1 block text-sm text-muted-foreground" for="name">
            {t('auth.name')}
          </label>
          <Input
            id="name"
            required
            placeholder={t('auth.namePlaceholder')}
            value={name()}
            onInput={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label class="mb-1 block text-sm text-muted-foreground" for="su-email">
            {t('auth.email')}
          </label>
          <Input
            id="su-email"
            type="email"
            required
            value={email()}
            onInput={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label class="mb-1 block text-sm text-muted-foreground" for="su-pass">
            {t('auth.password')}
          </label>
          <Input
            id="su-pass"
            type="password"
            required
            minlength="8"
            value={password()}
            onInput={(e) => setPassword(e.target.value)}
          />
        </div>
        {error() ? <p class="text-sm text-destructive">{error()}</p> : null}
        <Button type="submit" size="lg" class="w-full" disabled={busy()}>
          {busy() ? t('auth.loading') : t('auth.createAccount')}
        </Button>
      </form>
      <p class="mt-4 text-center text-sm text-muted-foreground">
        {t('auth.alreadyHaveAccount')}{' '}
        <Link href={ROUTE_AUTH_SIGNIN}>{t('auth.signInLink')}</Link>
      </p>
    </AuthPageLayout>
  );
}

export function AuthForgotPasswordPage() {
  const [email, setEmail] = createSignal('');
  const [message, setMessage] = createSignal('');
  const [error, setError] = createSignal('');
  const [busy, setBusy] = createSignal(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await requestPasswordReset(email());
      setMessage(t('auth.forgotPasswordSuccess'));
    } catch (err) {
      setMessage(t('auth.forgotPasswordSuccess'));
      setError(err.message || '');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthPageLayout
      title={t('auth.forgotPasswordTitle')}
      description={t('auth.forgotPasswordSubtitle')}
    >
      <form class="flex flex-col gap-4" onSubmit={submit}>
        <Input
          type="email"
          required
          placeholder={t('auth.emailPlaceholder')}
          value={email()}
          onInput={(e) => setEmail(e.target.value)}
        />
        {message() ? <p class="text-sm text-muted-foreground">{message()}</p> : null}
        {error() ? <p class="text-sm text-destructive">{error()}</p> : null}
        <Button type="submit" disabled={busy()}>
          {busy() ? t('auth.sending') : t('auth.sendResetLink')}
        </Button>
        <Link href={ROUTE_AUTH_SIGNIN} class="text-center text-sm">
          {t('auth.backToSignIn')}
        </Link>
      </form>
    </AuthPageLayout>
  );
}

export function AuthResetPasswordPage() {
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [busy, setBusy] = createSignal(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || '';
    try {
      await resetPassword(token, password());
      navigate(ROUTE_AUTH_SIGNIN);
    } catch (err) {
      setError(err.message || t('auth.resetPasswordFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthPageLayout title={t('auth.resetPasswordTitle')}>
      <form class="flex flex-col gap-4" onSubmit={submit}>
        <Input
          type="password"
          required
          minlength="8"
          placeholder={t('auth.passwordPlaceholder')}
          value={password()}
          onInput={(e) => setPassword(e.target.value)}
        />
        {error() ? <p class="text-sm text-destructive">{error()}</p> : null}
        <Button type="submit" disabled={busy()}>
          {busy() ? t('auth.resettingPassword') : t('auth.resetPasswordCta')}
        </Button>
      </form>
    </AuthPageLayout>
  );
}

export function AuthVerifyPendingPage() {
  const params = new URLSearchParams(window.location.search);
  const email = params.get('email') || '';
  return (
    <AuthPageLayout title={t('auth.verificationPending')}>
      <p class="text-sm text-muted-foreground">
        {t('auth.verificationPendingMessage', { email })}
      </p>
      <Link href={ROUTE_AUTH_SIGNIN} class="mt-4 block text-center text-sm font-medium">
        {t('auth.backToSignIn')}
      </Link>
    </AuthPageLayout>
  );
}
