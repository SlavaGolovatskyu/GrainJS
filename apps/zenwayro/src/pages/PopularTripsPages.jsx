import {
  createSignal,
  createEffect,
  Link,
  navigate,
  useParams,
  For,
  Show,
} from 'grainlet';
import {
  copyPopularTrip,
  fetchPopularCountries,
  fetchPopularTrip,
  fetchPopularTrips,
  isAuthenticated,
  likePopularTrip,
  ratePopularTrip,
} from '../api/client.js';
import { t } from '../i18n/t.js';
import {
  ROUTE_AUTH_SIGNIN,
  ROUTE_POPULAR_TRIPS,
  ROUTE_POPULAR_TRIPS_BROWSE,
  routePlanById,
  routePopularTripById,
} from '../constants/routes.js';
import { Button } from '../design-system/ui/button.jsx';
import { Input } from '../design-system/ui/input.jsx';
import { IconStar } from '../design-system/icons.jsx';
import { toast } from '../components/Toast.jsx';
import { getErrorMessage, normalizeList } from '../utils/errors.js';

function normalizePopularTripsPayload(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.trips)) return data.trips;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data.data)) return data.data;
  return normalizeList(data);
}

function tripCity(trip) {
  const raw = trip.city || trip.title || trip.name || 'Trip';
  return String(raw).charAt(0).toUpperCase() + String(raw).slice(1);
}

function normalizeCountries(data) {
  const list = Array.isArray(data)
    ? data
    : data?.countries || data?.items || [];
  return list
    .map((c) => {
      if (typeof c === 'string') return { name: c, count: 0, slug: c };
      return {
        name: c.name || c.country || c.label || '',
        count: c.count ?? c.tripCount ?? 0,
        slug: c.slug || c.countrySlug || c.name || '',
      };
    })
    .filter((c) => c.name)
    .sort((a, b) => a.name.localeCompare(b.name));
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
        setError(getErrorMessage(err, t('popularTrips.loadError')));
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

      <Show when={loading()}>
        <p class="text-sm text-muted-foreground">{t('popularTrips.loading')}</p>
      </Show>
      <Show when={error()}>
        <p class="mb-3 text-sm text-destructive">{error()}</p>
      </Show>
      <Show when={!loading() && !error() && filtered.length === 0}>
        <p class="text-sm text-muted-foreground">{t('popularTrips.emptyState')}</p>
      </Show>

      <p class="mb-3 text-sm text-muted-foreground">
        {t('popularTrips.communityTripsFound', {
          count: String(filtered.length),
        })}
      </p>

      <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
        <For each={filtered} fallback={null}>
          {(trip) => {
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
                <Show
                  when={hero}
                  fallback={
                    <div class="flex h-full items-center justify-center text-4xl font-bold text-white/40">
                      {city.charAt(0)}
                    </div>
                  }
                >
                  <img
                    src={hero}
                    alt={city}
                    class="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                </Show>
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
                    <Show when={trip.likeCount != null}>
                      <span>♥ {trip.likeCount}</span>
                    </Show>
                  </div>
                  <Show when={trip.authorName}>
                    <p class="mt-1 truncate text-[10px] text-white/60">
                      {t('popularTrips.byAuthor', { name: trip.authorName })}
                    </p>
                  </Show>
                </div>
              </Link>
            );
          }}
        </For>
      </div>
    </div>
  );
}

