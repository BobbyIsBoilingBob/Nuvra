import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { useEffect, useMemo } from 'react';
import L from 'leaflet';
import type { GeoPoint, ChallengeKind } from '../types';

const playerIcon = L.divIcon({ html: '🧭', className: '', iconSize: [32, 32], iconAnchor: [16, 16] });
const startIcon = L.divIcon({ html: '🟢', className: '', iconSize: [28, 28], iconAnchor: [14, 14] });
const finishIcon = L.divIcon({ html: '🏁', className: '', iconSize: [28, 28], iconAnchor: [14, 14] });
const checkpointIcon = L.divIcon({ html: '📍', className: '', iconSize: [28, 28], iconAnchor: [14, 28] });

const CHALLENGE_EMOJI: Record<ChallengeKind, string> = {
  observation: '🔍', trivia: '❓', photography: '📷', puzzle: '🧩', memory: '🧠',
  direction: '🧭', fitness: '💪', nature: '🌿', landmark: '🏛️', exploration: '🚶',
  collection: '🎒', timed: '⏱️', team: '👥',
};

export interface ChallengeMarker {
  point: GeoPoint;
  kind: ChallengeKind;
  title: string;
}

interface Props {
  player?: GeoPoint | null;
  checkpoints?: GeoPoint[];
  route?: GeoPoint[];
  challenges?: ChallengeMarker[];
  satellite?: boolean;
  center?: GeoPoint;
  zoom?: number;
  fitBounds?: boolean;
  showStartFinish?: boolean;
}

function FitBounds({ points }: { points: GeoPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) { map.setView([points[0].lat, points[0].lng], 15); return; }
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
  }, [points, map]);
  return null;
}

function Recenter({ point, zoom }: { point?: GeoPoint | null; zoom?: number }) {
  const map = useMap();
  useEffect(() => { if (point) map.setView([point.lat, point.lng], zoom ?? (map.getZoom() || 15)); }, [point, zoom, map]);
  return null;
}

export function MapView({
  player, checkpoints = [], route = [], challenges = [], satellite = false,
  center, zoom = 15, fitBounds = false, showStartFinish = false,
}: Props) {
  const allPoints = useMemo(() => {
    const pts: GeoPoint[] = [];
    if (route.length) pts.push(...route);
    else pts.push(...checkpoints);
    challenges.forEach((c) => pts.push(c.point));
    if (player) pts.push(player);
    return pts;
  }, [route, checkpoints, challenges, player]);

  const start = showStartFinish && checkpoints.length ? checkpoints[0] : null;
  const finish = showStartFinish && checkpoints.length > 1 ? checkpoints[checkpoints.length - 1] : null;
  const middleCheckpoints = showStartFinish ? checkpoints.slice(1, -1) : checkpoints;

  const fallbackCenter = center ?? player ?? checkpoints[0] ?? { lat: 51.5074, lng: -0.1278 };

  return (
    <MapContainer
      center={[fallbackCenter.lat, fallbackCenter.lng]}
      zoom={zoom}
      className="w-full h-full min-h-[300px] rounded-2xl overflow-hidden"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url={satellite
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
      />
      {fitBounds ? <FitBounds points={allPoints} /> : <Recenter point={player ?? center ?? undefined} zoom={zoom} />}
      {route.length > 1 && (
        <Polyline positions={route.map((p) => [p.lat, p.lng])} pathOptions={{ color: '#1c7af5', weight: 4, opacity: 0.7 }} />
      )}
      {start && <Marker position={[start.lat, start.lng]} icon={startIcon} />}
      {middleCheckpoints.map((cp, i) => (
        <Marker key={`cp-${i}`} position={[cp.lat, cp.lng]} icon={checkpointIcon} />
      ))}
      {finish && <Marker position={[finish.lat, finish.lng]} icon={finishIcon} />}
      {challenges.map((c, i) => (
        <Marker
          key={`ch-${i}`}
          position={[c.point.lat, c.point.lng]}
          icon={L.divIcon({ html: CHALLENGE_EMOJI[c.kind] ?? '🎯', className: '', iconSize: [28, 28], iconAnchor: [14, 14] })}
        />
      ))}
      {player && <Marker position={[player.lat, player.lng]} icon={playerIcon} />}
    </MapContainer>
  );
}
