import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { GeoPoint } from '../types';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

interface MapViewProps {
  center: GeoPoint;
  route: GeoPoint[];
  fitRoute?: boolean;
  checkpoints?: GeoPoint[];
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200);
    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);
    return () => { clearTimeout(t); window.removeEventListener('resize', onResize); };
  }, [map]);
  return null;
}

function RouteFitter({ route }: { route: GeoPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (route.length >= 2) {
      const bounds = L.latLngBounds(route.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [route, map]);
  return null;
}

export default function MapView({ center, route, fitRoute = false, checkpoints = [] }: MapViewProps) {
  const latLngs = route.map((p) => [p.lat, p.lng]) as [number, number][];
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={15}
      className="h-full w-full rounded-2xl overflow-hidden" style={{ minHeight: 300 }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
      <MapResizer />
      {fitRoute && route.length >= 2 && <RouteFitter route={route} />}
      <Marker position={[center.lat, center.lng]} />
      {checkpoints.map((cp, i) => <Marker key={i} position={[cp.lat, cp.lng]} />)}
      {latLngs.length >= 2 && <Polyline positions={latLngs} pathOptions={{ color: '#22d3ee', weight: 4, opacity: 0.8 }} />}
    </MapContainer>
  );
}