export function PopularTripDetailPage() {
  const params = useParams();
  const [trip, setTrip] = createSignal(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [busy, setBusy] = createSignal('');

  createEffect(() => {
    const id = params().id;
    if (!id) {
      setError(t('popularTrips.notFound'));
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchPopularTrip(id)
      .then((data) => {
        if (cancelled) return;
        setTrip(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getErrorMessage(err, t('popularTrips.notFound')));
        setTrip(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  });

  const onLike = async () => {
    const current = trip();
    if (!current?.id) return;
    if (!isAuthenticated()) {
      navigate(ROUTE_AUTH_SIGNIN);
      return;
    }
    setBusy('like');
    try {
      const data = await likePopularTrip(current.id);
      setTrip({
        ...current,
        likeCount: data?.likeCount ?? (current.likeCount || 0) + 1,
        viewerHasLiked: data?.viewerHasLiked ?? !current.viewerHasLiked,
      });
    } catch (err) {
      toast(getErrorMessage(err, t('popularTrips.likeFailed')), {
        variant: 'destructive',
      });
    } finally {
      setBusy('');
    }
  };

  const onRate = async (stars) => {
    const current = trip();
    if (!current?.id) return;
    if (!isAuthenticated()) {
      navigate(ROUTE_AUTH_SIGNIN);
      return;
    }
    setBusy('rate');
    try {
      const data = await ratePopularTrip(current.id, stars);
      setTrip({
        ...current,
        averageRating: data?.averageRating ?? stars,
        ratingCount: data?.ratingCount ?? (current.ratingCount || 0) + 1,
        viewerRating: { stars, comment: null },
      });
    } catch (err) {
      toast(getErrorMessage(err, t('plan.rateFailed')), {
        variant: 'destructive',
      });
    } finally {
      setBusy('');
    }
  };

  const onCopy = async () => {
    const current = trip();
    if (!current?.id) return;
    if (!isAuthenticated()) {
      navigate(ROUTE_AUTH_SIGNIN);
      return;
    }
    setBusy('copy');
    try {
      const data = await copyPopularTrip(current.id);
      const id = data?.id || data?.tripId || data?.trip?.id;
      toast(t('popularTrips.copyTripSuccess'), { variant: 'success' });
      if (id) navigate(routePlanById(id));
    } catch (err) {
      toast(getErrorMessage(err, t('popularTrips.copyTripError')), {
        variant: 'destructive',
      });
    } finally {
      setBusy('');
    }
  };

  return (
    <div class="px-4 py-6">
      <Show when={loading()}>
        <p class="text-sm text-muted-foreground">{t('popularTrips.loading')}</p>
      </Show>
      <Show when={!loading() && error()}>
        <div class="text-center">
          <p class="text-destructive">{error()}</p>
          <Link href={ROUTE_POPULAR_TRIPS} class="mt-4 inline-block text-sm text-[#3b6fa0]">
            {t('popularTrips.backToList')}
          </Link>
        </div>
      </Show>
      <Show when={!loading() && trip()}>
        {(current) => {
          const title = tripCity(current);
          const days = Array.isArray(current.days) ? current.days : [];
          const rating =
            current.averageRating != null
              ? Number(current.averageRating).toFixed(1)
              : '—';
          return (
            <>
              <Link href={ROUTE_POPULAR_TRIPS} class="text-sm text-[#3b6fa0]">
                {t('popularTrips.backToList')}
              </Link>
              <div class="mt-3 overflow-hidden rounded-2xl bg-[#1e3a5f]">
                <Show when={(current.cityImageCdnUrl || '').trim()}>
                  <img
                    src={current.cityImageCdnUrl}
                    alt={title}
                    class="h-40 w-full object-cover"
                  />
                </Show>
                <div class="p-4 text-white">
                  <h1 class="text-2xl font-bold">{title}</h1>
                  <p class="text-sm text-white/80">{current.country || ''}</p>
                  <p class="mt-1 text-xs text-white/70">
                    {current.durationDays === 1
                      ? t('popularTrips.daysSingular')
                      : t('popularTrips.daysTag', {
                          count: String(current.durationDays || days.length || 1),
                        })}
                    <Show when={current.authorName}>
                      <span>
                        {' '}
                        · {t('popularTrips.byAuthor', { name: current.authorName })}
                      </span>
                    </Show>
                  </p>
                </div>
              </div>

              <div class="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy() === 'like'}
                  onClick={onLike}
                >
                  ♥ {current.likeCount ?? 0}
                </Button>
                <span class="inline-flex items-center gap-1 text-sm">
                  <IconStar size={14} fill="#ff6b4a" class="text-[#ff6b4a]" />
                  {rating}
                </span>
                <Button
                  class="coral-gradient border-0 text-white"
                  size="sm"
                  disabled={busy() === 'copy'}
                  onClick={onCopy}
                >
                  {busy() === 'copy'
                    ? t('popularTrips.copyTripModalSubmitting')
                    : t('popularTrips.copyTrip')}
                </Button>
              </div>

              <div class="mt-4">
                <p class="mb-2 text-sm font-medium">{t('popularTrips.rateThisTrip')}</p>
                <div class="flex gap-1">
                  <For each={[1, 2, 3, 4, 5]}>
                    {(stars) => (
                      <button
                        type="button"
                        disabled={busy() === 'rate'}
                        class="rounded p-1 hover:bg-muted"
                        onClick={() => onRate(stars)}
                        aria-label={`${stars}`}
                      >
                        <IconStar
                          size={20}
                          fill={
                            (current.viewerRating?.stars || 0) >= stars
                              ? '#ff6b4a'
                              : 'none'
                          }
                          class="text-[#ff6b4a]"
                        />
                      </button>
                    )}
                  </For>
                </div>
                <Show when={!isAuthenticated()}>
                  <p class="mt-1 text-xs text-muted-foreground">
                    {t('popularTrips.signInToEngage')}
                  </p>
                </Show>
              </div>

              <h2 class="mt-6 text-lg font-bold">{t('popularTrips.itinerary')}</h2>
              <Show
                when={days.length > 0}
                fallback={
                  <p class="mt-2 text-sm text-muted-foreground">
                    {t('popularTrips.noItinerary')}
                  </p>
                }
              >
                <div class="mt-3 flex flex-col gap-4">
                  <For each={days}>
                    {(day) => (
                      <div class="rounded-2xl border border-border bg-card p-4">
                        <h3 class="mb-2 font-semibold">
                          {t('popularTrips.dayHeading', {
                            number: String(day.dayNumber ?? day.day ?? ''),
                          })}
                        </h3>
                        <For
                          each={day.places || []}
                          fallback={
                            <p class="text-sm text-muted-foreground">
                              {t('popularTrips.noPlacesForDay')}
                            </p>
                          }
                        >
                          {(place) => (
                            <div class="border-t border-border py-2 first:border-0">
                              <p class="text-sm font-medium">
                                {place.name || place.title}
                              </p>
                              <Show when={place.category}>
                                <p class="text-xs text-muted-foreground">
                                  {place.category}
                                </p>
                              </Show>
                            </div>
                          )}
                        </For>
                      </div>
                    )}
                  </For>
                </div>
              </Show>
            </>
          );
        }}
      </Show>
    </div>
  );
}

export function PopularBrowsePage() {
  const [countries, setCountries] = createSignal([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');

  createEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchPopularCountries()
      .then((data) => {
        if (cancelled) return;
        const list = normalizeCountries(data);
        if (list.length) {
          setCountries(list);
          return;
        }
        return fetchPopularTrips({ sort: 'likes', page: '1', limit: '100' }).then(
          (tripsData) => {
            if (cancelled) return;
            const trips = normalizePopularTripsPayload(tripsData);
            const map = new Map();
            trips.forEach((trip) => {
              if (trip.country) {
                map.set(trip.country, (map.get(trip.country) || 0) + 1);
              }
            });
            setCountries(
              [...map.entries()]
                .map(([name, count]) => ({ name, count, slug: name }))
                .sort((a, b) => a.name.localeCompare(b.name))
            );
          }
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getErrorMessage(err, t('popularTrips.loadError')));
        setCountries([]);
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
      <Show when={loading()}>
        <p class="text-sm text-muted-foreground">{t('popularTrips.loading')}</p>
      </Show>
      <Show when={error()}>
        <p class="mb-3 text-sm text-destructive">{error()}</p>
      </Show>
      <div class="flex flex-col gap-2">
        <For each={countries()} fallback={null}>
          {(c) => (
            <Link
              href={`${ROUTE_POPULAR_TRIPS}?country=${encodeURIComponent(c.slug || c.name)}`}
              class="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 font-medium"
            >
              <span>{c.name}</span>
              <span class="text-sm text-muted-foreground">
                {t('popularTrips.browseCountriesTripCount', {
                  count: String(c.count),
                })}
              </span>
            </Link>
          )}
        </For>
      </div>
    </div>
  );
}
