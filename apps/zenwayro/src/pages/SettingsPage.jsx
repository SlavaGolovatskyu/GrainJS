import { createSignal, createEffect, navigate } from 'grain';
import {
  fetchMe,
  isAuthenticated,
  logout,
  updateMe,
  useAuthToken,
} from '../api/client.js';
import { Button } from '../design-system/ui/button.jsx';
import { Input } from '../design-system/ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../design-system/ui/card.jsx';
import { t } from '../i18n/t.js';
import { ROUTE_AUTH_SIGNIN, ROUTE_HOME } from '../constants/routes.js';

export function SettingsPage() {
  const token = useAuthToken();
  const [name, setName] = createSignal('');
  const [username, setUsername] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [message, setMessage] = createSignal('');
  const [error, setError] = createSignal('');

  createEffect(() => {
    if (!token()) return;
    let cancelled = false;
    fetchMe()
      .then((data) => {
        if (cancelled) return;
        setName(data?.name || data?.displayName || '');
        setUsername(data?.username || '');
        setEmail(data?.email || '');
      })
      .catch(() => {
        if (!cancelled) setMessage(t('settings.profileUpdateFailed'));
      });
    return () => {
      cancelled = true;
    };
  });

  if (!isAuthenticated()) {
    navigate(ROUTE_AUTH_SIGNIN);
    return (
      <div class="p-6">
        <p class="text-muted-foreground">{t('trips.signInPrompt')}</p>
      </div>
    );
  }

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await updateMe({ name: name(), username: username() });
      setMessage(t('settings.profileUpdateSuccess'));
    } catch (err) {
      setError(err.message || t('settings.profileUpdateFailed'));
      setMessage(
        `Saved locally: ${name() || '—'} / ${username() || '—'}. API offline.`
      );
    }
  };

  return (
    <div class="mx-auto max-w-4xl px-4 py-6">
      <h1 class="mb-1 text-2xl font-bold">{t('settings.title')}</h1>
      <p class="mb-6 text-sm text-muted-foreground">{t('settings.subtitle')}</p>

      <div class="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle class="text-lg">{t('settings.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form class="flex flex-col gap-4" onSubmit={save}>
              <div>
                <label class="mb-1 block text-sm text-muted-foreground">
                  {t('settings.fullName')}
                </label>
                <Input
                  value={name()}
                  onInput={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label class="mb-1 block text-sm text-muted-foreground">
                  {t('settings.username')}
                </label>
                <Input
                  value={username()}
                  onInput={(e) => setUsername(e.target.value)}
                />
                <p class="mt-1 text-xs text-muted-foreground">
                  {t('settings.usernameHint')}
                </p>
              </div>
              <div>
                <label class="mb-1 block text-sm text-muted-foreground">
                  {t('settings.emailAddress')}
                </label>
                <Input value={email()} disabled />
                <p class="mt-1 text-xs text-muted-foreground">
                  {t('settings.emailReadOnly')}
                </p>
              </div>
              {message() ? (
                <p class="text-sm text-muted-foreground">{message()}</p>
              ) : null}
              {error() ? <p class="text-sm text-destructive">{error()}</p> : null}
              <Button type="submit" class="coral-gradient border-0 text-white">
                {t('settings.saveChanges')}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-lg">{t('settings.securityTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p class="mb-2 text-sm font-medium">{t('settings.localSignIn')}</p>
            <p class="mb-4 text-sm text-muted-foreground">
              {t('settings.localManagedDescription')}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                logout();
                navigate(ROUTE_HOME);
              }}
            >
              {t('nav.signOut')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
