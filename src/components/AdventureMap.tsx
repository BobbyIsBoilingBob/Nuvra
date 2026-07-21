import { MapContainer, TileLayer, Polyline, Marker, useMap, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import { useEffect, useMemo } from 'react'
import type { Adventure, GeoPoint, GpsPosition, ChallengeCategory } from '@/types/adventure'
import { boundingBox } from '@/lib/geo'

const diffColors: Record<string, string> = {
  easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444', extreme: '#a855f7',
}

const categorySvg: Record<ChallengeCategory | 'none', string> = {
  observation: '<circle cx="12" cy="12" r="3"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>',
  photography: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z"/><circle cx="12" cy="13" r="3"/>',
  fitness: '<path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/>',
  puzzle: '<path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568a2.402 2.402 0 0 1 0 3.408l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.928a2.5 2.5 0 1 0-3.214 3.214c.448.166.858.497.928.968a.98.98 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-3.405 0l-1.568-1.568a1.026 1.026 0 0 0-.877-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a1.026 1.026 0 0 0-.289-.877l-1.568-1.568A2.402 2.402 0 0 1 2 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 2c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.878.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02Z"/>',
  memory: '<path d="M12 5a3 3 0 1 0-5.997.142 4 4 0 0 0-2.526 5.29 4 4 0 0 0 1.052 7.634A4 4 0 0 0 12 21.874a4 4 0 0 0 6.471-3.808 4 4 0 0 0 1.052-7.634 4 4 0 0 0-2.526-5.29A3 3 0 0 0 12 5Z"/>',
  navigation: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
  compass: '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
  landmarks: '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
  nature: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7Z"/>',
  collection: '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  trivia: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12.01" y1="17" y2="17"/>',
  timed: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  team: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  exploration: '<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/>',
  balance: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
  reaction: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  none: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>',
}

function FitBounds({ path }: { path: GeoPoint[] }) {
  const map = useMap()
  useEffect(() => {
    if (path.length === 0) return
    const bb = boundingBox(path)
    const bounds = L.latLngBounds([bb.south, bb.west], [bb.north, bb.east])
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 })
  }, [map, path])
  return null
}

function makeCheckpointIcon(category: ChallengeCategory | 'none', color: string, index: number, isCompleted: boolean): L.DivIcon {
  const svgPath = categorySvg[category] || categorySvg.none
  const opacity = isCompleted ? '0.5' : '1'
  const checkOverlay = isCompleted ? '<circle cx="18" cy="18" r="6" fill="#22c55e" stroke="white" stroke-width="1.5"/><path d="M15.5 18l2 2 3-3" stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' : ''
  const html = `
    <div class="cp-marker" style="position:relative;">
      <div style="width:36px;height:36px;background:${color};border:2.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 8px rgba(0,0,0,0.5);opacity:${opacity};">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg>
      </div>
      <div style="position:absolute;top:-2px;left:-2px;width:14px;height:14px;background:#0f172a;border:1.5px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:8px;font-weight:700;color:white;">${index + 1}</div>
      ${checkOverlay}
    </div>`
  return L.divIcon({ className: '', html, iconSize: [36, 36], iconAnchor: [18, 18] })
}

function makePlayerIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: '<div class="player-pulse" style="width:16px;height:16px;background:#34d399;border:2.5px solid white;border-radius:50%;box-shadow:0 0 12px #34d399;"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

interface Props {
  adventure: Adventure
  playerPos?: GpsPosition | null
  completedIndices?: Set<number>
}

export default function AdventureMap({ adventure, playerPos, completedIndices }: Props) {
  const { path, checkpoints, difficulty } = adventure
  const color = diffColors[difficulty] ?? '#34d399'
  const completed = completedIndices ?? new Set<number>()

  const pathPositions = useMemo(() => path.map(p => [p.lat, p.lng] as [number, number]), [path])

  return (
    <MapContainer
      center={[adventure.center.lat, adventure.center.lng]}
      zoom={14}
      style={{ height: '300px', width: '100%', borderRadius: '16px', overflow: 'hidden' }}
      scrollWheelZoom={false}
      zoomControl={true}
      attributionControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/voyager/{z}/{x}/{y}{r}.png"
      />
      <Polyline
        positions={pathPositions}
        pathOptions={{ color, weight: 5, opacity: 0.85, lineJoin: 'round', lineCap: 'round' }}
      />
      <Polyline
        positions={pathPositions}
        pathOptions={{ color: '#ffffff', weight: 2, opacity: 0.4, lineJoin: 'round', lineCap: 'round' }}
      />
      {checkpoints.map((cp, i) => {
        const cat = cp.challenge?.category ?? 'none'
        const c = cp.challenge ? diffColors[cp.challenge.difficulty] ?? color : color
        return (
          <Marker
            key={i}
            position={[cp.position.lat, cp.position.lng]}
            icon={makeCheckpointIcon(cat, c, i, completed.has(i))}
          />
        )
      })}
      {playerPos && (
        <>
          <Marker position={[playerPos.lat, playerPos.lng]} icon={makePlayerIcon()} />
          <CircleMarker
            center={[playerPos.lat, playerPos.lng]}
            radius={Math.max(5, Math.min(20, playerPos.accuracy / 2))}
            pathOptions={{ color: '#34d399', fillColor: '#34d399', fillOpacity: 0.1, weight: 1 }}
          />
        </>
      )}
      <FitBounds path={path} />
    </MapContainer>
  )
}
