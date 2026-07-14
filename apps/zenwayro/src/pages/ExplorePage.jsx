import { createSignal, createEffect, onCleanup, Link } from 'grain';
import { MapView } from '../components/MapView.jsx';
import { Button } from '../design-system/ui/button.jsx';
import { Input } from '../design-system/ui/input.jsx';
import { Skeleton } from '../design-system/ui/misc.jsx';
import { t } from '../i18n/t.js';
import {
  CITY_MAP_ZOOM,
  EUROPE_MAP_CENTER,
  EUROPE_MAP_ZOOM,
} from '../constants/product.js';
import { ROUTE_AUTH_SIGNIN, ROUTE_PLAN_NEW } from '../constants/routes.js';
import { isAuthenticated, searchCities } from '../api/client.js';

const COVERED_CITIES = [
  { id: 'lisbon', name: 'Lisbon', lng: -9.1393, lat: 38.7223 },
  { id: 'paris', name: 'Paris', lng: 2.3522, lat: 48.8566 },
  { id: 'rome', name: 'Rome', lng: 12.4964, lat: 41.9028 },
  { id: 'barcelona', name: 'Barcelona', lng: 2.1734, lat: 41.3851 },
  { id: 'amsterdam', name: 'Amsterdam', lng: 4.9041, lat: 52.3676 },
  { id: 'berlin', name: 'Berlin', lng: 13.405, lat: 52.52 },
  { id: 'vienna', name: 'Vienna', lng: 16.3738, lat: 48.2082 },
  { id: 'prague', name: 'Prague', lng: 14.4378, lat: 50.0755 },
];

export function ExplorePage() {
  const [query, setQuery] = createSignal('');
  const [selected, setSelected] = createSignal(null);
  const [pickedPlace, setPickedPlace] = createSignal(null);
  const [remoteCities, setRemoteCities] = createSignal([]);
  const [searching, setSearching] = createSignal(false);
  const [searchError, setSearchError] = createSignal('');

  createEffect(() => {
    const q = query().trim();
    if (q.length < 2) {
      setRemoteCities([]);
      setSearchError('');
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      setSearching(true);
      searchCities(q)
        .then((data) => {
          if (cancelled) return;
          const list = Array.isArray(data) ? data : data?.cities || [];
          setRemoteCities(
            list.map((c) => ({
              id: c.id || c.slug || c.name,
              name: c.name || c.city,
              lng: c.lng ?? c.centerLng ?? c.longitude,
              lat: c.lat ?? c.centerLat ?? c.latitude,
            }))
          );
        })
        .catch((err) => {
          if (cancelled) return;
          setSearchError(err.message || t('explore.searchFailed'));
          setRemoteCities([]);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 300);
    onCleanup(() => {
      cancelled = true;
      clearTimeout(timer);
    });
  });

  const q = query().trim().toLowerCase();
  const local = COVERED_CITIES.filter(
    (c) => !q || c.name.toLowerCase().includes(q)
  );
  const cities =
    remoteCities().length > 0
      ? remoteCities().filter((c) => c.lng != null && c.lat != null)
      : local;

  const city = selected();
  const center = city ? [city.lng, city.lat] : EUROPE_MAP_CENTER;
  const zoom = city ? CITY_MAP_ZOOM : EUROPE_MAP_ZOOM;
  const places = city
    ? [
        {
          id: '1',
          lng: city.lng + 0.01,
          lat: city.lat + 0.01,
          name: 'Landmark A',
        },
        {
          id: '2',
          lng: city.lng - 0.01,
          lat: city.lat + 0.005,
          name: 'Cafe B',
        },
        {
          id: '3',
          lng: city.lng + 0.005,
          lat: city.lat - 0.008,
          name: 'Museum C',
        },
      ]
    : COVERED_CITIES.map((c) => ({
        id: c.id,
        lng: c.lng,
        lat: c.lat,
        name: c.name,
        isCity: true,
      }));

  return (
    <div class="relative flex h-[calc(100vh-8rem)] flex-col md:flex-row">
      <aside class="z-10 max-h-[40vh] w-full overflow-auto border-b border-border bg-card p-4 md:max-h-none md:w-80 md:border-b-0 md:border-r">
        <h1 class="mb-1 text-lg font-bold">{t('explore.sidebarTitle')}</h1>
        <Input
          type="search"
          class="mb-3"
          placeholder={t('explore.searchPlaceholder')}
          value={query()}
          onInput={(e) => setQuery(e.target.value)}
        />
        {searching() ? <Skeleton class="mb-2 h-8 w-full" /> : null}
        {searchError() ? (
          <p class="mb-2 text-xs text-destructive">{searchError()}</p>
        ) : null}
        <p class="mb-2 text-xs text-muted-foreground">
          {t('explore.guestCitiesCount', { count: String(cities.length) })}
        </p>
        <div class="flex flex-col gap-2">
          {cities.map((c) => (
            <button
              type="button"
              class={
                city?.id === c.id
                  ? 'rounded-xl border border-[#ff6b4a] bg-[#ff6b4a]/10 px-3 py-2 text-left text-sm font-medium text-[#ff6b4a]'
                  : 'rounded-xl border border-border px-3 py-2 text-left text-sm hover:bg-muted'
              }
              onClick={() => {
                setSelected(c);
                setPickedPlace(null);
              }}
            >
              {c.name}
            </button>
          ))}
          {cities.length === 0 && !searching() ? (
            <p class="text-sm text-muted-foreground">{t('explore.noCitiesFound')}</p>
          ) : null}
        </div>

        {city ? (
          <div class="mt-4 space-y-2">
            <p class="text-sm font-medium">
              {t('explore.planningFor', { city: city.name })}
            </p>
            {pickedPlace() ? (
              <p class="text-xs text-muted-foreground">
                Selected: {pickedPlace().name}
              </p>
            ) : null}
            {isAuthenticated() ? (
              <Link
                href={`${ROUTE_PLAN_NEW}?city=${encodeURIComponent(city.name)}&cityId=${encodeURIComponent(city.id)}`}
              >
                <Button class="w-full coral-gradient border-0 text-white">
                  {t('explore.generateTrip')}
                </Button>
              </Link>
            ) : (
              <Link href={ROUTE_AUTH_SIGNIN}>
                <Button class="w-full" variant="outline">
                  {t('explore.guestSignInToExplore', { city: city.name })}
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <p class="mt-4 text-xs text-muted-foreground">{t('explore.guestMapHint')}</p>
        )}
      </aside>

      <div class="relative min-h-0 flex-1">
        <MapView
          center={center}
          zoom={zoom}
          places={places}
          onPlaceClick={(place) => {
            if (place.isCity) {
              const match = COVERED_CITIES.find((c) => c.id === place.id);
              if (match) setSelected(match);
            } else {
              setPickedPlace(place);
            }
          }}
        />
      </div>
    </div>
  );
}
