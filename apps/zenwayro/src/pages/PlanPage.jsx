import { createSignal, createEffect, useParams, Link } from 'grainlet';
import { MapView } from '../components/MapView.jsx';
import { Button } from '../design-system/ui/button.jsx';
import {
  addTripDay,
  autofillTripDay,
  fetchSharedTrip,
  fetchTrip,
  removeTripDayPlace,
  reorderTripDay,
  shareTrip,
} from '../api/client.js';
import { t } from '../i18n/t.js';
import { CITY_MAP_ZOOM } from '../constants/product.js';
import {
  ROUTE_EXPLORE,
  ROUTE_TRIPS,
  routeSharedPlanBySlug,
} from '../constants/routes.js';
import { cn } from '../design-system/utils/cn.js';
import { toast } from '../components/Toast.jsx';
import { getErrorMessage } from '../utils/errors.js';
import { TripGenerationWizardV2 } from './plan/TripGenerationWizardV2.jsx';

function normalizePlace(p) {
  return {
    id: p.id || p.poiId,
    name: p.name || p.title || 'Place',
    lng: p.lng ?? p.longitude ?? p.lon,
    lat: p.lat ?? p.latitude,
  };
}

function normalizeTrip(data) {
  if (!data) return null;
  const city = data.city || data.title || data.name || 'Trip';
  const centerLng =
    data.centerLng ?? data.lng ?? (Array.isArray(data.center) ? data.center[0] : null);
  const centerLat =
    data.centerLat ?? data.lat ?? (Array.isArray(data.center) ? data.center[1] : null);
  const rawDays = Array.isArray(data.days) ? data.days : [];
  const days = rawDays.map((d, i) => {
    const dayNumber = d.dayNumber ?? d.day ?? i + 1;
    const places = (d.places || d.pois || [])
      .map(normalizePlace)
      .filter((p) => p.lng != null && p.lat != null);
    return {
      id: d.id || `d${dayNumber}`,
      dayNumber,
      label:
        d.label ||
        t('popularTrips.dayHeading', { number: String(dayNumber) }),
      places,
      routeGeometry: d.routeGeometry || d.geometry || null,
    };
  });
  return {
    ...data,
    id: data.id || data.tripId,
    city,
    center:
      centerLng != null && centerLat != null
        ? [centerLng, centerLat]
        : days[0]?.places?.[0]
          ? [days[0].places[0].lng, days[0].places[0].lat]
          : [-9.1393, 38.7223],
    days,
  };
}

function buildShareUrl(result) {
  if (result?.shareUrl) return result.shareUrl;
  if (result?.url) return result.url;
  const slug = result?.slug || result?.shareSlug;
  if (slug) {
    return `${window.location.origin}/zenwayro${routeSharedPlanBySlug(slug)}`;
  }
  return '';
}

