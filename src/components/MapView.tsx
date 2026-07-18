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

const checkpointIcon = L.divIcon({
  html: '<div style="width:20px;height:20px;border-radius:50%;background:#f59e0b;border:3px solid #fbbf24;box-shadow:0 0 8px rgba(245,158,11,0.6);"></div>',
  className: '', iconSize: [20, 20], iconAnchor: [10, 10],
});

const playerIcon = L.divIcon({
  html: '<div style="width:16px;height:16px;border-radius:50%;background:#22d3ee;border:3px solid #67e8f9;box-shadow:0 0 10px rgba(34,211,238,0.8);"></div>',
  className: '', iconSize: [16, 16], iconAnchor: [8, 8],
});

interface MapViewProps {
  center: GeoPoint;
  route: GeoPoint[];
  fitRoute?: boolean;
  checkpoints?: GeoPoint[];
  followPlayer?: boolean;
  satellite?: boolean;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
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
    } else if (route.length === 1) {
      map.setView([route[0].lat, route[0].lng], 16);
    }
  }, [route, map]);
  return null;
}

function PlayerFollower({ position }: { position: GeoPoint | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.panTo([position.lat, position.lng], { animate: true });
  }, [position, map]);
  return null;
}

export default function MapView({ center, route, fitRoute = false, checkpoints = [], followPlayer = false, satellite = false }: MapViewProps) {
  const latLngs = route.map((p) => [p.lat, p.lng]) as [number, number][];
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={15}
      className="h-full w-full" style={{ minHeight: 300, zIndex: 0 }}>
      <TileLayer
        url={satellite
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
        attribution={satellite ? '&copy; Esri' : '&copy; OpenStreetMap contributors'}
      />
      <MapResizer />
      {fitRoute && <RouteFitter route={route} />}
      {followPlayer && <PlayerFollower position={route.length > 0 ? route[route.length - 1] : null} />}
      <Marker position={[center.lat, center.lng]} icon={playerIcon} />
      {checkpoints.map((cp, i) => <Marker key={i} position={[cp.lat, cp.lng]} icon={checkpointIcon} />)}
      {latLngs.length >= 2 && <Polyline positions={latLngs} pathOptions={{ color: '#22d3ee', weight: 4, opacity: 0.85 }} />}
    </MapContainer>
  );
}
