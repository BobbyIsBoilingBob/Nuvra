import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'
import type { Adventure, GeoPoint, GpsPosition } from '@/types/adventure'
import { boundingBox } from '@/lib/geo'

const diffColors: Record<string, string> = {
  easy: '#22c55e', medium: '#f97316', hard: '#ef4444', extreme: '#a855f7',
}

const catIcons: Record<string, string> = {
  observation: '👁', photography: '📷', fitness: '💪', puzzle: '🧩', memory: '🧠',
  navigation: '🧭', compass: '🧭', landmarks: '🏛', nature: '🌿', collection: '🎒',
  trivia: '❓', timed: '⏱', team: '👥', exploration: '🗺', balance: '⚖️', reaction: '⚡',
  none: '🏁',
}

function FitBounds({ path }: { path: GeoPoint[] }) {
  const map = useMap()
  useEffect(() => {
    if (path.length === 0) return
    const bb = boundingBox(path)
    const bounds = L.latLngBounds([bb.south, bb.west], [bb.north, bb.east])
    map.fitBounds(bounds, { padding: [40, 40] })
  }, [map, path])
  return null
}

function makeIcon(emoji: string, color: string, size = 36) {
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 6px rgba(0,0,0,0.4);">${emoji}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function makePlayerIcon() {
  return L.divIcon({
    className: '',
    html: '<div class="player-pulse" style="width:16px;height:16px;background:#3fc59b;border:2px solid white;border-radius:50%;box-shadow:0 0 8px #3fc59b;"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

interface Props {
  adventure: Adventure
  playerPos?: GpsPosition | null
}

export default function AdventureMap({ adventure, playerPos }: Props) {
  const { path, checkpoints, difficulty } = adventure
  const color = diffColors[difficulty] ?? '#3fc59b'

  return (
    <MapContainer
      center={[adventure.center.lat, adventure.center.lng]}
      zoom={14}
      style={{ height: '300px', width: '100%', borderRadius: '16px' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <Polyline positions={path.map(p => [p.lat, p.lng])} pathOptions={{ color, weight: 4, opacity: 0.8 }} />
      {checkpoints.map((cp, i) => {
        const emoji = cp.challenge ? catIcons[cp.challenge.category] ?? '🏁' : '🏁'
        const c = cp.challenge ? diffColors[cp.challenge.difficulty] ?? color : color
        return (
          <Marker
            key={i}
            position={[cp.position.lat, cp.position.lng]}
            icon={makeIcon(emoji, c)}
          />
        )
      })}
      {playerPos && (
        <Marker position={[playerPos.lat, playerPos.lng]} icon={makePlayerIcon()} />
      )}
      <FitBounds path={path} />
    </MapContainer>
  )
}