export function PlanPage() {
  const params = useParams();
  const search = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  );
  const cityIdParam = search.get('cityId') || '';
  const cityParam = search.get('city') || '';
  const [activeDay, setActiveDay] = createSignal(0);
  const [itinerary, setItinerary] = createSignal(null);
  const [dragIndex, setDragIndex] = createSignal(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [busy, setBusy] = createSignal('');
  const [shareUrl, setShareUrl] = createSignal('');

  const loadTrip = async (tripId) => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchTrip(tripId);
      const normalized = normalizeTrip(data);
      if (!normalized) throw new Error(t('plan.failedToLoad'));
      setItinerary(normalized);
      setActiveDay((i) =>
        Math.min(i, Math.max(0, (normalized.days?.length || 1) - 1))
      );
    } catch (err) {
      setError(getErrorMessage(err, t('plan.failedToLoad')));
      setItinerary(null);
      toast(getErrorMessage(err, t('plan.failedToLoad')), {
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    const id = params().id || 'new';
    if (id === 'new') {
      setLoading(false);
      return;
    }
    let cancelled = false;
    loadTrip(id).then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  });

  const id = params().id || 'new';

  if (id === 'new') {
    return (
      <TripGenerationWizardV2 city={cityParam} cityId={cityIdParam} />
    );
  }

  if (loading() && !itinerary()) {
    return (
      <div class="px-4 py-8">
        <p class="text-sm text-muted-foreground">{t('auth.loading')}</p>
      </div>
    );
  }

  if (!itinerary()) {
    return (
      <div class="px-4 py-8">
        <h1 class="mb-2 text-xl font-bold">{t('plan.noTripFound')}</h1>
        <p class="mb-4 text-sm text-destructive">{error()}</p>
        <Link href={ROUTE_TRIPS}>
          <Button class="rounded-2xl coral-gradient border-0 text-white">
            {t('nav.allTrips')}
          </Button>
        </Link>
      </div>
    );
  }

  const trip = itinerary();
  const day = trip.days[activeDay()] || trip.days[0];
  const dayNumber = day?.dayNumber ?? activeDay() + 1;
  const places = day?.places || [];

  const onDrop = async (toIndex) => {
    const from = dragIndex();
    if (from == null || from === toIndex) return;
    const list = [...places];
    const [item] = list.splice(from, 1);
    list.splice(toIndex, 0, item);
    setDragIndex(null);

    setItinerary({
      ...trip,
      days: trip.days.map((d, i) =>
        i === activeDay() ? { ...d, places: list } : d
      ),
    });

    setBusy('reorder');
    try {
      await reorderTripDay(
        id,
        dayNumber,
        list.map((p) => p.id)
      );
      await loadTrip(id);
    } catch (err) {
      toast(getErrorMessage(err, t('plan.movePlaceFailed')), {
        variant: 'destructive',
      });
      await loadTrip(id);
    } finally {
      setBusy('');
    }
  };

  const runAutofill = async () => {
    setBusy('autofill');
    try {
      await autofillTripDay(id, dayNumber);
      await loadTrip(id);
      toast(t('plan.autofillDay'), { variant: 'success' });
    } catch (err) {
      toast(getErrorMessage(err, t('plan.autofillDayFailed')), {
        variant: 'destructive',
      });
    } finally {
      setBusy('');
    }
  };

  const runAddDay = async () => {
    setBusy('addDay');
    try {
      await addTripDay(id, false);
      await loadTrip(id);
      setActiveDay((itinerary()?.days?.length || 1) - 1);
    } catch (err) {
      toast(getErrorMessage(err, t('plan.addDayFailed')), {
        variant: 'destructive',
      });
    } finally {
      setBusy('');
    }
  };

  const runRemovePlace = async (placeId) => {
    setBusy(`remove-${placeId}`);
    try {
      await removeTripDayPlace(id, dayNumber, placeId);
      await loadTrip(id);
    } catch (err) {
      toast(getErrorMessage(err, t('plan.removePlaceFailed')), {
        variant: 'destructive',
      });
    } finally {
      setBusy('');
    }
  };

  const runShare = async () => {
    setBusy('share');
    try {
      const result = await shareTrip(id);
      const url = buildShareUrl(result);
      setShareUrl(url);
      if (url) {
        toast(url, { duration: 6000 });
      } else {
        toast('Share link created', { variant: 'success' });
      }
    } catch (err) {
      toast(getErrorMessage(err, 'Could not share trip'), {
        variant: 'destructive',
      });
    } finally {
      setBusy('');
    }
  };

  const copyShare = async () => {
    const url = shareUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied', { variant: 'success' });
    } catch {
      toast(url, { duration: 6000 });
    }
  };

  return (
    <div class="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
      <div class="flex w-full shrink-0 flex-col border-b border-border bg-card lg:w-[28rem] lg:border-b-0 lg:border-r">
        <div class="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <Link href={ROUTE_TRIPS} class="text-xs text-[#3b6fa0]">
              {t('nav.allTrips')}
            </Link>
            <h1 class="text-lg font-bold">{trip.city}</h1>
            <p class="text-xs text-muted-foreground">
              {t('plan.stopsCount', { count: String(places.length) })}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2 border-b border-border px-3 py-2">
          <Button
            size="sm"
            class="rounded-xl coral-gradient border-0 text-white"
            disabled={busy() === 'autofill'}
            onClick={runAutofill}
          >
            {busy() === 'autofill'
              ? t('plan.autofillingDay')
              : t('plan.autofillDay')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            class="rounded-xl"
            disabled={busy() === 'addDay'}
            onClick={runAddDay}
          >
            {busy() === 'addDay' ? t('plan.addDayLoading') : t('plan.addDay')}
          </Button>
          <Button
            size="sm"
            variant="outline"
            class="rounded-xl"
            disabled={busy() === 'share'}
            onClick={runShare}
          >
            Share
          </Button>
        </div>

        {shareUrl() ? (
          <div class="border-b border-border px-3 py-2">
            <p class="mb-1 truncate text-xs text-muted-foreground">{shareUrl()}</p>
            <Button size="sm" variant="outline" class="rounded-xl" onClick={copyShare}>
              Copy link
            </Button>
          </div>
        ) : null}

        <div class="flex gap-1 overflow-x-auto border-b border-border px-2 py-2">
          {trip.days.map((d, i) => (
            <button
              type="button"
              class={cn(
                'shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold',
                activeDay() === i
                  ? 'bg-[#ff6b4a] text-white'
                  : 'bg-muted text-muted-foreground'
              )}
              onClick={() => setActiveDay(i)}
            >
              {d.label}
            </button>
          ))}
        </div>

        {error() ? (
          <p class="px-4 pt-2 text-xs text-destructive">{error()}</p>
        ) : null}

        <div class="flex-1 overflow-auto p-3">
          <p class="mb-2 text-sm font-semibold">{t('plan.itineraryHeading')}</p>
          <div class="flex flex-col gap-2">
            {places.map((place, index) => (
              <div
                class="cursor-grab rounded-2xl border border-border bg-background p-3 active:cursor-grabbing"
                draggable="true"
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(index)}
              >
                <div class="flex items-center gap-3">
                  <span class="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f1b3d] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-medium">{place.name}</p>
                    {place.lat != null && place.lng != null ? (
                      <p class="text-xs text-muted-foreground">
                        {Number(place.lat).toFixed(3)}, {Number(place.lng).toFixed(3)}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    class="shrink-0 text-destructive"
                    disabled={busy() === `remove-${place.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      runRemovePlace(place.id);
                    }}
                  >
                    {t('placeCard.remove')}
                  </Button>
                </div>
              </div>
            ))}
            {places.length === 0 ? (
              <p class="text-sm text-muted-foreground">
                {t('popularTrips.noPlacesForDay')}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div class="min-h-[40vh] flex-1 lg:min-h-0">
        <MapView
          center={trip.center}
          zoom={CITY_MAP_ZOOM}
          places={places}
          class="h-full w-full map-fullscreen-with-list"
        />
      </div>
    </div>
  );
}

export function SharedPlanPage() {
  const params = useParams();
  const [trip, setTrip] = createSignal(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal('');
  const [activeDay, setActiveDay] = createSignal(0);
  const [slug, setSlug] = createSignal('');

  createEffect(() => {
    const nextSlug = params().slug || params().id || '';
    setSlug(nextSlug);
    if (!nextSlug) {
      setLoading(false);
      setError(t('sharedPlan.notFound'));
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchSharedTrip(nextSlug)
      .then((data) => {
        if (cancelled) return;
        const normalized = normalizeTrip(data);
        if (!normalized) throw new Error(t('sharedPlan.tripNotFound'));
        setTrip(normalized);
      })
      .catch((err) => {
        if (cancelled) return;
        setTrip(null);
        setError(getErrorMessage(err, t('sharedPlan.notFound')));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  });

  const copyLink = async () => {
    const url = `${window.location.origin}/zenwayro${routeSharedPlanBySlug(slug())}`;
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied', { variant: 'success' });
    } catch {
      toast(url, { duration: 6000 });
    }
  };

  if (loading()) {
    return (
      <div class="px-4 py-8">
        <p class="text-sm text-muted-foreground">{t('auth.loading')}</p>
      </div>
    );
  }

  if (!trip()) {
    return (
      <div class="px-4 py-8">
        <h1 class="mb-2 text-xl font-bold">{t('sharedPlan.notFound')}</h1>
        <p class="mb-4 text-sm text-muted-foreground">{error()}</p>
        <Link href={ROUTE_EXPLORE}>
          <Button class="rounded-2xl coral-gradient border-0 text-white">
            {t('sharedPlan.createYourOwn')}
          </Button>
        </Link>
      </div>
    );
  }

  const data = trip();
  const day = data.days[activeDay()] || data.days[0];
  const places = day?.places || [];
  const dayCount = data.days.length;

  return (
    <div class="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
      <div class="flex w-full shrink-0 flex-col border-b border-border bg-card lg:w-[28rem] lg:border-b-0 lg:border-r">
        <div class="border-b border-border px-4 py-3">
          <p class="text-xs text-muted-foreground">
            {t('sharedPlan.banner', {
              city: data.city,
              count: String(dayCount),
              plural: dayCount === 1 ? '' : 's',
            })}
          </p>
          <h1 class="text-lg font-bold">{data.city}</h1>
          <div class="mt-2 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              class="rounded-xl"
              onClick={copyLink}
            >
              Copy link
            </Button>
            <Link href={ROUTE_EXPLORE}>
              <Button size="sm" class="rounded-xl coral-gradient border-0 text-white">
                {t('sharedPlan.createYourOwn')}
              </Button>
            </Link>
          </div>
        </div>

        <div class="flex gap-1 overflow-x-auto border-b border-border px-2 py-2">
          {data.days.map((d, i) => (
            <button
              type="button"
              class={cn(
                'shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold',
                activeDay() === i
                  ? 'bg-[#ff6b4a] text-white'
                  : 'bg-muted text-muted-foreground'
              )}
              onClick={() => setActiveDay(i)}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div class="flex-1 overflow-auto p-3">
          <p class="mb-2 text-sm font-semibold">{t('plan.itineraryHeading')}</p>
          <div class="flex flex-col gap-2">
            {places.map((place, index) => (
              <div class="rounded-2xl border border-border bg-background p-3">
                <div class="flex items-center gap-3">
                  <span class="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f1b3d] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p class="text-sm font-medium">{place.name}</p>
                    {place.lat != null && place.lng != null ? (
                      <p class="text-xs text-muted-foreground">
                        {Number(place.lat).toFixed(3)}, {Number(place.lng).toFixed(3)}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
            {places.length === 0 ? (
              <p class="text-sm text-muted-foreground">
                {t('popularTrips.noPlacesForDay')}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div class="min-h-[40vh] flex-1 lg:min-h-0">
        <MapView
          center={data.center}
          zoom={CITY_MAP_ZOOM}
          places={places}
          class="h-full w-full map-fullscreen-with-list"
        />
      </div>
    </div>
  );
}
