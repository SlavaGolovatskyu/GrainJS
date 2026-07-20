import { createSignal, createEffect } from 'grainlet';
import { Link, navigate } from 'grainlet/route';
import {
  login,
  register,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerification,
  applyAuthResponse,
  completeQuiz,
  generateTripFromQuiz,
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
import { getErrorMessage } from '../utils/errors.js';
import { toast } from '../components/Toast.jsx';
import {
  clearPendingQuiz,
  clearPendingTripGeneration,
  readPendingQuiz,
  readPendingTripGeneration,
  resumePendingQuiz,
  resumePendingTripGeneration,
} from '../lib/pending.js';
import {
  ROUTE_AUTH_FORGOT_PASSWORD,
  ROUTE_AUTH_SIGNIN,
  ROUTE_AUTH_SIGNUP,
  ROUTE_AUTH_VERIFY_PENDING,
  ROUTE_EXPLORE,
  ROUTE_HOME,
  ROUTE_PLAN_NEW,
  ROUTE_TRIPS,
  routeAuthVerifyPendingWithEmail,
  routePlanById,
} from '../constants/routes.js';

async function afterAuthSuccess(fallback = ROUTE_TRIPS) {
  const params = new URLSearchParams(window.location.search);
  const callback = params.get('callbackUrl');
  const quizPending = params.get('quizPending') === '1' || Boolean(readPendingQuiz());
  const tripPending =
    params.get('tripPending') === '1' ||
    params.get('tripPending') === 'true' ||
    Boolean(readPendingTripGeneration());

  try {
    const flushed = await resumePendingQuiz(completeQuiz);
    if (flushed) {
      toast(t('quiz.submitToastSuccess') || 'Preferences saved', {
        variant: 'success',
      });
      navigate(callback?.startsWith('/') ? callback : ROUTE_EXPLORE);
      return;
    }
  } catch (err) {
    clearPendingQuiz();
    toast(getErrorMessage(err, t('quiz.submitToastError')), {
      variant: 'destructive',
    });
  }

  if (tripPending) {
    try {
      const tripId = await resumePendingTripGeneration(generateTripFromQuiz);
      if (tripId) {
        navigate(routePlanById(tripId), { replace: true });
        return;
      }
    } catch (err) {
      clearPendingTripGeneration();
      toast(getErrorMessage(err, t('planGenerate.failed')), {
        variant: 'destructive',
      });
    }
    navigate(ROUTE_PLAN_NEW);
    return;
  }
  if (quizPending) {
    navigate(ROUTE_EXPLORE);
    return;
  }
  navigate(callback?.startsWith('/') ? callback : fallback);
}

export function AuthSignInPage() {
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [error, setError] = createSignal('');
  const [busy, setBusy] = createSignal(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email(), password());
      await afterAuthSuccess(ROUTE_TRIPS);
    } catch (err) {
      setError(getErrorMessage(err, t('auth.invalidCredentials')));
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setBusy(true);
    setError('');
    try {
      await signInWithGoogle();
      await afterAuthSuccess(ROUTE_TRIPS);
    } catch (err) {
      setError(getErrorMessage(err, t('auth.googleSignInFailed')));
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
      navigate(routeAuthVerifyPendingWithEmail(email()));
    } catch (err) {
      if (err.status === 409 || /already|exists/i.test(err.message || '')) {
        setError(getErrorMessage(err));
      } else {
        setError(getErrorMessage(err, t('auth.googleSignInFailed')));
      }
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setBusy(true);
    setError('');
    try {
      await signInWithGoogle();
      await afterAuthSuccess(ROUTE_TRIPS);
    } catch (err) {
      setError(getErrorMessage(err, t('auth.googleSignInFailed')));
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
  const [busy, setBusy] = createSignal(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await requestPasswordReset(email());
    } catch {
      /* always show success to avoid email enumeration */
    } finally {
      setMessage(t('auth.forgotPasswordSuccess'));
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
      toast('Password updated', { variant: 'success' });
      navigate(ROUTE_AUTH_SIGNIN);
    } catch (err) {
      setError(getErrorMessage(err, t('auth.resetPasswordFailed')));
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
  const [email] = createSignal(params.get('email') || '');
  const [message, setMessage] = createSignal('');
  const [busy, setBusy] = createSignal(false);

  const resend = async () => {
    if (!email()) return;
    setBusy(true);
    try {
      await resendVerification(email());
      setMessage(t('auth.verificationEmailSent') || 'Verification email sent.');
    } catch (err) {
      setMessage(getErrorMessage(err, 'Could not resend email.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthPageLayout title={t('auth.verificationPending')}>
      <p class="text-sm text-muted-foreground">
        {t('auth.verificationPendingMessage', { email: email() })}
      </p>
      {message() ? <p class="mt-2 text-sm text-muted-foreground">{message()}</p> : null}
      <Button class="mt-4 w-full" variant="outline" disabled={busy() || !email()} onClick={resend}>
        {busy() ? t('auth.sending') : t('auth.resendVerificationEmail')}
      </Button>
      <Link href={ROUTE_AUTH_SIGNIN} class="mt-4 block text-center text-sm font-medium">
        {t('auth.backToSignIn')}
      </Link>
    </AuthPageLayout>
  );
}

export function AuthVerifyPage() {
  const [status, setStatus] = createSignal('loading');
  const [error, setError] = createSignal('');

  createEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || '';
    if (!token) {
      setStatus('error');
      setError('Missing verification token.');
      return;
    }
    let cancelled = false;
    verifyEmail(token)
      .then((data) => {
        if (cancelled) return;
        if (data?.accessToken || data?.token) {
          applyAuthResponse(data);
        }
        setStatus('ok');
        const quiz = Boolean(readPendingQuiz());
        const dest = quiz
          ? `${ROUTE_AUTH_SIGNIN}?quizPending=1`
          : ROUTE_AUTH_SIGNIN;
        setTimeout(() => navigate(dest), 800);
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus('error');
        setError(getErrorMessage(err, 'Verification failed'));
      });
    return () => {
      cancelled = true;
    };
  });

  return (
    <AuthPageLayout title={t('auth.verifyTitle') || 'Verify email'}>
      {status() === 'loading' ? (
        <p class="text-sm text-muted-foreground">{t('auth.loading')}</p>
      ) : null}
      {status() === 'ok' ? (
        <p class="text-sm text-emerald-700">
          {t('auth.verifySuccess') || 'Email verified. Redirecting…'}
        </p>
      ) : null}
      {status() === 'error' ? (
        <>
          <p class="text-sm text-destructive">{error()}</p>
          <Link href={ROUTE_AUTH_VERIFY_PENDING} class="mt-4 block text-sm">
            {t('auth.verificationPending')}
          </Link>
        </>
      ) : null}
    </AuthPageLayout>
  );
}
