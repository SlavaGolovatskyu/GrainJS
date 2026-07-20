import { createSignal, createEffect } from 'grainlet';
import { Link } from 'grainlet/route';
import {
  acceptInvitation,
  fetchPendingInvitations,
  fetchSharedWithMe,
  fetchTripStats,
  fetchTrips,
  isAuthenticated,
  useAuthUser,
  fetchMe,
} from '../api/client.js';
import { Button } from '../design-system/ui/button.jsx';
import { NotificationsPanel } from '../components/NotificationsPanel.jsx';
import { toast } from '../components/Toast.jsx';
import { t } from '../i18n/t.js';
import { getErrorMessage, normalizeList } from '../utils/errors.js';
import { resolveImageUrl, initialsFromName } from '../utils/images.js';
import {
  ROUTE_AUTH_SIGNIN,
  ROUTE_PLAN_NEW,
  ROUTE_SETTINGS,
  routePlanById,
} from '../constants/routes.js';
import {
  IconBell,
  IconCalendar,
  IconChevronRight,
  IconMapPin,
  IconPlus,
  IconSettings,
} from '../design-system/icons.jsx';

const TRIPS_DASHBOARD_STATUS_CLASS = {
  upcoming: 'bg-emerald-100 text-emerald-700',
  past: 'bg-gray-100 text-gray-500',
  planning: 'bg-orange-100 text-orange-600',
};

const FILTERS = [
  { key: 'all', labelKey: 'trips.filterAll' },
  { key: 'planning', labelKey: 'trips.filterPlanning' },
  { key: 'upcoming', labelKey: 'trips.filterUpcoming' },
  { key: 'past', labelKey: 'trips.filterPast' },
];

function tripStatus(trip) {
  const raw = String(trip.status || trip.dashboardStatus || 'planning').toLowerCase();
  if (raw.includes('upcom')) return 'upcoming';
  if (raw.includes('past') || raw.includes('complete')) return 'past';
  return 'planning';
}

function tripTitle(trip) {
  return trip.title || trip.city || trip.name || `Trip ${trip.id}`;
}

function RouteV2Wrapper(props) {
  const padded = props.padded !== false;
  const bleed = !!props.bleed;
  const extra = props.class || props.className || '';
  const body = props.children;
  return (
    <div class={`min-h-full bg-background ${padded ? 'py-8' : ''} ${extra}`}>
      {bleed ? body : <div class="mx-auto w-full max-w-5xl px-4">{body}</div>}
    </div>
  );
}

/**
 * Faithful port of TripsPageContentV2Layout + V2 molecules (same classes/structure).
 */
