import { createSignal, createEffect, Link, navigate, Show } from 'grainlet';
import {
  fetchMe,
  isAuthenticated,
  logout,
  updateMe,
  uploadProfileImage,
  useAuthToken,
  useAuthUser,
} from '../api/client.js';
import { Button } from '../design-system/ui/button.jsx';
import { Input } from '../design-system/ui/input.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../design-system/ui/card.jsx';
import { toast } from '../components/Toast.jsx';
import { t } from '../i18n/t.js';
import { getErrorMessage } from '../utils/errors.js';
import { initialsFromName, resolveImageUrl } from '../utils/images.js';
import {
  ROUTE_AUTH_FORGOT_PASSWORD,
  ROUTE_AUTH_SIGNIN,
  ROUTE_HOME,
} from '../constants/routes.js';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ACCEPT_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export function SettingsPage() {
  const token = useAuthToken();
  const authUser = useAuthUser();
  const [name, setName] = createSignal('');
  const [username, setUsername] = createSignal('');
  const [email, setEmail] = createSignal('');
  const [imageUrl, setImageUrl] = createSignal('');
  const [saving, setSaving] = createSignal(false);
  const [uploading, setUploading] = createSignal(false);

  createEffect(() => {
    if (!token()) return;
    let cancelled = false;
    fetchMe()
      .then((data) => {
        if (cancelled) return;
        setName(data?.name || data?.displayName || '');
        setUsername(data?.username || '');
        setEmail(data?.email || '');
        setImageUrl(
          data?.profileImageUrl || data?.imageUrl || data?.avatarUrl || ''
        );
      })
      .catch((err) => {
        if (!cancelled) {
          toast(getErrorMessage(err, t('settings.profileUpdateFailed')), {
            variant: 'destructive',
          });
        }
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
    setSaving(true);
    try {
      await updateMe({ name: name(), username: username() });
      toast(t('settings.profileUpdateSuccess'), { variant: 'success' });
    } catch (err) {
      toast(getErrorMessage(err, t('settings.profileUpdateFailed')), {
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const onImageChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!ACCEPT_TYPES.includes(file.type)) {
      toast(t('settings.imageTypeInvalid'), { variant: 'destructive' });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast(t('settings.imageSizeExceeded'), { variant: 'destructive' });
      return;
    }
    setUploading(true);
    try {
      const data = await uploadProfileImage(file);
      const url =
        data?.profileImageUrl ||
        data?.imageUrl ||
        data?.url ||
        authUser()?.profileImageUrl ||
        '';
      if (url) setImageUrl(url);
      toast(t('settings.imageUploadSuccess'), { variant: 'success' });
    } catch (err) {
      toast(getErrorMessage(err, t('settings.imageUploadFailed')), {
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const resolved = resolveImageUrl(imageUrl());
  const initials = initialsFromName(name() || username() || email());

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
            <div class="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-border bg-muted/40 p-4">
              <div class="flex items-center gap-3">
                <Show
                  when={resolved}
                  fallback={
                    <div class="flex h-14 w-14 items-center justify-center rounded-full bg-[#1e3a5f] text-sm font-bold text-white">
                      {initials}
                    </div>
                  }
                >
                  <img
                    src={resolved}
                    alt={t('settings.photoLabel')}
                    class="h-14 w-14 rounded-full object-cover"
                  />
                </Show>
                <div>
                  <p class="text-sm font-medium">{t('settings.photoLabel')}</p>
                  <p class="text-xs text-muted-foreground">{t('settings.photoHint')}</p>
                </div>
              </div>
              <label class="cursor-pointer">
                <span class="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent">
                  {uploading()
                    ? t('settings.uploadingPhoto')
                    : t('settings.uploadPhoto')}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                  class="hidden"
                  disabled={uploading()}
                  onChange={onImageChange}
                />
              </label>
            </div>

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
              <Button
                type="submit"
                class="coral-gradient border-0 text-white"
                disabled={saving()}
              >
                {saving() ? t('settings.savingChanges') : t('settings.saveChanges')}
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
            <div class="flex flex-col gap-2 sm:flex-row">
              <Link href={ROUTE_AUTH_FORGOT_PASSWORD}>
                <Button variant="outline">{t('auth.forgotPasswordLink')}</Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  logout();
                  navigate(ROUTE_HOME);
                }}
              >
                {t('nav.signOut')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
