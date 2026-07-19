import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import type { GeoPoint } from '../types';

const playerIcon = L.divIcon({ html: '🧭', className: '', iconSize: [32, 32], iconAnchor: [16, 16] });
const checkpointIcon = L.divIcon({ html: '📍', className: '', iconSize: [28, 28], iconAnchor: [14, 28] });

function Recenter({ point }: { point?: GeoPoint | null }) {
  const map = useMap();
  useEffect(() => { if (point) map.setView([point.lat, point.lng], map.getZoom() || 15); }, [point, map]);
  return null;
}

interface Props {
  player?: GeoPoint | null;
  checkpoints?: GeoPoint[];
  route?: GeoPoint[];
  satellite?: boolean;
  center?: GeoPoint;
  zoom?: number;
}

export function MapView({ player, checkpoints = [], route = [], satellite = false, center, zoom = 15 }: Props) {
  const c = center ?? player ?? { lat: 51.5074, lng: -0.1278 };
  return (
    <MapContainer center={[c.lat, c.lng]} zoom={zoom} className="w-full h-full min-h-[300px] rounded-2xl overflow-hidden" scrollWheelZoom>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url={satellite
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
      />
      <Recenter point={player} />
      {route.length > 1 && <Polyline positions={route.map(p => [p.lat, p.lng])} pathOptions={{ color: '#1c7af5', weight: 4, opacity: 0.7 }} />}
      {checkpoints.map((cp, i) => <Marker key={i} position={[cp.lat, cp.lng]} icon={checkpointIcon} />)}
      {player && <Marker position={[player.lat, player.lng]} icon={playerIcon} />}
    </MapContainer>
  );
}
