import {
  createSignal,
  createEffect,
  createMemo,
  onCleanup,
  Show,
  For,
} from 'grainlet';
import { navigate, useLocation } from 'grainlet/route';
import {
  IconChevronLeft,
  IconLoader,
  IconSearch,
  IconX,
} from '../design-system/icons.jsx';
import { MapView } from '../components/MapView.jsx';
import {
  BottomSheet,
  BOTTOM_SHEET_SNAP_COLLAPSED,
  BOTTOM_SHEET_SNAP_DEFAULT,
  isSheetCollapsed,
} from '../components/BottomSheet.jsx';
import {
  ExploreCityPickerGrid,
  ExploreCityPickerHeader,
  EXPLORE_SHEET_LIST_BOTTOM_PADDING_CLASS,
} from '../components/explore/ExploreCityPickerGrid.jsx';
import { PlaceCard } from '../components/PlaceCard.jsx';
import { PlanPlaceDetailOverlay } from '../components/PlanPlaceDetailOverlay.jsx';
import { t } from '../i18n/t.js';
import {
  CITY_MAP_ZOOM,
  EUROPE_MAP_CENTER,
  EUROPE_MAP_ZOOM,
} from '../constants/product.js';
import {
  ROUTE_EXPLORE,
  routeAuthSignInWithCallback,
  routeExploreWithCity,
} from '../constants/routes.js';
import {
  fetchCoveredCities,
  fetchPoiEngagementBatch,
  fetchPois,
  isAuthenticated,
  ratePoi,
  searchCities,
  toggleSavedPoi,
  useAuthToken,
} from '../api/client.js';
import { POI_CATEGORIES, POI_CATEGORY_LABELS } from '../constants/poiCategories.js';
import { getErrorMessage, normalizeList } from '../utils/errors.js';
import { resolveCityFromUrlParams } from '../utils/resolveCityFromUrlParams.js';
import {
  COVERED_CITIES_DEBOUNCE_MS,
  EUROPE_COVERED_BBOX,
  quantizeCoveredCitiesQuery,
} from '../utils/exploreMap.js';
import { toast } from '../components/Toast.jsx';
import { cn } from '../design-system/utils/cn.js';

const SIDEBAR_ROOT_CLASSES = 'flex h-full min-h-0 flex-1 flex-col p-4';
const SIDEBAR_TITLE_CLASSES =
  'text-lg font-semibold text-gray-900 dark:text-white';
const SIDEBAR_SUBTITLE_CLASSES =
  'mt-2 text-sm text-gray-600 dark:text-gray-400';
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

const POI_PAGE_SIZE = 50;

