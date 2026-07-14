import { createEffect, onCleanup } from 'grain';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { getMapStyleUrl } from '../api/client.js';
import { EUROPE_MAP_CENTER, EUROPE_MAP_ZOOM } from '../constants/product.js';
import { cn } from '../design-system/utils/cn.js';

let mapUid = 0;

export function MapView(props) {
  const id = `zw-map-${++mapUid}`;
  const center = props.center || EUROPE_MAP_CENTER;
  const zoom = props.zoom ?? EUROPE_MAP_ZOOM;
  const places = props.places || [];

  createEffect(() => {
    let cancelled = false;
    let map = null;
    const markers = [];

    const boot = () => {
      const el = document.getElementById(id);
      if (!el || cancelled) return;

      let style = getMapStyleUrl();
      if (!style || String(style).includes('demo')) {
        style = {
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

      map = new maplibregl.Map({
        container: el,
        style,
        center,
        zoom,
        minZoom: 3,
      });
      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        'top-right'
      );

      places.forEach((place) => {
        if (place.lng == null || place.lat == null) return;
        const pin = document.createElement('div');
        pin.className =
          'h-3 w-3 rounded-full border-2 border-white bg-[#ff6b4a] shadow cursor-pointer';
        const marker = new maplibregl.Marker({ element: pin })
          .setLngLat([place.lng, place.lat])
          .addTo(map);
        if (props.onPlaceClick) {
          pin.addEventListener('click', (e) => {
            e.stopPropagation();
            props.onPlaceClick(place);
          });
        }
        markers.push(marker);
      });

      map.on('click', (e) => {
        if (typeof props.onMapClick === 'function') {
          props.onMapClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
        }
      });
    };

    requestAnimationFrame(boot);

    onCleanup(() => {
      cancelled = true;
      markers.forEach((m) => m.remove());
      if (map) map.remove();
    });
  });

  return (
    <div
      id={id}
      class={cn(
        'h-full w-full min-h-[320px] bg-muted map-view-raise-bottom-controls',
        props.class || props.className
      )}
    />
  );
}
