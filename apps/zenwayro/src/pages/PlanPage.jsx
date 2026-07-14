import { createSignal, createEffect, useParams, Link, navigate } from 'grain';
import { MapView } from '../components/MapView.jsx';
import { Button } from '../design-system/ui/button.jsx';
import { Input } from '../design-system/ui/input.jsx';
import { createTrip, fetchTrip } from '../api/client.js';
import { t } from '../i18n/t.js';
import { CITY_MAP_ZOOM } from '../constants/product.js';
import { ROUTE_EXPLORE, ROUTE_TRIPS, routePlanById } from '../constants/routes.js';
import { cn } from '../design-system/utils/cn.js';

function createDemoItinerary(cityName) {
  return {
    city: cityName || 'Lisbon',
    center: [-9.1393, 38.7223],
    days: [
      {
        id: 'd1',
        label: t('popularTrips.dayHeading', { number: '1' }),
        places: [
          { id: 'p1', name: 'Praça do Comércio', lng: -9.1368, lat: 38.7075 },
          { id: 'p2', name: 'Alfama', lng: -9.1333, lat: 38.7125 },
          { id: 'p3', name: 'Miradouro da Senhora do Monte', lng: -9.1328, lat: 38.7195 },
        ],
      },
      {
        id: 'd2',
        label: t('popularTrips.dayHeading', { number: '2' }),
        places: [
          { id: 'p4', name: 'Belém Tower', lng: -9.2156, lat: 38.6916 },
          { id: 'p5', name: 'Jerónimos Monastery', lng: -9.2066, lat: 38.6979 },
        ],
      },
    ],
  };
}

export function PlanPage() {
  const params = useParams();
  const id = params().id || 'new';
  const search = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  );
  const [city, setCity] = createSignal(search.get('city') || 'Lisbon');
  const [activeDay, setActiveDay] = createSignal(0);
  const [itinerary, setItinerary] = createSignal(
    createDemoItinerary(search.get('city') || 'Lisbon')
  );
  const [dragIndex, setDragIndex] = createSignal(null);
  const [error, setError] = createSignal('');

  createEffect(() => {
    if (id === 'new') return;
    let cancelled = false;
    fetchTrip(id)
      .then((data) => {
        if (cancelled || !data) return;
        if (data.city) setCity(data.city);
        if (data.days) setItinerary(data);
      })
      .catch(() => {
        if (!cancelled) setError('Using demo itinerary (API offline).');
      });
    return () => {
      cancelled = true;
    };
  });

  if (id === 'new') {
    return (
      <div class="mx-auto max-w-md px-4 py-8">
        <h1 class="mb-2 text-2xl font-bold">{t('nav.planTrip')}</h1>
        <p class="mb-4 text-sm text-muted-foreground">{t('explore.selectCityToPlan')}</p>
        <Input
          value={city()}
          placeholder={t('quiz.searchCity')}
          onInput={(e) => setCity(e.target.value)}
        />
        <div class="mt-4 flex gap-2">
          <Button
            class="flex-1 coral-gradient border-0 text-white"
            onClick={async () => {
              const name = city() || 'Lisbon';
              setItinerary(createDemoItinerary(name));
              try {
                const created = await createTrip({ city: name, title: name });
                const newId = created?.id || created?.tripId || 'demo';
                navigate(routePlanById(newId));
              } catch {
                navigate(routePlanById('demo'));
              }
            }}
          >
            {t('explore.generateTrip')}
          </Button>
          <Link href={ROUTE_EXPLORE}>
            <Button variant="outline">{t('nav.explore')}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const trip = itinerary();
  const day = trip.days[activeDay()] || trip.days[0];
  const places = day?.places || [];

  const onDrop = (toIndex) => {
    const from = dragIndex();
    if (from == null || from === toIndex) return;
    const next = {
      ...trip,
      days: trip.days.map((d, i) => {
        if (i !== activeDay()) return d;
        const list = [...d.places];
        const [item] = list.splice(from, 1);
        list.splice(toIndex, 0, item);
        return { ...d, places: list };
      }),
    };
    setItinerary(next);
    setDragIndex(null);
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
            <p class="text-xs text-muted-foreground">Plan · {id}</p>
          </div>
        </div>

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
          <p class="px-4 pt-2 text-xs text-muted-foreground">{error()}</p>
        ) : null}

        <div class="flex-1 overflow-auto p-3">
          <p class="mb-2 text-sm font-semibold">{t('popularTrips.itinerary')}</p>
          <div class="flex flex-col gap-2">
            {places.map((place, index) => (
              <div
                class="cursor-grab rounded-xl border border-border bg-background p-3 active:cursor-grabbing"
                draggable="true"
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(index)}
              >
                <div class="flex items-center gap-3">
                  <span class="flex h-7 w-7 items-center justify-center rounded-full bg-[#0f1b3d] text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <div>
                    <p class="text-sm font-medium">{place.name}</p>
                    <p class="text-xs text-muted-foreground">
                      {place.lat.toFixed(3)}, {place.lng.toFixed(3)}
                    </p>
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
  const slug = params().slug || params().id || 'shared';
  return (
    <div class="px-4 py-8">
      <h1 class="text-2xl font-bold">Shared plan</h1>
      <p class="text-muted-foreground">{slug}</p>
      <Link href={routePlanById('demo')} class="mt-4 inline-block">
        <Button class="coral-gradient border-0 text-white">Open demo plan</Button>
      </Link>
    </div>
  );
}
