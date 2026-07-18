import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { routeToLatLngs } from '../lib/map-utils';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200);
    const ro = new ResizeObserver(() => map.invalidateSize());
    const container = map.getContainer();
    ro.observe(container);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, [map]);
  return null;
}

function RouteFitter({ route }: { route: { lat: number; lng: number }[] }) {
  const map = useMap();
  useEffect(() => {
    if (route.length >= 2) {
      const bounds = L.latLngBounds(route.map((p) => [p.lat, p.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [route, map]);
  return null;
}

type MapViewProps = {
  center: [number, number];
  markers?: { position: [number, number]; popup?: string }[];
  route?: { lat: number; lng: number }[];
  zoom?: number;
  fitRoute?: boolean;
};

export function MapView({ center, markers = [], route = [], zoom = 15, fitRoute = false }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const latLngs = routeToLatLngs(route);
  return (
    <div ref={containerRef} style={{ height: '100%', width: '100%', minHeight: '200px' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%', minHeight: '200px' }} className="rounded-2xl">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
        <MapResizer />
        {fitRoute && <RouteFitter route={route} />}
        {markers.map((m, i) => (
          <Marker key={i} position={m.position}>
            {m.popup && <Popup>{m.popup}</Popup>}
          </Marker>
        ))}
        {latLngs.length >= 2 && <Polyline positions={latLngs} color="#fbbf24" weight={4} opacity={0.8} />}
      </MapContainer>
    </div>
  );
}
