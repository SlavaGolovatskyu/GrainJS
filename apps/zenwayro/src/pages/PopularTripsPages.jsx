import { createSignal, createEffect, Link, useParams } from 'grain';
import { fetchPopularTrips } from '../api/client.js';
import { t } from '../i18n/t.js';
import {
  ROUTE_POPULAR_TRIPS,
  ROUTE_POPULAR_TRIPS_BROWSE,
  routePlanById,
  routePopularTripById,
} from '../constants/routes.js';
import { Button } from '../design-system/ui/button.jsx';
import { Input } from '../design-system/ui/input.jsx';
import { IconStar } from '../design-system/icons.jsx';

function normalizePopularTripsPayload(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.trips)) return data.trips;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data)) return data.data;
  return [];
}

function tripCity(trip) {
  const raw = trip.city || trip.title || trip.name || 'Trip';
  return String(raw).charAt(0).toUpperCase() + String(raw).slice(1);
}

export function PopularTripsPage() {
  const [trips, setTrips] = createSignal([]);
  const [total, setTotal] = createSignal(0);
  const [query, setQuery] = createSignal('');
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');

  createEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const country = new URLSearchParams(window.location.search).get('country');
    const params = {
      sort: 'likes',
      page: '1',
      limit: '12',
    };
    if (country) params.countrySlug = country.toLowerCase();

    fetchPopularTrips(params)
      .then((data) => {
        if (cancelled) return;
        const list = normalizePopularTripsPayload(data);
        setTrips(list);
        setTotal(data?.total ?? list.length);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || t('popularTrips.loadError'));
        setTrips([]);
        setTotal(0);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  });

  const filtered = trips().filter((trip) => {
    const q = query().trim().toLowerCase();
    if (!q) return true;
    return (
      String(trip.city || '').toLowerCase().includes(q) ||
      String(trip.country || '').toLowerCase().includes(q) ||
      String(trip.title || '').toLowerCase().includes(q) ||
      String(trip.authorName || '').toLowerCase().includes(q)
    );
  });

  return (
    <div class="px-4 pb-8 pt-4">
      <div class="mb-4 sticky top-0 z-10 bg-background/95 pb-3 backdrop-blur">
        <h1 class="text-2xl font-bold">{t('popularTrips.communityTitle')}</h1>
        <p class="mb-3 text-sm text-muted-foreground">{t('popularTrips.subtitle')}</p>
        <Input
          type="search"
          placeholder={t('popularTrips.communitySearchPlaceholder')}
          value={query()}
          onInput={(e) => setQuery(e.target.value)}
        />
        <div class="mt-3 flex gap-2">
          <Link href={ROUTE_POPULAR_TRIPS_BROWSE}>
            <Button variant="outline" size="sm">
              {t('popularTrips.browseAllCountries', {
                count: String(Math.max(total(), filtered.length) || '—'),
              })}
            </Button>
          </Link>
        </div>
      </div>

      {loading() ? (
        <p class="text-sm text-muted-foreground">{t('popularTrips.loading')}</p>
      ) : null}
      {error() ? <p class="mb-3 text-sm text-destructive">{error()}</p> : null}

      {!loading() && !error() && filtered.length === 0 ? (
        <p class="text-sm text-muted-foreground">{t('popularTrips.emptyState')}</p>
      ) : null}

      <p class="mb-3 text-sm text-muted-foreground">
        {t('popularTrips.communityTripsFound', {
          count: String(filtered.length),
        })}
      </p>

      <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
        {filtered.map((trip) => {
          const city = tripCity(trip);
          const hero = (trip.cityImageCdnUrl || trip.imageUrl || '').trim();
          const rating =
            trip.averageRating != null
              ? Number(trip.averageRating).toFixed(1)
              : trip.rating != null
                ? String(trip.rating)
                : '—';
          const days = trip.durationDays || 1;
          return (
            <Link
              href={routePopularTripById(trip.id)}
              class="relative aspect-[4/5] overflow-hidden rounded-3xl bg-[#1e3a5f] shadow-md"
            >
              {hero ? (
                <img
                  src={hero}
                  alt={city}
                  class="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div class="flex h-full items-center justify-center text-4xl font-bold text-white/40">
                  {city.charAt(0)}
                </div>
              )}
              <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div class="absolute left-3 top-3">
                <span class="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                  {days === 1
                    ? t('popularTrips.daysSingular')
                    : t('popularTrips.communityDurationBadge', {
                        count: String(days),
                      })}
                </span>
              </div>
              <div class="absolute bottom-0 left-0 right-0 p-3 text-white">
                <p class="font-bold">{city}</p>
                <p class="text-xs text-white/70">{trip.country || ''}</p>
                <div class="mt-1 flex items-center gap-2 text-xs">
                  <span class="inline-flex items-center gap-0.5">
                    <IconStar size={12} fill="#ff6b4a" class="text-[#ff6b4a]" />
                    {rating}
                  </span>
                  {trip.likeCount != null ? (
                    <span>♥ {trip.likeCount}</span>
                  ) : null}
                </div>
                {trip.authorName ? (
                  <p class="mt-1 truncate text-[10px] text-white/60">
                    {t('popularTrips.byAuthor', { name: trip.authorName })}
                  </p>
                ) : null}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function PopularTripDetailPage() {
  const params = useParams();
  const id = params().id || params().segments || 'trip';

  return (
    <div class="px-4 py-6">
      <Link href={ROUTE_POPULAR_TRIPS} class="text-sm text-[#3b6fa0]">
        {t('popularTrips.backToList')}
      </Link>
      <h1 class="mt-3 text-2xl font-bold capitalize">{String(id)}</h1>
      <p class="mt-2 text-muted-foreground">{t('popularTrips.itinerary')}</p>
      <div class="mt-4 rounded-2xl border border-border bg-card p-4">
        <p class="text-sm text-muted-foreground">{t('popularTrips.noItinerary')}</p>
        <Link href={routePlanById(String(id))} class="mt-4 inline-block">
          <Button class="coral-gradient border-0 text-white">
            {t('popularTrips.copyTrip')}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function PopularBrowsePage() {
  const [countries, setCountries] = createSignal([]);
  const [loading, setLoading] = createSignal(true);

  createEffect(() => {
    let cancelled = false;
    fetchPopularTrips({ sort: 'likes', page: '1', limit: '100' })
      .then((data) => {
        if (cancelled) return;
        const list = normalizePopularTripsPayload(data);
        const set = new Map();
        list.forEach((trip) => {
          if (trip.country) {
            set.set(trip.country, (set.get(trip.country) || 0) + 1);
          }
        });
        setCountries(
          [...set.entries()]
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      })
      .catch(() => {
        if (!cancelled) setCountries([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  });

  return (
    <div class="px-4 py-6">
      <h1 class="text-2xl font-bold">{t('popularTrips.browseCountriesTitle')}</h1>
      <p class="mb-4 text-sm text-muted-foreground">
        {t('popularTrips.browseCountriesSubtitle', {
          count: String(countries().length),
        })}
      </p>
      {loading() ? (
        <p class="text-sm text-muted-foreground">{t('popularTrips.loading')}</p>
      ) : null}
      <div class="flex flex-col gap-2">
        {countries().map((c) => (
          <Link
            href={`${ROUTE_POPULAR_TRIPS}?country=${encodeURIComponent(c.name)}`}
            class="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 font-medium"
          >
            <span>{c.name}</span>
            <span class="text-sm text-muted-foreground">
              {t('popularTrips.browseCountriesTripCount', {
                count: String(c.count),
              })}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
