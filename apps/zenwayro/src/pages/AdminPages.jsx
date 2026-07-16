import {
  createSignal,
  createEffect,
  Link,
  navigate,
  For,
  Show,
} from 'grainlet';
import {
  createAdminManualPoi,
  deleteAdminUser,
  fetchAdminCities,
  fetchAdminPoisByCity,
  fetchAdminUserStats,
  fetchAdminUsers,
  fetchAiEnrichmentPois,
  fetchAiEnrichmentStats,
  fetchMe,
  isAdminUser,
  updateAdminUserRoles,
  useAuthUser,
} from '../api/client.js';
import { t } from '../i18n/t.js';
import {
  ROUTE_ADMIN,
  ROUTE_ADMIN_AI_ENRICHMENT,
  ROUTE_ADMIN_IMAGES,
  ROUTE_HOME,
} from '../constants/routes.js';
import { Button } from '../design-system/ui/button.jsx';
import { Input } from '../design-system/ui/input.jsx';
import { toast } from '../components/Toast.jsx';
import { getErrorMessage } from '../utils/errors.js';

function useAdminGate() {
  const authUser = useAuthUser();
  const [ready, setReady] = createSignal(false);
  const [allowed, setAllowed] = createSignal(false);

  createEffect(() => {
    let cancelled = false;
    const existing = authUser();
    if (existing && isAdminUser(existing)) {
      setAllowed(true);
      setReady(true);
      return;
    }
    fetchMe()
      .then((me) => {
        if (cancelled) return;
        const ok = isAdminUser(me);
        setAllowed(ok);
        setReady(true);
        if (!ok) navigate(ROUTE_HOME);
      })
      .catch(() => {
        if (cancelled) return;
        setAllowed(false);
        setReady(true);
        navigate(ROUTE_HOME);
      });
    return () => {
      cancelled = true;
    };
  });

  return { ready, allowed };
}

export function AdminPage() {
  const { ready, allowed } = useAdminGate();

  return (
    <Show
      when={ready() && allowed()}
      fallback={
        <div class="px-4 py-8">
          <p class="text-sm text-muted-foreground">{t('auth.loading')}</p>
        </div>
      }
    >
      <div class="mx-auto max-w-3xl px-4 py-8">
        <Link href={ROUTE_HOME} class="text-sm text-[#3b6fa0]">
          {t('nav.home')}
        </Link>
        <h1 class="mt-3 text-3xl font-bold">{t('nav.admin')}</h1>
        <p class="mb-6 text-muted-foreground">Admin tools</p>
        <div class="grid gap-3 sm:grid-cols-2">
          <Link
            href={ROUTE_ADMIN_IMAGES}
            class="rounded-2xl border border-border bg-card p-5"
          >
            <h2 class="font-bold">{t('nav.contentImages')}</h2>
            <p class="text-sm text-muted-foreground">Manage city POI images</p>
          </Link>
          <Link
            href={ROUTE_ADMIN_AI_ENRICHMENT}
            class="rounded-2xl border border-border bg-card p-5"
          >
            <h2 class="font-bold">AI enrichment</h2>
            <p class="text-sm text-muted-foreground">City / POI enrichment jobs</p>
          </Link>
          <Link
            href={`${ROUTE_ADMIN}/users`}
            class="rounded-2xl border border-border bg-card p-5"
          >
            <h2 class="font-bold">Users</h2>
            <p class="text-sm text-muted-foreground">User administration</p>
          </Link>
          <Link
            href={`${ROUTE_ADMIN}/cities/create`}
            class="rounded-2xl border border-border bg-card p-5"
          >
            <h2 class="font-bold">Create city</h2>
            <p class="text-sm text-muted-foreground">Add covered destinations</p>
          </Link>
        </div>
      </div>
    </Show>
  );
}

