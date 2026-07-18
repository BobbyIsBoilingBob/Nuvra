import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { DEFAULT_CENTER, routeToLatLngs, type LatLng } from '../lib/map-utils';

// Fix Leaflet default icon paths
const defaultIcon = L.Icon.Default as unknown as { imagePath: string };
defaultIcon.imagePath = 'https://unpkg.com/leaflet@1.9.4/dist/images/';

type MapViewProps = {
  center?: LatLng;
  route?: { x: number; y: number }[];
  markers?: { lat: number; lng: number; emoji?: string; color?: string; popup?: string }[];
  showUserLocation?: boolean;
  zoom?: number;
  className?: string;
  interactive?: boolean;
};

export default function MapView({
  center = DEFAULT_CENTER,
  route = [],
  markers = [],
  showUserLocation = false,
  zoom = 15,
  className = '',
  interactive = true,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Ensure container has dimensions before initializing
    const container = containerRef.current;
    if (container.offsetHeight === 0) {
      container.style.height = '100%';
    }

    const map = L.map(container, {
      center: [center.lat, center.lng],
      zoom,
      zoomControl: interactive,
      dragging: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      touchZoom: interactive,
      attributionControl: false,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // CRITICAL: invalidateSize after the container has rendered.
    // Lazy-loaded components mount before the container has its final dimensions,
    // so Leaflet computes tile positions against a zero-height box and shows nothing.
    const invalidateTimer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    // Also watch for container resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(container);

    return () => {
      clearTimeout(invalidateTimer);
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update center when prop changes
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([center.lat, center.lng], zoom, { animate: true });
    }
  }, [center.lat, center.lng, zoom]);

  // Draw route
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Clear previous layers except tile layer
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    if (route.length > 0) {
      const latlngs = routeToLatLngs(route, center);
      L.polyline(latlngs, { color: '#00c4ff', weight: 4, opacity: 0.8 }).addTo(map);
      // Start marker
      if (latlngs[0]) {
        L.marker(latlngs[0], { icon: createEmojiMarker('🚩', '#22c55e') }).addTo(map);
      }
      // End marker
      if (latlngs[latlngs.length - 1]) {
        L.marker(latlngs[latlngs.length - 1], { icon: createEmojiMarker('🏁', '#ef4444') }).addTo(map);
      }
    }

    for (const m of markers) {
      const marker = L.marker([m.lat, m.lng], {
        icon: createEmojiMarker(m.emoji ?? '📍', m.color ?? '#00c4ff'),
      }).addTo(map);
      if (m.popup) marker.bindPopup(m.popup);
    }

    if (showUserLocation) {
      L.circleMarker([center.lat, center.lng], {
        radius: 8, fillColor: '#00c4ff', fillOpacity: 1, color: '#fff', weight: 2,
      }).addTo(map);
    }
  }, [route, markers, center, showUserLocation]);

  return <div ref={containerRef} className={`w-full h-full ${className}`} style={{ minHeight: '200px' }} />;
}

function createEmojiMarker(emoji: string, color: string): L.DivIcon {
  return L.divIcon({
    className: 'zeviqo-marker',
    html: `<div style="font-size:24px; background:${color}22; border:2px solid ${color}; border-radius:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center;">${emoji}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}
