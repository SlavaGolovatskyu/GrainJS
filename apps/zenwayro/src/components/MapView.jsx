import { createSignal, createEffect, onCleanup } from 'grainlet';
import maplibregl from 'maplibre-gl';
import { Protocol } from 'pmtiles';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getMapStyleUrl } from '../api/client.js';
import { EUROPE_MAP_CENTER, EUROPE_MAP_ZOOM } from '../constants/product.js';
import { cn } from '../design-system/utils/cn.js';
import {
  applyCityPillMarkerState,
  buildCityPillMarkerElement,
} from '../utils/exploreMap.js';

let mapUid = 0;
let pmtilesRegistered = false;

function registerPmtilesProtocol() {
  if (pmtilesRegistered) return;
  const protocol = new Protocol();
  maplibregl.addProtocol('pmtiles', protocol.tile.bind(protocol));
  pmtilesRegistered = true;
}

function readProp(value) {
  return typeof value === 'function' ? value() : value;
}

function placesFingerprint(places) {
  return JSON.stringify(
    (places || []).map((p) => [p.id, p.lng, p.lat, p.name, p.isCity])
  );
}

function resolveStyle() {
  const style = getMapStyleUrl();
  if (!style || String(style).includes('demo')) {
    return {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap',
        },
      },
      layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
    };
  }
  registerPmtilesProtocol();
  return style;
}

function readBbox(map) {
  const b = map.getBounds();
  return [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()];
}

function emitViewport(map, onViewportChange) {
  if (typeof onViewportChange !== 'function' || !map) return;
  const c = map.getCenter();
  onViewportChange({
    center: [c.lng, c.lat],
    zoom: map.getZoom(),
    bbox: readBbox(map),
  });
}

/** Normalize wrapped JSX props into a MapLibre LngLatLike. */
function toLngLat(value, fallback = EUROPE_MAP_CENTER) {
  const raw = readProp(value);
  if (Array.isArray(raw) && raw.length >= 2) {
    const lng = Number(raw[0]);
    const lat = Number(raw[1]);
    if (Number.isFinite(lng) && Number.isFinite(lat)) return [lng, lat];
  }
  if (raw && typeof raw === 'object') {
    const lng = Number(raw.lng ?? raw.lon);
    const lat = Number(raw.lat);
    if (Number.isFinite(lng) && Number.isFinite(lat)) return [lng, lat];
  }
  return fallback;
}

function toZoom(value, fallback = EUROPE_MAP_ZOOM) {
  const z = Number(readProp(value));
  return Number.isFinite(z) ? z : fallback;
}

/**
 * MapLibre map with city-pill / dot markers, viewport callbacks, and camera sync.
 */
