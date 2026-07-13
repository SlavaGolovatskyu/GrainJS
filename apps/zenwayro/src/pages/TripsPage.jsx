import {
  createComponent,
  createSignal,
  createEffect,
  A,
} from '../../../../index.js';
import { fetchTrips, isAuthenticated } from '../api/client.js';
import { Button } from '../design-system/ui/button.jsx';
import { t } from '../i18n/t.js';
import {
  ROUTE_AUTH_SIGNIN,
  ROUTE_PLAN_NEW,
  routePlanById,
} from '../constants/routes.js';
import { IconChevronRight } from '../design-system/icons.jsx';

export const TripsPage = createComponent(function TripsPage() {
  const [trips, setTrips] = createSignal([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal('');

  createEffect(() => {
    if (!isAuthenticated()) return;
    let cancelled = false;
    setLoading(true);
    fetchTrips()
      .then((data) => {
        if (cancelled) return;
        setTrips(Array.isArray(data) ? data : data?.trips || []);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || t('trips.loadError'));
        setTrips([
          {
            id: 'demo',
            city: 'Lisbon',
            title: 'Weekend in Lisbon',
            status: 'planning',
            durationDays: 2,
          },
        ]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
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
        <A href={ROUTE_AUTH_SIGNIN}>
          <Button class="coral-gradient border-0 text-white">{t('nav.signIn')}</Button>
        </A>
      </div>
    );
  }

  return (
    <div class="px-4 pb-8">
      <div class="voyage-gradient -mx-4 mb-6 rounded-b-3xl px-5 pb-6 pt-8 text-white">
        <p class="text-sm text-white/70">{t('trips.welcomeBack')}</p>
        <h1 class="text-3xl font-bold">{t('trips.title')}</h1>
        <div class="mt-4 flex gap-6">
          <div>
            <p class="text-2xl font-bold">{trips().length}</p>
            <p class="text-xs text-white/60">{t('trips.statTrips')}</p>
          </div>
        </div>
      </div>

      {loading() ? <p class="text-sm text-muted-foreground">{t('auth.loading')}</p> : null}
      {error() ? <p class="mb-3 text-sm text-destructive">{error()}</p> : null}

      {!loading() && trips().length === 0 ? (
        <div class="rounded-2xl border border-dashed border-border p-8 text-center">
          <h2 class="text-lg font-bold">{t('trips.noTripsTitle')}</h2>
          <p class="mb-4 text-sm text-muted-foreground">{t('trips.noTripsSubtitle')}</p>
          <A href={ROUTE_PLAN_NEW}>
            <Button class="coral-gradient border-0 text-white">{t('trips.emptyAction')}</Button>
          </A>
        </div>
      ) : null}

      <div class="flex flex-col gap-3">
        {trips().map((trip) => {
          const title =
            trip.title ||
            trip.city ||
            trip.name ||
            `Trip ${trip.id}`;
          const city = trip.city || title;
          return (
            <A
              href={routePlanById(trip.id)}
              class="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#1e3a5f] text-2xl font-bold text-white">
                {String(city).charAt(0).toUpperCase()}
              </div>
              <div class="min-w-0 flex-1">
                <h3 class="truncate font-bold text-foreground">{title}</h3>
                <p class="text-xs text-muted-foreground">
                  {trip.status || t('trips.filterPlanning')} ·{' '}
                  {trip.durationDays
                    ? t('trips.daysTag', { count: String(trip.durationDays) })
                    : t('trips.datesTbd')}
                </p>
              </div>
              <IconChevronRight size={18} class="text-muted-foreground" />
            </A>
          );
        })}
      </div>

      <div class="mt-6">
        <A href={ROUTE_PLAN_NEW}>
          <Button class="w-full rounded-2xl coral-gradient border-0 py-6 text-white">
            {t('trips.addNewTrip')}
          </Button>
        </A>
      </div>
    </div>
  );
});