function normalizeCity(c) {
  return {
    id: c.id || c.slug || c.name,
    name: c.name || c.city,
    country: c.country || '',
    lng: c.lng ?? c.centerLng ?? c.longitude,
    lat: c.lat ?? c.centerLat ?? c.latitude,
    imageUrl: c.imageUrl || c.cityImageCdnUrl || c.photoUrl || '',
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

function parseExploreSearch(search) {
  const params = new URLSearchParams(search || '');
  return {
    city: params.get('city') || '',
    cityId: params.get('cityId') || '',
  };
}

/**
 * Explore V2 — map + glass header + FAB + BottomSheet + place overlay.
 */
export function ExplorePage() {
  const location = useLocation();
  const token = useAuthToken();
  const showAuthenticatedUi = createMemo(
    () => Boolean(token()) || isAuthenticated()
  );

  const [query, setQuery] = createSignal('');
  const [cities, setCities] = createSignal([]);
  const [covered, setCovered] = createSignal([]);
  const [selected, setSelected] = createSignal(null);
  const [selectedCityId, setSelectedCityId] = createSignal(null);
  const [categories, setCategories] = createSignal([...POI_CATEGORIES]);
  const [pois, setPois] = createSignal([]);
  const [poiOffset, setPoiOffset] = createSignal(0);
  const [poiHasMore, setPoiHasMore] = createSignal(false);
  const [openedPlace, setOpenedPlace] = createSignal(null);
  const [loadingCities, setLoadingCities] = createSignal(false);
  const [loadingPois, setLoadingPois] = createSignal(false);
  const [loadingMore, setLoadingMore] = createSignal(false);
  const [error, setError] = createSignal('');
  const [dropdownOpen, setDropdownOpen] = createSignal(false);
  const [viewport, setViewport] = createSignal(null);
  const [snapIndex, setSnapIndex] = createSignal(BOTTOM_SHEET_SNAP_DEFAULT);
  const [pickerCamera, setPickerCamera] = createSignal({
    center: EUROPE_MAP_CENTER,
    zoom: EUROPE_MAP_ZOOM,
  });
  const [engagementById, setEngagementById] = createSignal({});
  const sheetApi = { current: null };

  const showCityPicker = createMemo(
    () => !selected() || !showAuthenticatedUi()
  );
  const sheetCollapsed = createMemo(() => isSheetCollapsed(snapIndex()));
  const showFab = createMemo(
    () => showCityPicker() && sheetCollapsed()
  );

  const openSheet = () => {
    sheetApi.current?.snapTo(BOTTOM_SHEET_SNAP_DEFAULT);
  };
  const collapseSheet = () => {
    sheetApi.current?.snapTo(BOTTOM_SHEET_SNAP_COLLAPSED);
  };

  // URL sync — resolve ?city=&cityId= when authenticated
  createEffect(() => {
    const loc = location();
    const { city, cityId } = parseExploreSearch(loc.search);
    if (!showAuthenticatedUi()) return;
    if (!city) {
      // Don't clear if user just selected locally without URL yet
      return;
    }
    let cancelled = false;
    resolveCityFromUrlParams({ cityName: city, cityId })
      .then((resolved) => {
        if (cancelled || !resolved) return;
        setSelected(resolved);
        setSelectedCityId(resolved.id);
        setQuery(resolved.name);
        setOpenedPlace(null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  });

  // Bootstrap covered cities (also refreshed by viewport debounce below)
  createEffect(() => {
    if (!showCityPicker()) return;
    let cancelled = false;
    fetchCoveredCities()
      .then((data) => {
        if (cancelled) return;
        const list = (Array.isArray(data) ? data : normalizeList(data, 'cities'))
          .map(normalizeCity)
          .filter((c) => c.lng != null && c.lat != null);
        if (list.length) setCovered(list);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  });

  // Covered cities via viewport bbox (debounced)
  createEffect(() => {
    if (!showCityPicker()) return;
    const vp = viewport();
    const quantized = quantizeCoveredCitiesQuery(vp) || {
      zoom: EUROPE_MAP_ZOOM,
      west: EUROPE_COVERED_BBOX[0],
      south: EUROPE_COVERED_BBOX[1],
      east: EUROPE_COVERED_BBOX[2],
      north: EUROPE_COVERED_BBOX[3],
      key: 'europe-fallback',
    };
    // depend on key
    void quantized.key;
    let cancelled = false;
    const timer = setTimeout(() => {
      fetchCoveredCities({
        zoom: String(quantized.zoom),
        west: String(quantized.west),
        south: String(quantized.south),
        east: String(quantized.east),
        north: String(quantized.north),
      })
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
    }, COVERED_CITIES_DEBOUNCE_MS);
    onCleanup(() => {
      cancelled = true;
      clearTimeout(timer);
    });
  });

  // City search debounce
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
          if (!cancelled) setError(getErrorMessage(err, t('explore.searchFailed')));
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

  // POIs when authenticated + city selected
  createEffect(() => {
    const city = selected();
    const cats = categories();
    const authed = showAuthenticatedUi();
    if (!authed || !city?.id || !cats.length) {
      setPois([]);
      setPoiOffset(0);
      setPoiHasMore(false);
      return;
    }
    let cancelled = false;
    setLoadingPois(true);
    setError('');
    setPoiOffset(0);
    fetchPois({ cityId: city.id, categories: cats, limit: POI_PAGE_SIZE, offset: 0 })
      .then((list) => {
        if (cancelled) return;
        const normalized = list
          .map(normalizePoi)
          .filter((p) => p.lng != null && p.lat != null);
        setPois(normalized);
        setPoiHasMore(normalized.length >= POI_PAGE_SIZE);
        setPoiOffset(normalized.length);
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

  // Engagement batch
  createEffect(() => {
    if (!showAuthenticatedUi()) {
      setEngagementById({});
      return;
    }
    const ids = pois().map((p) => p.id).filter(Boolean);
    if (!ids.length) return;
    let cancelled = false;
    fetchPoiEngagementBatch(ids)
      .then((data) => {
        if (cancelled) return;
        const map = {};
        const items = data?.items || data?.engagement || data || {};
        if (Array.isArray(items)) {
          items.forEach((row) => {
            if (row?.poiId != null) {
              map[row.poiId] = {
                isSaved: Boolean(row.isSaved || row.saved),
                myRating: row.myRating ?? row.rating ?? 0,
              };
            }
          });
        } else if (items && typeof items === 'object') {
          Object.keys(items).forEach((id) => {
            const row = items[id];
            map[id] = {
              isSaved: Boolean(row?.isSaved || row?.saved),
              myRating: row?.myRating ?? row?.rating ?? 0,
            };
          });
        }
        setEngagementById(map);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  });

  const center = createMemo(() => {
    if (showCityPicker()) return pickerCamera().center;
    const city = selected();
    return city ? [city.lng, city.lat] : EUROPE_MAP_CENTER;
  });

  const zoom = createMemo(() => {
    if (showCityPicker()) return pickerCamera().zoom;
    return selected() ? CITY_MAP_ZOOM : EUROPE_MAP_ZOOM;
  });

  const mapPlaces = createMemo(() => {
    if (showCityPicker()) {
      return covered().map((c) => ({
        id: c.id,
        lng: c.lng,
        lat: c.lat,
        name: c.name,
        isCity: true,
      }));
    }
    return pois();
  });

  const savedPlaceIds = createMemo(() =>
    Object.entries(engagementById())
      .filter(([, v]) => v?.isSaved)
      .map(([id]) => id)
  );

  const dropdownCities = createMemo(() => {
    if (cities().length) return cities();
    const q = query().trim().toLowerCase();
    return covered().filter(
      (c) => !q || String(c.name).toLowerCase().includes(q)
    );
  });

  const pickerCities = createMemo(() => {
    const q = query().trim().toLowerCase();
    const base = covered();
    if (!q) return base;
    return base.filter(
      (c) =>
        String(c.name).toLowerCase().includes(q) ||
        String(c.country).toLowerCase().includes(q)
    );
  });

  const selectCityAuthed = (city) => {
    setSelected(city);
    setSelectedCityId(city.id);
    setQuery(city.name);
    setDropdownOpen(false);
    setOpenedPlace(null);
    navigate(routeExploreWithCity(city.name, city.id));
    openSheet();
  };

  const handleCityPick = (city) => {
    const vp = viewport();
    if (vp?.center) {
      setPickerCamera({ center: vp.center, zoom: vp.zoom ?? EUROPE_MAP_ZOOM });
    }
    setSelectedCityId(city.id);

    if (!showAuthenticatedUi()) {
      navigate(
        routeAuthSignInWithCallback(routeExploreWithCity(city.name, city.id))
      );
      return;
    }
    selectCityAuthed(city);
  };

  const handleBackToCities = () => {
    setSelected(null);
    setSelectedCityId(null);
    setOpenedPlace(null);
    setQuery('');
    setPois([]);
    navigate(ROUTE_EXPLORE, { replace: true });
    openSheet();
  };

  const toggleCategory = (cat) => {
    const set = new Set(categories());
    if (set.has(cat)) {
      if (set.size <= 1) return;
      set.delete(cat);
    } else set.add(cat);
    setCategories([...set]);
  };

  const loadMorePois = () => {
    const city = selected();
    if (!city?.id || loadingMore() || !poiHasMore()) return;
    setLoadingMore(true);
    fetchPois({
      cityId: city.id,
      categories: categories(),
      limit: POI_PAGE_SIZE,
      offset: poiOffset(),
    })
      .then((list) => {
        const normalized = list
          .map(normalizePoi)
          .filter((p) => p.lng != null && p.lat != null);
        setPois((prev) => [...prev, ...normalized]);
        setPoiOffset((n) => n + normalized.length);
        setPoiHasMore(normalized.length >= POI_PAGE_SIZE);
      })
      .catch(() => {})
      .finally(() => setLoadingMore(false));
  };

  const refreshEngagement = async (poiId) => {
    try {
      const data = await fetchPoiEngagementBatch([poiId]);
      const row =
        data?.items?.find?.((r) => String(r.poiId) === String(poiId)) ||
        data?.engagement?.[poiId] ||
        data?.[poiId];
      if (!row) return;
      setEngagementById((prev) => ({
        ...prev,
        [poiId]: {
          isSaved: Boolean(row.isSaved || row.saved),
          myRating: row.myRating ?? row.rating ?? 0,
        },
      }));
    } catch {
      /* ignore */
    }
  };

  const onToggleSave = async (place) => {
    try {
      await toggleSavedPoi(place.id);
      toast(t('explore.saved'), { variant: 'success' });
      await refreshEngagement(place.id);
    } catch (err) {
      toast(getErrorMessage(err, t('explore.saveFailed')), {
        variant: 'destructive',
      });
    }
  };

  const onRate = async (place, stars) => {
    try {
      await ratePoi(place.id, stars);
      toast(`${stars}★`, { variant: 'success' });
      await refreshEngagement(place.id);
    } catch (err) {
      toast(getErrorMessage(err, t('explore.rateFailed')), {
        variant: 'destructive',
      });
    }
  };

  return (
    <div
      data-explore-sheet-mount
      class="absolute inset-0 overflow-hidden bg-background"
    >
      <div class="absolute inset-0">
        <MapView
          center={center}
          zoom={zoom}
          places={mapPlaces}
          markerVariant={() => (showCityPicker() ? 'city-pill' : 'dot')}
          selectedPlaceId={() =>
            showCityPicker() ? selectedCityId() : openedPlace()?.id
          }
          savedPlaceIds={savedPlaceIds}
          suppressAutoFitBounds={showCityPicker}
          fitPlacesBounds={() => !showCityPicker() && pois().length > 1}
          onViewportChange={setViewport}
          onMapClick={() => {
            if (showCityPicker()) {
              setSelectedCityId(null);
              return;
            }
            setOpenedPlace(null);
          }}
          onPlaceClick={(place) => {
            if (place.isCity) {
              const match = covered().find((c) => c.id === place.id);
              if (match) handleCityPick(match);
              return;
            }
            setOpenedPlace(place);
          }}
          class="h-full w-full"
        />
      </div>

      <header class="pointer-events-none absolute left-0 right-0 top-0 z-30 px-4 pt-3">
        <div class="pointer-events-auto mx-auto flex max-w-lg items-center gap-2">
          <Show when={selected() && showAuthenticatedUi()}>
            <button
              type="button"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/90 shadow-md backdrop-blur-md cursor-pointer"
              aria-label={t('explore.backToCities')}
              onClick={handleBackToCities}
            >
              <IconChevronLeft size={20} class="text-foreground" />
            </button>
          </Show>
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
                onFocus={() => {
                  setDropdownOpen(true);
                  openSheet();
                }}
                class="min-h-0 min-w-0 flex-1 border-0 bg-transparent text-sm font-medium leading-normal text-white outline-none placeholder:text-white/75"
              />
              <Show when={loadingCities()}>
                <IconLoader size={18} class="shrink-0 animate-spin text-white/90" />
              </Show>
              <Show when={query() && !loadingCities()}>
                <button
                  type="button"
                  onClick={() => {
                    if (selected() && showAuthenticatedUi()) {
                      handleBackToCities();
                      return;
                    }
                    setQuery('');
                    setDropdownOpen(false);
                  }}
                  class="shrink-0 cursor-pointer"
                  aria-label={t('common.dismissToast')}
                >
                  <IconX size={16} class="text-white/75" />
                </button>
              </Show>
            </div>
            <Show when={dropdownOpen() && dropdownCities().length > 0}>
              <div class="absolute left-0 right-0 z-40 mt-2 max-h-64 overflow-auto rounded-xl border border-border bg-card shadow-lg">
                <For each={dropdownCities}>
                  {(c) => (
                    <button
                      type="button"
                      class="flex w-full items-center px-3 py-2 text-left text-sm hover:bg-muted"
                      onClick={() => handleCityPick(c)}
                    >
                      <span class="font-medium">{c.name}</span>
                      <Show when={c.country}>
                        <span class="ml-2 text-muted-foreground">{c.country}</span>
                      </Show>
                    </button>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </div>
      </header>

      <Show when={showFab()}>
        <div
          class="pointer-events-none absolute z-30"
          style="right:0.5rem;bottom:3.5rem;"
        >
          <button
            type="button"
            class="pointer-events-auto coral-gradient flex h-auto items-center gap-2 rounded-2xl border-0 px-3 py-3 font-semibold text-white shadow-2xl shadow-orange-900/40 hover:opacity-90"
            onClick={openSheet}
          >
            {t('nav.explore')}
          </button>
        </div>
      </Show>

      <BottomSheet
        variant="v2"
        zIndex={40}
        sheetRef={sheetApi}
        initialSnap={BOTTOM_SHEET_SNAP_DEFAULT}
        onSnapIndexChange={setSnapIndex}
      >
        <Show
          when={showCityPicker()}
          fallback={
            <div class={SIDEBAR_ROOT_CLASSES}>
              <h2 class={SIDEBAR_TITLE_CLASSES}>{t('explore.sidebarTitle')}</h2>
              <p class={SIDEBAR_SUBTITLE_CLASSES}>
                {selected()
                  ? t('explore.planningFor', { city: selected().name })
                  : t('explore.selectCityToPlan')}
              </p>

              <Show when={selected()}>
                <div
                  class={`${POI_CATEGORY_FILTER_ROOT_CLASSES} mt-4`}
                  role="group"
                  aria-label="Filter places by category"
                >
                  <For each={POI_CATEGORIES}>
                    {(category) => {
                      const isSelected = () => categories().includes(category);
                      return (
                        <button
                          type="button"
                          aria-pressed={isSelected()}
                          disabled={isSelected() && categories().length <= 1}
                          class={`${POI_CATEGORY_FILTER_BUTTON_BASE_CLASSES} ${
                            isSelected()
                              ? POI_CATEGORY_FILTER_BUTTON_SELECTED_CLASSES
                              : POI_CATEGORY_FILTER_BUTTON_UNSELECTED_CLASSES
                          }`}
                          onClick={() => toggleCategory(category)}
                        >
                          {POI_CATEGORY_LABELS[category]}
                        </button>
                      );
                    }}
                  </For>
                </div>
              </Show>

              <Show when={loadingPois()}>
                <div class={SIDEBAR_LOADING_ROW_CLASSES}>
                  <IconLoader size={20} class="animate-spin" />
                  {t('explore.loadingAttractions')}
                </div>
              </Show>
              <Show when={error()}>
                <p class={SIDEBAR_ERROR_CLASSES}>{error()}</p>
              </Show>
              <Show
                when={
                  selected() &&
                  !loadingPois() &&
                  pois().length === 0 &&
                  !error()
                }
              >
                <p class={SIDEBAR_EMPTY_CLASSES}>{t('explore.noAttractionsYet')}</p>
              </Show>

              <div
                class={cn(SIDEBAR_LIST_CLASSES, EXPLORE_SHEET_LIST_BOTTOM_PADDING_CLASS)}
                onScroll={(e) => {
                  const el = e.currentTarget;
                  if (
                    el.scrollTop + el.clientHeight >=
                    el.scrollHeight - 80
                  ) {
                    loadMorePois();
                  }
                }}
              >
                <ul class="relative m-0 list-none space-y-2 p-0">
                  <For each={pois}>
                    {(place) => (
                      <li>
                        <PlaceCard
                          place={place}
                          selected={openedPlace()?.id === place.id}
                          showEngagementActions={showAuthenticatedUi()}
                          engagement={engagementById()[place.id] || {}}
                          onClick={() => setOpenedPlace(place)}
                          onToggleSave={onToggleSave}
                          onRate={onRate}
                        />
                      </li>
                    )}
                  </For>
                </ul>
                <Show when={loadingMore()}>
                  <p class="py-3 text-center text-xs text-muted-foreground">
                    {t('explore.loadingMore')}
                  </p>
                </Show>
              </div>
            </div>
          }
        >
          <ExploreCityPickerHeader
            count={() => pickerCities().length}
            onDismiss={collapseSheet}
          />
          <ExploreCityPickerGrid
            cities={pickerCities}
            selectedCityId={selectedCityId}
            onSelectCity={handleCityPick}
            showGuestHint={() => !showAuthenticatedUi()}
          />
        </Show>
      </BottomSheet>

      <Show when={openedPlace() && showAuthenticatedUi()}>
        <PlanPlaceDetailOverlay
          place={openedPlace()}
          variant={
            typeof window !== 'undefined' && window.innerWidth < 768
              ? 'mobile'
              : 'desktop'
          }
          showEngagement={showAuthenticatedUi()}
          onClose={() => setOpenedPlace(null)}
          onEngagementChange={refreshEngagement}
        />
      </Show>
    </div>
  );
}