export function TripsPage() {
  const user = useAuthUser();
  const [scope, setScope] = createSignal('mine');
  const [filter, setFilter] = createSignal('all');
  const [owned, setOwned] = createSignal([]);
  const [shared, setShared] = createSignal([]);
  const [invites, setInvites] = createSignal([]);
  const [stats, setStats] = createSignal({ trips: 0, countries: 0, days: 0 });
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [notificationsOpen, setNotificationsOpen] = createSignal(false);

  createEffect(() => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.allSettled([
      fetchTrips(),
      fetchSharedWithMe().catch(() => []),
      fetchTripStats().catch(() => null),
      fetchPendingInvitations().catch(() => []),
      fetchMe().catch(() => null),
    ]).then(([tripsR, sharedR, statsR, invitesR]) => {
      if (cancelled) return;
      if (tripsR.status === 'fulfilled') {
        setOwned(
          normalizeList(tripsR.value, 'trips').length
            ? normalizeList(tripsR.value, 'trips')
            : normalizeList(tripsR.value, 'items')
        );
      } else {
        setError(getErrorMessage(tripsR.reason, t('trips.loadError')));
      }
      if (sharedR.status === 'fulfilled') {
        setShared(
          normalizeList(sharedR.value, 'trips').length
            ? normalizeList(sharedR.value, 'trips')
            : normalizeList(sharedR.value, 'items')
        );
      }
      if (invitesR.status === 'fulfilled') {
        setInvites(
          normalizeList(invitesR.value, 'invitations').length
            ? normalizeList(invitesR.value, 'invitations')
            : normalizeList(invitesR.value, 'items')
        );
      }
      if (statsR.status === 'fulfilled' && statsR.value) {
        const s = statsR.value;
        setStats({
          trips: s.trips ?? s.tripCount ?? owned().length,
          countries: s.countries ?? s.countryCount ?? 0,
          days: s.days ?? s.dayCount ?? 0,
        });
      } else {
        setStats((prev) => ({ ...prev, trips: owned().length }));
      }
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  });

  if (!isAuthenticated()) {
    return (
      <div class="px-5 py-10 text-center">
        <h1 class="mb-2 text-2xl font-bold">{t('trips.title')}</h1>
        <p class="mb-4 text-muted-foreground">{t('trips.signInPrompt')}</p>
        <Link href={ROUTE_AUTH_SIGNIN}>
          <Button class="coral-gradient border-0 text-white">{t('nav.signIn')}</Button>
        </Link>
      </div>
    );
  }

  const u = user() || {};
  const userName = u.name || u.displayName || u.username || t('trips.title');
  const userImage = resolveImageUrl(u.profileImageUrl || u.avatarUrl || '');
  const userInitial = initialsFromName(userName);

  const list =
    scope() === 'shared'
      ? shared()
      : scope() === 'pending'
        ? []
        : owned();

  const filtered = list.filter((trip) => {
    if (filter() === 'all') return true;
    return tripStatus(trip) === filter();
  });

  const showEmpty =
    !loading() &&
    ((scope() === 'pending' && invites().length === 0) ||
      (scope() !== 'pending' && filtered.length === 0));

  const statItems = [
    { label: t('trips.statTrips'), value: String(stats().trips || owned().length) },
    { label: t('trips.statCountries') || 'Countries', value: String(stats().countries || 0) },
    { label: t('trips.statDays') || 'Days', value: String(stats().days || 0) },
  ];

  const tabs = [
    { key: 'mine', label: t('trips.scopeMine') },
    { key: 'shared', label: t('trips.scopeShared') },
    { key: 'pending', label: t('trips.pendingInvitations') },
  ];

  return (
    <RouteV2Wrapper padded={false} bleed class="min-h-full bg-background">
      <div class="voyage-gradient pb-8 pt-12">
        <div class="mx-auto w-full max-w-5xl px-4">
          {/* TripsV2Header */}
          <div class="mb-6 flex items-center justify-between">
            <div class="flex items-center gap-3">
              {userImage ? (
                <img
                  src={userImage}
                  alt=""
                  class="h-11 w-11 rounded-full border-2 border-white/30 object-cover"
                />
              ) : (
                <div class="flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/30 bg-white/20 text-sm font-bold text-white">
                  {userInitial}
                </div>
              )}
              <div>
                <p class="text-xs font-medium text-white/70">{t('trips.welcomeBack')}</p>
                <p class="text-lg font-bold leading-tight text-white">{userName}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="glass relative flex h-10 w-10 items-center justify-center rounded-xl"
                aria-label={t('nav.notifications') || 'Notifications'}
                onClick={() => setNotificationsOpen(true)}
              >
                <IconBell size={18} class="text-white" />
              </button>
              <Link
                href={ROUTE_SETTINGS}
                class="glass flex h-10 w-10 items-center justify-center rounded-xl"
                aria-label={t('nav.settings') || 'Settings'}
              >
                <IconSettings size={18} class="text-white" />
              </Link>
            </div>
          </div>
          {notificationsOpen() ? (
            <NotificationsPanel
              hideTrigger
              open={true}
              onClose={() => setNotificationsOpen(false)}
            />
          ) : null}

          {/* TripsV2Stats */}
          <div class="grid grid-cols-3 gap-3">
            {statItems.map(({ label, value }) => (
              <div class="glass rounded-2xl p-3 text-center">
                <p class="text-xl font-bold text-white">{value}</p>
                <p class="mt-0.5 text-xs text-white/60">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div class="mx-auto w-full max-w-5xl px-4">
        {/* TripsV2ScopeTabs */}
        <div class="mb-4 mt-5 flex items-center rounded-2xl bg-muted p-1">
          {tabs.map(({ key, label }) => (
            <button
              type="button"
              onClick={() => setScope(key)}
              class={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
                scope() === key
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* TripsV2FilterBar */}
        {scope() !== 'pending' ? (
          <div class="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
            {FILTERS.map(({ key, labelKey }) => (
              <button
                type="button"
                onClick={() => setFilter(key)}
                class={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  filter() === key
                    ? 'bg-[#0f1b3d] text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        ) : null}

        {error() ? <p class="mb-3 text-sm text-destructive">{error()}</p> : null}
        {loading() ? (
          <p class="text-sm text-muted-foreground">{t('auth.loading')}</p>
        ) : null}

        {/* Pending invitations */}
        {scope() === 'pending'
          ? invites().map((inv) => (
              <div class="mb-3 flex items-center justify-between rounded-2xl border border-border bg-white p-4 shadow-sm">
                <div>
                  <p class="font-semibold">{inv.tripTitle || inv.city || inv.email}</p>
                  <p class="text-xs text-muted-foreground">
                    {inv.fromName || inv.inviterName || inv.email}
                  </p>
                </div>
                <Button
                  size="sm"
                  class="coral-gradient border-0 text-white"
                  onClick={async () => {
                    try {
                      await acceptInvitation(inv.id || inv.invitationId);
                      toast(t('trips.inviteAccepted') || 'Invitation accepted', {
                        variant: 'success',
                      });
                      setInvites((list) =>
                        list.filter((x) => (x.id || x.invitationId) !== (inv.id || inv.invitationId))
                      );
                    } catch (err) {
                      toast(getErrorMessage(err), { variant: 'destructive' });
                    }
                  }}
                >
                  {t('trips.acceptInvite') || 'Accept'}
                </Button>
              </div>
            ))
          : null}

        {/* Empty */}
        {showEmpty ? (
          <div class="py-12 text-center">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-muted">
              <IconMapPin size={28} class="text-muted-foreground" />
            </div>
            <p class="text-base font-bold text-foreground">{t('trips.noTripsTitle')}</p>
            <p class="mt-1 text-sm text-muted-foreground">{t('trips.noTripsSubtitle')}</p>
            {scope() === 'mine' ? (
              <Link href={ROUTE_PLAN_NEW} class="mt-4 block">
                <Button class="coral-gradient mt-4 rounded-xl border-0 px-6 py-5 font-semibold text-white">
                  {t('trips.emptyAction')}
                </Button>
              </Link>
            ) : null}
          </div>
        ) : null}

        {/* Trip list rows */}
        {scope() !== 'pending' ? (
          <div class="flex flex-col gap-3">
            {filtered.map((trip) => {
              const status = tripStatus(trip);
              const title = tripTitle(trip);
              const src = resolveImageUrl(
                trip.cityImageCdnUrl || trip.imageUrl || trip.coverImageUrl || ''
              );
              const statusLabel =
                status === 'upcoming'
                  ? t('trips.filterUpcoming')
                  : status === 'past'
                    ? t('trips.filterPast')
                    : t('trips.filterPlanning');
              const days = trip.durationDays || trip.days?.length || '—';
              return (
                <Link
                  href={routePlanById(trip.id)}
                  class="flex items-center gap-3 overflow-hidden rounded-2xl border border-border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div class="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {src ? (
                      <img src={src} alt={title} class="h-full w-full object-cover" />
                    ) : (
                      <div class="flex h-full w-full items-center justify-center">
                        <IconMapPin size={24} class="text-muted-foreground/40" aria-hidden="true" />
                      </div>
                    )}
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-start gap-2">
                      <div class="min-w-0 flex-1">
                        <h3 class="truncate text-base font-bold leading-tight text-foreground">
                          {title}
                        </h3>
                        {trip.notes ? (
                          <p class="mt-0.5 truncate text-xs text-muted-foreground">
                            {trip.notes}
                          </p>
                        ) : null}
                      </div>
                      <span
                        class={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold leading-none ${TRIPS_DASHBOARD_STATUS_CLASS[status]}`}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <div class="mt-2.5 flex items-center gap-3">
                      <div class="flex items-center gap-1">
                        <IconCalendar size={11} class="text-muted-foreground" />
                        <span class="text-xs text-muted-foreground">
                          {trip.startDate || t('trips.datesTbd')}
                        </span>
                      </div>
                      <div class="flex items-center gap-1">
                        <IconMapPin size={11} class="text-[#ff6b4a]" />
                        <span class="text-xs font-semibold text-[#ff6b4a]">{days}d</span>
                      </div>
                    </div>
                  </div>
                  <IconChevronRight size={16} class="shrink-0 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        ) : null}

        {/* Add trip CTA */}
        {scope() === 'mine' ? (
          <Link href={ROUTE_PLAN_NEW} class="mt-5 block">
            <div class="group flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-border p-4 transition-colors hover:border-[#ff6b4a]">
              <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-orange-50">
                <IconPlus
                  size={20}
                  class="text-muted-foreground transition-colors group-hover:text-[#ff6b4a]"
                />
              </div>
              <div>
                <p class="text-sm font-semibold text-foreground">{t('trips.addNewTrip')}</p>
                <p class="mt-0.5 text-xs text-muted-foreground">
                  {t('trips.noTripsSubtitle')}
                </p>
              </div>
            </div>
          </Link>
        ) : null}
        <div class="h-4" />
      </div>
    </RouteV2Wrapper>
  );
}
