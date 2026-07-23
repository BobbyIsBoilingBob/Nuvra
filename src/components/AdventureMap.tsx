import { memo, useMemo } from 'react'
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { useEffect } from 'react'
import type { Adventure, GpsPosition } from '@/types/adventure'

delete (L.Icon.Default.prototype as any)._getIconUrl

const tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
const tileAttr = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

function makeCheckpointIcon(idx: number, completed: boolean) {
  const bg = completed ? '#22c55e' : '#10b981'
  return L.divIcon({ html: '<div style="width:32px;height:32px;background:' + bg + ';border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;color:white;box-shadow:0 2px 8px rgba(0,0,0,0.25)">' + (idx + 1) + '</div>', className: '', iconSize: [32, 32], iconAnchor: [16, 16] })
}
function makePlayerIcon(heading: number) {
  return L.divIcon({ html: '<div style="position:relative;width:24px;height:24px"><div style="position:absolute;inset:0;background:#312f81;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div><div style="position:absolute;top:-8px;left:50%;transform:translateX(-50%) rotate(' + heading + 'deg);width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:8px solid #312f81"></div></div>', className: '', iconSize: [24, 24], iconAnchor: [12, 12] })
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap()
  useEffect(() => { if (positions.length > 0) { const bounds = L.latLngBounds(positions); map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 }) } }, [map, positions])
  return null
}

interface Props { adventure: Adventure; playerPos?: GpsPosition | null; completedIndices?: Set<number>; heading?: number }

function AdventureMapInner({ adventure, playerPos, completedIndices, heading = 0 }: Props) {
  const cpPositions: [number, number][] = useMemo(() => adventure.checkpoints.map(cp => [cp.position.lat, cp.position.lng]), [adventure.checkpoints])
  const allPositions = useMemo(() => { const p = [...cpPositions]; if (playerPos) p.push([playerPos.lat, playerPos.lng]); return p }, [cpPositions, playerPos])
  const route = useMemo(() => { const r = [...cpPositions]; if (playerPos && cpPositions.length > 0) r.unshift([playerPos.lat, playerPos.lng]); return r }, [cpPositions, playerPos])

  return (
    <MapContainer center={[adventure.center.lat, adventure.center.lng]} zoom={14} className="w-full h-64 rounded-2xl" scrollWheelZoom={false} zoomControl={true}>
      <TileLayer url={tileUrl} attribution={tileAttr} subdomains='abcd' maxZoom={20} />
      <Polyline positions={route} pathOptions={{ color: '#10b981', weight: 4, opacity: 0.7, dashArray: '8 6' }} />
      <Polyline positions={route} pathOptions={{ color: '#10b981', weight: 2, opacity: 0.4 }} />
      {adventure.checkpoints.map((cp, i) => (
        <Marker key={i} position={[cp.position.lat, cp.position.lng]} icon={makeCheckpointIcon(i, completedIndices?.has(i) ?? false)}>
          <Popup><div style={{ minWidth: 120 }}><strong>Checkpoint {i + 1}</strong>{cp.challenge && <p style={{ fontSize: 12, marginTop: 4 }}>{cp.challenge.title}</p>}</div></Popup>
        </Marker>
      ))}
      {playerPos && (
        <>
          <Marker position={[playerPos.lat, playerPos.lng]} icon={makePlayerIcon(heading)} />
          {playerPos.accuracy && <CircleMarker center={[playerPos.lat, playerPos.lng]} radius={Math.min(playerPos.accuracy / 2, 50)} pathOptions={{ color: '#312f81', fillColor: '#312f81', fillOpacity: 0.1, weight: 1 }} />}
        </>
      )}
      <FitBounds positions={allPositions} />
    </MapContainer>
  )
}

export const AdventureMap = memo(AdventureMapInner)
