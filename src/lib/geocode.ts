import type { GeoPoint } from '@/types/adventure'

export interface GeocodeResult {
  label: string
  point: GeoPoint
  displayName: string
}

export async function geocodeLocation(query: string): Promise<GeocodeResult | null> {
  if (!query.trim()) return null
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (!res.ok) return null
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return null
    const r = data[0]
    return {
      label: r.name || query,
      point: { lat: parseFloat(r.lat), lng: parseFloat(r.lon) },
      displayName: r.display_name || r.name || query,
    }
  } catch {
    return null
  }
}

export async function reverseGeocode(point: GeoPoint): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${point.lat}&lon=${point.lng}&format=json`
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (!res.ok) return null
    const data = await res.json()
    return data.display_name || data.name || null
  } catch {
    return null
  }
}
