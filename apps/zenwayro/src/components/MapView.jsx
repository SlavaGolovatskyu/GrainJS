import { createSignal, createEffect, onCleanup } from 'grainlet';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getMapStyleUrl } from '../api/client.js';
import { EUROPE_MAP_CENTER, EUROPE_MAP_ZOOM } from '../constants/product.js';
import { cn } from '../design-system/utils/cn.js';

let mapUid = 0;

function placesFingerprint(places) {
  return JSON.stringify(
    (places || []).map((p) => [p.id, p.lng, p.lat, p.name])
  );
}

function resolveStyle() {
  let style = getMapStyleUrl();
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
  return style;
}

export function MapView(props) {
  const [elId] = createSignal(`zw-map-${++mapUid}`);
  const [places, setPlaces] = createSignal(props.places || []);
  const [center, setCenter] = createSignal(props.center || EUROPE_MAP_CENTER);
  const [zoom, setZoom] = createSignal(props.zoom ?? EUROPE_MAP_ZOOM);
  const [mapReady, setMapReady] = createSignal(false);

  const handlers = {
    onPlaceClick: props.onPlaceClick,
    onMapClick: props.onMapClick,
  };
  handlers.onPlaceClick = props.onPlaceClick;
  handlers.onMapClick = props.onMapClick;

  const nextPlaces = props.places || [];
  const nextCenter = props.center || EUROPE_MAP_CENTER;
  const nextZoom = props.zoom ?? EUROPE_MAP_ZOOM;

  if (placesFingerprint(places()) !== placesFingerprint(nextPlaces)) {
    setPlaces(nextPlaces);
  }
  const prevCenter = center();
  if (
    !prevCenter ||
    prevCenter[0] !== nextCenter[0] ||
    prevCenter[1] !== nextCenter[1]
  ) {
    setCenter(nextCenter);
  }
  if (zoom() !== nextZoom) {
    setZoom(nextZoom);
  }

  createEffect(() => {
    const id = elId();
    let cancelled = false;
    let map = null;

    const boot = () => {
      const el = document.getElementById(id);
      if (!el || cancelled) return;

      map = new maplibregl.Map({
        container: el,
        style: resolveStyle(),
        center: center(),
        zoom: zoom(),
        minZoom: 3,
      });
      el.__zwMap = map;
      el.__zwMarkers = [];
      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        'top-right'
      );
      map.on('click', (e) => {
        if (typeof handlers.onMapClick === 'function') {
          handlers.onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
        }
      });
      setMapReady(true);
    };

    requestAnimationFrame(boot);

    onCleanup(() => {
      cancelled = true;
      setMapReady(false);
      const el = document.getElementById(id);
      const markers = el?.__zwMarkers || [];
      markers.forEach((m) => m.remove());
      if (el) {
        el.__zwMarkers = [];
        el.__zwMap = null;
      }
      if (map) map.remove();
    });
  });

  createEffect(() => {
    if (!mapReady()) return;
    const list = places();
    const el = document.getElementById(elId());
    const map = el?.__zwMap;
    if (!map || !el) return;

    const prev = el.__zwMarkers || [];
    prev.forEach((m) => m.remove());
    const next = [];
    list.forEach((place) => {
      if (place.lng == null || place.lat == null) return;
      const pin = document.createElement('div');
      pin.className =
        'h-3 w-3 rounded-full border-2 border-white bg-[#ff6b4a] shadow cursor-pointer';
      const marker = new maplibregl.Marker({ element: pin })
        .setLngLat([place.lng, place.lat])
        .addTo(map);
      pin.addEventListener('click', (ev) => {
        ev.stopPropagation();
        if (typeof handlers.onPlaceClick === 'function') {
          handlers.onPlaceClick(place);
        }
      });
      next.push(marker);
    });
    el.__zwMarkers = next;
  });

  createEffect(() => {
    if (!mapReady()) return;
    const el = document.getElementById(elId());
    const map = el?.__zwMap;
    if (!map) return;
    map.easeTo({ center: center(), zoom: zoom(), duration: 450 });
  });

  return (
    <div
      id={elId()}
      class={cn(
        'h-full w-full min-h-[320px] bg-muted map-view-raise-bottom-controls',
        props.class || props.className
      )}
    />
  );
}
