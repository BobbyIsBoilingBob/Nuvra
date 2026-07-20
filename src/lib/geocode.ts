import type { GeoPoint } from '@/types/adventure'

interface NominatimResult { lat: string; lon: string; display_name: string; type: string; importance: number; address?: Record<string, string> }

const NOMINATIM_SEARCH = 'https://nominatim.openstreetmap.org/search'
const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse'

export interface GeocodeResult extends GeoPoint { label: string; type: string }

export async function geocodeLocation(query: string): Promise<GeocodeResult | null> {
  const trimmed = query.trim()
  if (!trimmed) return null
  const url = `${NOMINATIM_SEARCH}?format=json&q=${encodeURIComponent(trimmed)}&limit=1&addressdetails=1`
  try {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (!res.ok) return null
    const data = (await res.json()) as NominatimResult[]
    if (!data || data.length === 0) return null
    const r = data[0]
    return { lat: parseFloat(r.lat), lng: parseFloat(r.lon), label: r.display_name, type: r.type }
  } catch { return null }
}

export async function reverseGeocode(point: GeoPoint): Promise<string | null> {
  const url = `${NOMINATIM_REVERSE}?format=json&lat=${point.lat}&lon=${point.lng}&zoom=14&addressdetails=1`
  try {
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (!res.ok) return null
    const r = (await res.json()) as NominatimResult
    if (!r || !r.address) return r?.display_name ?? null
    const a = r.address
    const parts = [a.suburb || a.neighbourhood || a.hamlet, a.city || a.town || a.village || a.municipality, a.state].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : (r.display_name ?? null)
  } catch { return null }
}