export function MapView(props) {
  const [elId] = createSignal(`zw-map-${++mapUid}`);
  const [mapReady, setMapReady] = createSignal(false);

  const handlers = {
    onPlaceClick: null,
    onMapClick: null,
    onViewportChange: null,
  };

  createEffect(() => {
    handlers.onPlaceClick = props.onPlaceClick;
    handlers.onMapClick = props.onMapClick;
    handlers.onViewportChange = props.onViewportChange;
  });

  createEffect(() => {
    const id = elId();
    let cancelled = false;
    let map = null;
    let moveTimer = null;

    const boot = () => {
      const el = document.getElementById(id);
      if (!el || cancelled) return;

      const startCenter = toLngLat(props.center);
      const startZoom = toZoom(props.zoom);

      map = new maplibregl.Map({
        container: el,
        style: resolveStyle(),
        center: startCenter,
        zoom: startZoom,
        minZoom: 3,
      });
      el.__zwMap = map;
      el.__zwMarkers = [];
      el.__zwPillEls = new Map();
      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        'top-right'
      );
      map.on('click', (e) => {
        if (typeof handlers.onMapClick === 'function') {
          handlers.onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
        }
      });
      const scheduleViewport = () => {
        clearTimeout(moveTimer);
        moveTimer = setTimeout(() => {
          emitViewport(map, handlers.onViewportChange);
        }, 120);
      };
      map.on('moveend', scheduleViewport);
      map.on('load', () => {
        map.resize();
        setMapReady(true);
        emitViewport(map, handlers.onViewportChange);
      });

      // Container often lays out after first paint (absolute fill / flex).
      const ro = new ResizeObserver(() => {
        map.resize();
      });
      ro.observe(el);
      el.__zwResizeObserver = ro;
    };

    requestAnimationFrame(boot);

    onCleanup(() => {
      cancelled = true;
      clearTimeout(moveTimer);
      setMapReady(false);
      const el = document.getElementById(id);
      const markers = el?.__zwMarkers || [];
      markers.forEach((m) => m.remove());
      if (el?.__zwResizeObserver) {
        el.__zwResizeObserver.disconnect();
        el.__zwResizeObserver = null;
      }
      if (el) {
        el.__zwMarkers = [];
        el.__zwPillEls = new Map();
        el.__zwMap = null;
      }
      if (map) map.remove();
    });
  });

  // Marker rebuild
  createEffect(() => {
    if (!mapReady()) return;
    const list = readProp(props.places) || [];
    placesFingerprint(list);
    const selectedId = readProp(props.selectedPlaceId);
    const savedIds = readProp(props.savedPlaceIds) || [];
    const variant = readProp(props.markerVariant) || 'dot';

    const el = document.getElementById(elId());
    const map = el?.__zwMap;
    if (!map || !el) return;

    const prev = el.__zwMarkers || [];
    prev.forEach((m) => m.remove());
    el.__zwPillEls = new Map();
    const next = [];

    list.forEach((place) => {
      if (place.lng == null || place.lat == null) return;
      const isSelected = String(selectedId ?? '') === String(place.id);
      const isSaved = savedIds.some((id) => String(id) === String(place.id));

      let element;
      if (variant === 'city-pill' || place.isCity) {
        const built = buildCityPillMarkerElement(place.name || '', isSelected);
        element = built.root;
        el.__zwPillEls.set(String(place.id), built.pill);
      } else {
        const pin = document.createElement('div');
        pin.className = cn(
          'h-3 w-3 rounded-full border-2 border-white shadow cursor-pointer',
          isSelected
            ? 'bg-indigo-500 scale-125'
            : isSaved
              ? 'bg-emerald-500'
              : 'bg-[#ff6b4a]'
        );
        element = pin;
      }

      const marker = new maplibregl.Marker({ element })
        .setLngLat([place.lng, place.lat])
        .addTo(map);
      element.addEventListener('click', (ev) => {
        ev.stopPropagation();
        if (typeof handlers.onPlaceClick === 'function') {
          handlers.onPlaceClick(place);
        }
      });
      next.push(marker);
    });
    el.__zwMarkers = next;
  });

  // Selection-only updates for pills (avoid full rebuild flicker)
  createEffect(() => {
    if (!mapReady()) return;
    const selectedId = readProp(props.selectedPlaceId);
    const el = document.getElementById(elId());
    const pills = el?.__zwPillEls;
    if (!pills) return;
    for (const [id, pill] of pills) {
      applyCityPillMarkerState(pill, String(selectedId ?? '') === String(id));
    }
  });

  // Camera sync (center/zoom only — avoid re-easing on marker updates)
  createEffect(() => {
    if (!mapReady()) return;
    const el = document.getElementById(elId());
    const map = el?.__zwMap;
    if (!map) return;

    const nextCenter = toLngLat(props.center);
    const nextZoom = toZoom(props.zoom);
    const suppress = !!readProp(props.suppressAutoFitBounds);
    const shouldFit = !!readProp(props.fitPlacesBounds);
    const list = shouldFit ? readProp(props.places) || [] : [];

    if (
      !suppress &&
      shouldFit &&
      list.length > 1 &&
      list.every((p) => p.lng != null && p.lat != null)
    ) {
      const bounds = new maplibregl.LngLatBounds();
      list.forEach((p) => bounds.extend([p.lng, p.lat]));
      map.fitBounds(bounds, { padding: 60, maxZoom: 14, duration: 450 });
      return;
    }

    void nextCenter[0];
    void nextCenter[1];
    void nextZoom;
    map.easeTo({ center: nextCenter, zoom: nextZoom, duration: 450 });
  });

  return (
    <div
      id={elId()}
      class={cn(
        'h-full w-full min-h-[320px] bg-muted map-view-raise-bottom-controls',
        readProp(props.class) || readProp(props.className)
      )}
    />
  );
}
