import { createSignal, createEffect, onCleanup, Link } from 'grainlet';
import { IconLoader, IconSearch, IconX, IconMapPin } from '../design-system/icons.jsx';
import { MapView } from '../components/MapView.jsx';
import { Button } from '../design-system/ui/button.jsx';
import { t } from '../i18n/t.js';
import {
  CITY_MAP_ZOOM,
  EUROPE_MAP_CENTER,
  EUROPE_MAP_ZOOM,
} from '../constants/product.js';
import {
  ROUTE_AUTH_SIGNIN,
  routePlanNewWithCity,
} from '../constants/routes.js';
import {
  fetchCoveredCities,
  fetchPois,
  isAuthenticated,
  ratePoi,
  searchCities,
  toggleSavedPoi,
} from '../api/client.js';
import { POI_CATEGORIES, POI_CATEGORY_LABELS } from '../constants/poiCategories.js';
import { getErrorMessage, normalizeList } from '../utils/errors.js';
import { toast } from '../components/Toast.jsx';
import { cn } from '../design-system/utils/cn.js';

/** Exact class strings from frontend ExploreSidebarContent.constants + PoiCategoryFilter */
const SIDEBAR_ROOT_CLASSES = 'flex h-full min-h-0 flex-1 flex-col p-4';
const SIDEBAR_TITLE_CLASSES = 'text-lg font-semibold text-gray-900 dark:text-white';
const SIDEBAR_SUBTITLE_CLASSES = 'mt-2 text-sm text-gray-600 dark:text-gray-400';
const SIDEBAR_LOADING_ROW_CLASSES =
  'mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400';
const SIDEBAR_ERROR_CLASSES = 'mt-4 text-sm text-red-600 dark:text-red-400';
const SIDEBAR_EMPTY_CLASSES = 'mt-4 text-sm text-gray-500 dark:text-gray-400';
const SIDEBAR_LIST_CLASSES = 'mt-4 h-0 min-h-0 flex-1 overflow-y-auto';
const POI_CATEGORY_FILTER_ROOT_CLASSES = 'flex flex-wrap gap-2';
const POI_CATEGORY_FILTER_BUTTON_BASE_CLASSES =
  'rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-70';
const POI_CATEGORY_FILTER_BUTTON_SELECTED_CLASSES =
  'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-950/50 dark:text-indigo-200';
const POI_CATEGORY_FILTER_BUTTON_UNSELECTED_CLASSES =
  'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-200';

function normalizeCity(c) {
  return {
    id: c.id || c.slug || c.name,
    name: c.name || c.city,
    country: c.country || '',
    lng: c.lng ?? c.centerLng ?? c.longitude,
    lat: c.lat ?? c.centerLat ?? c.latitude,
  };
}

function normalizePoi(p) {
  return {
    id: p.id,
    name: p.name || p.title,
    category: p.category,
    description: p.description || '',
    lng: p.lng ?? p.longitude,
    lat: p.lat ?? p.latitude,
    photoUrl: p.photoUrl || p.imageCdnUrl || '',
  };
}

/**
 * Explore V2 layout: map + absolute glass header (ExploreHeaderV2) + sheet sidebar.
 * Visual classes match frontend; logic uses zenwayro API helpers.
 */