export function AdminUsersPage() {
  const { ready, allowed } = useAdminGate();
  const [users, setUsers] = createSignal([]);
  const [stats, setStats] = createSignal(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [busyId, setBusyId] = createSignal('');

  const load = () => {
    setLoading(true);
    setError('');
    Promise.all([fetchAdminUsers(), fetchAdminUserStats()])
      .then(([usersData, statsData]) => {
        setUsers(
          Array.isArray(usersData)
            ? usersData
            : usersData?.users || usersData?.items || []
        );
        setStats(statsData);
      })
      .catch((err) => {
        setError(getErrorMessage(err));
        setUsers([]);
      })
      .finally(() => setLoading(false));
  };

  createEffect(() => {
    if (!ready() || !allowed()) return;
    load();
  });

  const toggleAdmin = async (user) => {
    const id = user.id;
    const roles = Array.isArray(user.roles)
      ? [...user.roles]
      : user.role
        ? [user.role]
        : ['user'];
    const next = roles.includes('admin')
      ? roles.filter((r) => r !== 'admin')
      : [...roles.filter((r) => r !== 'admin'), 'admin'];
    setBusyId(id);
    try {
      await updateAdminUserRoles(id, next.length ? next : ['user']);
      toast('Roles updated', { variant: 'success' });
      load();
    } catch (err) {
      toast(getErrorMessage(err), { variant: 'destructive' });
    } finally {
      setBusyId('');
    }
  };

  const removeUser = async (user) => {
    if (!window.confirm(`Delete user ${user.email || user.id}?`)) return;
    setBusyId(user.id);
    try {
      await deleteAdminUser(user.id);
      toast('User deleted', { variant: 'success' });
      load();
    } catch (err) {
      toast(getErrorMessage(err), { variant: 'destructive' });
    } finally {
      setBusyId('');
    }
  };

  return (
    <Show
      when={ready() && allowed()}
      fallback={
        <div class="px-4 py-8">
          <p class="text-sm text-muted-foreground">{t('auth.loading')}</p>
        </div>
      }
    >
      <div class="px-4 py-8">
        <Link href={ROUTE_ADMIN} class="text-sm text-[#3b6fa0]">
          {t('nav.admin')}
        </Link>
        <h1 class="mt-2 text-2xl font-bold">Users</h1>
        <Show when={stats()}>
          <p class="mt-1 text-sm text-muted-foreground">
            Total: {stats()?.total ?? stats()?.users ?? '—'} · Admins:{' '}
            {stats()?.admins ?? '—'}
          </p>
        </Show>
        <Show when={loading()}>
          <p class="mt-4 text-sm text-muted-foreground">{t('auth.loading')}</p>
        </Show>
        <Show when={error()}>
          <p class="mt-4 text-sm text-destructive">{error()}</p>
        </Show>
        <div class="mt-4 flex flex-col gap-2">
          <For each={users()} fallback={null}>
            {(user) => {
              const roles = Array.isArray(user.roles)
                ? user.roles.join(', ')
                : user.role || 'user';
              return (
                <div class="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
                  <div class="min-w-0 flex-1">
                    <p class="truncate font-medium">
                      {user.name || user.username || user.email || user.id}
                    </p>
                    <p class="text-xs text-muted-foreground">
                      {user.email} · {roles}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId() === user.id}
                    onClick={() => toggleAdmin(user)}
                  >
                    Toggle admin
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId() === user.id}
                    onClick={() => removeUser(user)}
                  >
                    Delete
                  </Button>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </Show>
  );
}

export function AdminImagesPage() {
  const { ready, allowed } = useAdminGate();
  const [cities, setCities] = createSignal([]);
  const [cityId, setCityId] = createSignal('');
  const [pois, setPois] = createSignal([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');

  createEffect(() => {
    if (!ready() || !allowed()) return;
    let cancelled = false;
    setLoading(true);
    fetchAdminCities()
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data)
          ? data
          : data?.cities || data?.items || [];
        setCities(list);
        if (list[0]?.id && !cityId()) setCityId(String(list[0].id));
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  });

  createEffect(() => {
    if (!ready() || !allowed()) return;
    const id = cityId();
    if (!id) {
      setPois([]);
      return;
    }
    let cancelled = false;
    fetchAdminPoisByCity(id)
      .then((data) => {
        if (cancelled) return;
        setPois(
          Array.isArray(data) ? data : data?.pois || data?.items || []
        );
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getErrorMessage(err));
          setPois([]);
        }
      });
    return () => {
      cancelled = true;
    };
  });

  return (
    <Show
      when={ready() && allowed()}
      fallback={
        <div class="px-4 py-8">
          <p class="text-sm text-muted-foreground">{t('auth.loading')}</p>
        </div>
      }
    >
      <div class="px-4 py-8">
        <Link href={ROUTE_ADMIN} class="text-sm text-[#3b6fa0]">
          {t('nav.admin')}
        </Link>
        <h1 class="mt-2 text-2xl font-bold">{t('nav.contentImages')}</h1>
        <Show when={loading()}>
          <p class="mt-2 text-sm text-muted-foreground">{t('auth.loading')}</p>
        </Show>
        <Show when={error()}>
          <p class="mt-2 text-sm text-destructive">{error()}</p>
        </Show>
        <div class="mt-4">
          <label class="mb-1 block text-sm text-muted-foreground">City</label>
          <select
            class="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm"
            value={cityId()}
            onChange={(e) => setCityId(e.target.value)}
          >
            <option value="">Select a city</option>
            <For each={cities()} fallback={null}>
              {(city) => (
                <option value={String(city.id)}>
                  {city.name || city.city || city.id}
                </option>
              )}
            </For>
          </select>
        </div>
        <div class="mt-4 flex flex-col gap-2">
          <For
            each={pois()}
            fallback={
              <p class="text-sm text-muted-foreground">No POIs for this city.</p>
            }
          >
            {(poi) => (
              <div class="rounded-xl border border-border bg-card px-4 py-3">
                <p class="font-medium">{poi.name || poi.title || poi.id}</p>
                <p class="text-xs text-muted-foreground">
                  {poi.category || ''} {poi.photoUrl || poi.imageUrl ? '· has image' : ''}
                </p>
              </div>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
}

export function AdminAiPage() {
  const { ready, allowed } = useAdminGate();
  const [stats, setStats] = createSignal(null);
  const [pois, setPois] = createSignal([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');

  createEffect(() => {
    if (!ready() || !allowed()) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchAiEnrichmentStats(), fetchAiEnrichmentPois()])
      .then(([statsData, poisData]) => {
        if (cancelled) return;
        setStats(statsData);
        setPois(
          Array.isArray(poisData) ? poisData : poisData?.pois || poisData?.items || []
        );
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  });

  return (
    <Show
      when={ready() && allowed()}
      fallback={
        <div class="px-4 py-8">
          <p class="text-sm text-muted-foreground">{t('auth.loading')}</p>
        </div>
      }
    >
      <div class="px-4 py-8">
        <Link href={ROUTE_ADMIN} class="text-sm text-[#3b6fa0]">
          {t('nav.admin')}
        </Link>
        <h1 class="mt-2 text-2xl font-bold">AI enrichment</h1>
        <Show when={loading()}>
          <p class="mt-2 text-sm text-muted-foreground">{t('auth.loading')}</p>
        </Show>
        <Show when={error()}>
          <p class="mt-2 text-sm text-destructive">{error()}</p>
        </Show>
        <Show when={stats()}>
          <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div class="rounded-xl border border-border bg-card p-3">
              <p class="text-xs text-muted-foreground">Total</p>
              <p class="text-xl font-bold">{stats()?.total ?? '—'}</p>
            </div>
            <div class="rounded-xl border border-border bg-card p-3">
              <p class="text-xs text-muted-foreground">Enriched</p>
              <p class="text-xl font-bold">{stats()?.enriched ?? '—'}</p>
            </div>
            <div class="rounded-xl border border-border bg-card p-3">
              <p class="text-xs text-muted-foreground">Pending</p>
              <p class="text-xl font-bold">{stats()?.pending ?? '—'}</p>
            </div>
            <div class="rounded-xl border border-border bg-card p-3">
              <p class="text-xs text-muted-foreground">Failed</p>
              <p class="text-xl font-bold">{stats()?.failed ?? '—'}</p>
            </div>
          </div>
        </Show>
        <div class="mt-4 flex flex-col gap-2">
          <For
            each={pois()}
            fallback={
              <p class="text-sm text-muted-foreground">No enrichment POIs.</p>
            }
          >
            {(poi) => (
              <div class="rounded-xl border border-border bg-card px-4 py-3">
                <p class="font-medium">{poi.name || poi.id}</p>
                <p class="text-xs text-muted-foreground">
                  {poi.status || poi.enrichmentStatus || '—'}
                </p>
              </div>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
}

export function AdminCitiesPage() {
  const { ready, allowed } = useAdminGate();
  const [cities, setCities] = createSignal([]);
  const [name, setName] = createSignal('');
  const [country, setCountry] = createSignal('');
  const [lat, setLat] = createSignal('');
  const [lng, setLng] = createSignal('');
  const [busy, setBusy] = createSignal(false);
  const [error, setError] = createSignal('');

  const loadCities = () => {
    fetchAdminCities()
      .then((data) => {
        setCities(
          Array.isArray(data) ? data : data?.cities || data?.items || []
        );
      })
      .catch((err) => setError(getErrorMessage(err)));
  };

  createEffect(() => {
    if (!ready() || !allowed()) return;
    loadCities();
  });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await createAdminManualPoi({
        name: name(),
        city: name(),
        country: country(),
        lat: Number(lat()) || undefined,
        lng: Number(lng()) || undefined,
        category: 'city',
        isCitySeed: true,
      });
      toast('City / POI created', { variant: 'success' });
      setName('');
      setCountry('');
      setLat('');
      setLng('');
      loadCities();
    } catch (err) {
      toast(getErrorMessage(err), { variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Show
      when={ready() && allowed()}
      fallback={
        <div class="px-4 py-8">
          <p class="text-sm text-muted-foreground">{t('auth.loading')}</p>
        </div>
      }
    >
      <div class="px-4 py-8">
        <Link href={ROUTE_ADMIN} class="text-sm text-[#3b6fa0]">
          {t('nav.admin')}
        </Link>
        <h1 class="mt-2 text-2xl font-bold">Create city</h1>
        <p class="mt-2 text-sm text-muted-foreground">
          Cities are created via the admin manual POI endpoint. Existing cities
          from the API are listed below.
        </p>
        <Show when={error()}>
          <p class="mt-2 text-sm text-destructive">{error()}</p>
        </Show>
        <form class="mt-4 flex max-w-md flex-col gap-3" onSubmit={submit}>
          <Input
            placeholder="City name"
            value={name()}
            onInput={(e) => setName(e.target.value)}
            required
          />
          <Input
            placeholder="Country"
            value={country()}
            onInput={(e) => setCountry(e.target.value)}
          />
          <div class="flex gap-2">
            <Input
              placeholder="Lat"
              value={lat()}
              onInput={(e) => setLat(e.target.value)}
            />
            <Input
              placeholder="Lng"
              value={lng()}
              onInput={(e) => setLng(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            class="coral-gradient border-0 text-white"
            disabled={busy()}
          >
            {busy() ? t('auth.loading') : 'Create via manual POI'}
          </Button>
        </form>
        <h2 class="mt-8 text-lg font-bold">Existing cities</h2>
        <div class="mt-3 flex flex-col gap-2">
          <For
            each={cities()}
            fallback={
              <p class="text-sm text-muted-foreground">No cities loaded.</p>
            }
          >
            {(city) => (
              <div class="rounded-xl border border-border bg-card px-4 py-3 text-sm">
                {city.name || city.city || city.id}
                <Show when={city.country}>
                  <span class="text-muted-foreground"> · {city.country}</span>
                </Show>
              </div>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
}

export function NotFoundPage() {
  return (
    <div class="px-4 py-16 text-center">
      <h1 class="text-3xl font-bold">404</h1>
      <p class="mb-4 text-muted-foreground">Page not found</p>
      <Link href={ROUTE_HOME}>
        <Button class="coral-gradient border-0 text-white">{t('nav.home')}</Button>
      </Link>
    </div>
  );
}
