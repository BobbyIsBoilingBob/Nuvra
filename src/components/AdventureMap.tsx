import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, useMap, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import type { AdventureRoute, GeoPoint } from '@/types/adventure'
import { boundingBox } from '@/lib/geo'

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function makeIcon(emoji: string, color: string, size = 32): L.DivIcon {
  return L.divIcon({ className: '', html: `<div class="z-marker" style="width:${size}px;height:${size}px;background:${color};font-size:${size * 0.5}px;">${emoji}</div>`, iconSize: [size, size], iconAnchor: [size / 2, size / 2] })
}
function makePlayerIcon(): L.DivIcon {
  return L.divIcon({ className: '', html: `<div class="z-marker z-pulse" style="width:18px;height:18px;background:#43c79b;font-size:1px;">&nbsp;</div>`, iconSize: [18, 18], iconAnchor: [9, 9] })
}

const CATEGORY_ICONS: Record<string, string> = {
  observation: '👁️', photography: '📷', fitness: '💪', puzzle: '🧩', memory: '🧠', navigation: '🧭',
  compass: '🧭', landmarks: '🏛️', nature: '🌿', collection: '📦', trivia: '❓', timed: '⏱️',
  team: '👥', exploration: '🔍', balance: '⚖️', reaction: '⚡',
}
const DIFFICULTY_COLORS: Record<string, string> = { easy: '#43c79b', medium: '#43a5c7', hard: '#fb5a13', extreme: '#e63946' }

function FitBounds({ points }: { points: GeoPoint[] }) {
  const map = useMap()
  const done = useRef(false)
  useEffect(() => {
    if (done.current || points.length === 0) return
    done.current = true
    const bounds = boundingBox(points, 150)
    map.fitBounds([[bounds.south, bounds.west], [bounds.north, bounds.east]], { padding: [40, 40], maxZoom: 16 })
  }, [map, points])
  return null
}

export interface AdventureMapProps {
  route: AdventureRoute; playerLocation?: GeoPoint | null; className?: string; onCheckpointClick?: (index: number) => void; activeCheckpoint?: number
}

export function AdventureMap({ route, playerLocation, className, onCheckpointClick, activeCheckpoint }: AdventureMapProps) {
  const points: GeoPoint[] = route.geojson.coordinates.map(([lng, lat]) => ({ lat, lng }))
  const center = points[0] ?? { lat: 0, lng: 0 }
  return (
    <MapContainer center={[center.lat, center.lng]} zoom={15} className={className} style={{ width: '100%', height: '100%' }} scrollWheelZoom>
      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap &copy; CARTO' subdomains="abcd" maxZoom={20} />
      <Polyline positions={points.map((p) => [p.lat, p.lng])} pathOptions={{ color: '#43c79b', weight: 4, opacity: 0.8 }} />
      {route.checkpoints.map((cp) => {
        const isStart = cp.isStart, isFinish = cp.isFinish
        const emoji = isStart ? '▶' : isFinish ? '🏁' : (CATEGORY_ICONS[cp.challenge.category] ?? '📍')
        const color = isStart ? '#43c79b' : isFinish ? '#fb5a13' : (DIFFICULTY_COLORS[cp.challenge.difficulty] ?? '#43a5c7')
        const size = activeCheckpoint === cp.index ? 40 : 32
        return <Marker key={cp.index} position={[cp.position.lat, cp.position.lng]} icon={makeIcon(emoji, color, size)} eventHandlers={{ click: () => onCheckpointClick?.(cp.index) }} />
      })}
      {playerLocation && <Marker position={[playerLocation.lat, playerLocation.lng]} icon={makePlayerIcon()} />}
      {playerLocation && <CircleMarker center={[playerLocation.lat, playerLocation.lng]} radius={6} pathOptions={{ color: '#43c79b', fillColor: '#43c79b', fillOpacity: 0.8 }} />}
      <FitBounds points={points} />
    </MapContainer>
  )
}