export function ExplorePage() {
  const [query, setQuery] = createSignal('');
  const [cities, setCities] = createSignal([]);
  const [covered, setCovered] = createSignal([]);
  const [selected, setSelected] = createSignal(null);
  const [categories, setCategories] = createSignal([...POI_CATEGORIES]);
  const [pois, setPois] = createSignal([]);
  const [picked, setPicked] = createSignal(null);
  const [loadingCities, setLoadingCities] = createSignal(false);
  const [loadingPois, setLoadingPois] = createSignal(false);
  const [error, setError] = createSignal('');
  const [dropdownOpen, setDropdownOpen] = createSignal(false);

  createEffect(() => {
    let cancelled = false;
    fetchCoveredCities()
      .then((data) => {
        if (cancelled) return;
        const list = (Array.isArray(data) ? data : normalizeList(data, 'cities'))
          .map(normalizeCity)
          .filter((c) => c.lng != null && c.lat != null);
        setCovered(list);
      })
      .catch(() => {
        if (!cancelled) setCovered([]);
      });
    return () => {
      cancelled = true;
    };
  });

  createEffect(() => {
    const q = query().trim();
    if (q.length < 2) {
      setCities([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      setLoadingCities(true);
      searchCities(q)
        .then((data) => {
          if (cancelled) return;
          const list = (Array.isArray(data) ? data : normalizeList(data, 'cities'))
            .map(normalizeCity)
            .filter((c) => c.lng != null && c.lat != null);
          setCities(list);
          setDropdownOpen(true);
        })
        .catch((err) => {
          if (!cancelled) setError(getErrorMessage(err));
        })
        .finally(() => {
          if (!cancelled) setLoadingCities(false);
        });
    }, 300);
    onCleanup(() => {
      cancelled = true;
      clearTimeout(timer);
    });
  });

  createEffect(() => {
    const city = selected();
    const cats = categories();
    if (!city?.id || !cats.length) {
      setPois([]);
      return;
    }
    let cancelled = false;
    setLoadingPois(true);
    setError('');
    fetchPois({ cityId: city.id, categories: cats })
      .then((list) => {
        if (cancelled) return;
        setPois(list.map(normalizePoi).filter((p) => p.lng != null && p.lat != null));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getErrorMessage(err, t('explore.attractionsLoadFailed')));
        setPois([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingPois(false);
      });
    return () => {
      cancelled = true;
    };
  });

  const city = selected();
  const center = city ? [city.lng, city.lat] : EUROPE_MAP_CENTER;
  const zoom = city ? CITY_MAP_ZOOM : EUROPE_MAP_ZOOM;
  const mapPlaces = city
    ? pois()
    : covered().map((c) => ({
        id: c.id,
        lng: c.lng,
        lat: c.lat,
        name: c.name,
        isCity: true,
      }));

  const toggleCategory = (cat) => {
    const set = new Set(categories());
    if (set.has(cat)) {
      if (set.size <= 1) return;
      set.delete(cat);
    } else set.add(cat);
    setCategories([...set]);
  };

  const dropdownCities = cities().length ? cities() : covered().filter((c) => {
    const q = query().trim().toLowerCase();
    return !q || c.name.toLowerCase().includes(q);
  });

  return (
    <div
      data-explore-sheet-mount
      class="relative h-[calc(100vh-4rem)] min-h-0 flex-1 overflow-hidden bg-background md:h-[calc(100vh-4rem)]"
    >
      {/* Map layer */}
      <div class="absolute inset-0">
        <MapView
          center={center}
          zoom={zoom}
          places={mapPlaces}
          onPlaceClick={(place) => {
            if (place.isCity) {
              const match = covered().find((c) => c.id === place.id);
              if (match) {
                setSelected(match);
                setQuery(match.name);
                setPicked(null);
              }
            } else {
              setPicked(place);
            }
          }}
          class="h-full w-full"
        />
      </div>

      {/* ExploreHeaderV2 — absolute glass search */}
      <header class="pointer-events-none absolute left-0 right-0 top-0 z-30 px-4 pt-3">
        <div class="pointer-events-auto mx-auto flex max-w-lg items-center gap-2">
          {city ? (
            <button
              type="button"
              class="glass flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              aria-label={t('explore.backToCities') || 'Back to cities'}
              onClick={() => {
                setSelected(null);
                setPicked(null);
                setQuery('');
              }}
            >
              <IconX size={18} class="text-white" />
            </button>
          ) : null}
          <div class="relative min-w-0 flex-1">
            <div class="glass-dark flex min-h-0 items-center gap-3 rounded-2xl px-4 py-3 shadow-xl">
              <IconSearch size={18} class="shrink-0 text-white/90" />
              <input
                type="text"
                placeholder={t('explore.searchPlaceholder')}
                value={query()}
                onInput={(e) => {
                  setQuery(e.target.value);
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
                class="min-h-0 min-w-0 flex-1 border-0 bg-transparent text-sm font-medium leading-normal text-white outline-none placeholder:text-white/75"
              />
              {loadingCities() ? (
                <IconLoader size={18} class="shrink-0 animate-spin text-white/90" />
              ) : null}
              {query() && !loadingCities() ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setDropdownOpen(false);
                  }}
                  class="shrink-0 cursor-pointer"
                  aria-label={t('common.dismissToast')}
                >
                  <IconX size={16} class="text-white/75" />
                </button>
              ) : null}
            </div>
            {dropdownOpen() && dropdownCities.length > 0 ? (
              <div class="absolute left-0 right-0 z-40 mt-2 max-h-64 overflow-auto rounded-xl border border-border bg-card shadow-lg">
                {dropdownCities.map((c) => (
                  <button
                    type="button"
                    class="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-muted"
                    onClick={() => {
                      setSelected(c);
                      setQuery(c.name);
                      setDropdownOpen(false);
                      setPicked(null);
                    }}
                  >
                    <span class="font-medium">{c.name}</span>
                    {c.country ? (
                      <span class="ml-2 text-muted-foreground">{c.country}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Sheet / sidebar content — desktop inline + mobile bottom panel */}
      <div class="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex max-h-[48%] flex-col md:inset-y-0 md:left-0 md:right-auto md:max-h-none md:w-96">
        <div class="pointer-events-auto flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-3xl border border-border bg-card shadow-2xl md:rounded-none md:border-y-0 md:border-l-0 md:border-r">
          <div class={SIDEBAR_ROOT_CLASSES}>
            <h2 class={SIDEBAR_TITLE_CLASSES}>{t('explore.sidebarTitle')}</h2>
            <p class={SIDEBAR_SUBTITLE_CLASSES}>
              {city
                ? t('explore.planningFor', { city: city.name })
                : t('explore.selectCityToPlan')}
            </p>

            {city ? (
              <div
                class={`${POI_CATEGORY_FILTER_ROOT_CLASSES} mt-4`}
                role="group"
                aria-label="Filter places by category"
              >
                {POI_CATEGORIES.map((category) => {
                  const isSelected = categories().includes(category);
                  return (
                    <button
                      type="button"
                      aria-pressed={isSelected}
                      class={`${POI_CATEGORY_FILTER_BUTTON_BASE_CLASSES} ${
                        isSelected
                          ? POI_CATEGORY_FILTER_BUTTON_SELECTED_CLASSES
                          : POI_CATEGORY_FILTER_BUTTON_UNSELECTED_CLASSES
                      }`}
                      onClick={() => toggleCategory(category)}
                    >
                      {POI_CATEGORY_LABELS[category]}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {city && loadingPois() ? (
              <div class={SIDEBAR_LOADING_ROW_CLASSES}>
                <IconLoader size={20} class="animate-spin" />
                {t('explore.loadingAttractions')}
              </div>
            ) : null}
            {error() ? <p class={SIDEBAR_ERROR_CLASSES}>{error()}</p> : null}
            {city && !loadingPois() && pois().length === 0 && !error() ? (
              <p class={SIDEBAR_EMPTY_CLASSES}>{t('explore.noAttractionsYet')}</p>
            ) : null}

            <div class={SIDEBAR_LIST_CLASSES}>
              <ul class="relative m-0 list-none space-y-2 p-0">
                {pois().map((place) => (
                  <li>
                    <button
                      type="button"
                      class={cn(
                        'flex w-full items-start gap-3 rounded-xl border border-border bg-background p-3 text-left',
                        picked()?.id === place.id &&
                          'border-indigo-400 ring-1 ring-indigo-400 dark:border-indigo-500'
                      )}
                      onClick={() => setPicked(place)}
                    >
                      <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <IconMapPin size={18} class="text-[#ff6b4a]" />
                      </div>
                      <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-semibold">{place.name}</p>
                        <p class="text-xs capitalize text-muted-foreground">
                          {place.category || ''}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {city ? (
              <div class="mt-3 shrink-0 pb-2">
                {isAuthenticated() ? (
                  <Link href={routePlanNewWithCity(city.name, city.id)}>
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
            ) : null}
          </div>
        </div>
      </div>

      {/* Place detail overlay (simplified PlanPlaceDetailOverlay chrome) */}
      {picked() ? (
        <div class="absolute inset-x-0 bottom-[48%] z-50 mx-auto max-w-lg px-4 md:bottom-8 md:left-96 md:right-4 md:mx-0">
          <div class="rounded-2xl border border-border bg-card p-4 shadow-xl">
            <div class="mb-2 flex items-start justify-between gap-2">
              <div>
                <h3 class="text-base font-bold">{picked().name}</h3>
                <p class="text-xs capitalize text-muted-foreground">
                  {picked().category || ''}
                </p>
              </div>
              <button type="button" class="text-muted-foreground" onClick={() => setPicked(null)}>
                <IconX size={18} />
              </button>
            </div>
            {picked().description ? (
              <p class="mb-3 text-sm text-muted-foreground">{picked().description}</p>
            ) : null}
            {isAuthenticated() ? (
              <div class="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await toggleSavedPoi(picked().id);
                      toast(t('explore.saved') || 'Saved', { variant: 'success' });
                    } catch (err) {
                      toast(getErrorMessage(err), { variant: 'destructive' });
                    }
                  }}
                >
                  {t('explore.savePlace') || 'Save'}
                </Button>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    type="button"
                    class="text-sm text-[#ff6b4a]"
                    onClick={async () => {
                      try {
                        await ratePoi(picked().id, n);
                        toast(`${n}★`, { variant: 'success' });
                      } catch (err) {
                        toast(getErrorMessage(err), { variant: 'destructive' });
                      }
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
