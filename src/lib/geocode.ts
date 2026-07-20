import type { GeoPoint } from '@/types/adventure'

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
  type: string
  importance: number
  address?: Record<string, string>
}

const NOMINATIM_SEARCH = 'https://nominatim.openstreetmap.org/search'
const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse'

export interface GeocodeResult extends GeoPoint {
  label: string
  type: string
}

/**
 * Geocode a free-text location query to coordinates using OpenStreetMap Nominatim.
 * Returns null if the query is empty or the service fails — the caller must
 * then ask the user for a location. NEVER silently defaults to any city.
 */
export async function geocodeLocation(query: string): Promise<GeocodeResult | null> {
  const trimmed = query.trim()
  if (!trimmed) return null

  const url = `${NOMINATIM_SEARCH}?format=json&q=${encodeURIComponent(trimmed)}&limit=1&addressdetails=1`
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    })
    if (!res.ok) return null
    const data = (await res.json()) as NominatimResult[]
    if (!data || data.length === 0) return null
    const r = data[0]
    return {
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      label: r.display_name,
      type: r.type,
    }
  } catch {
    return null
  }
}

/**
 * Reverse-geocode coordinates to a human-readable label.
 * Returns a short label (suburb, city) or null on failure.
 */
export async function reverseGeocode(point: GeoPoint): Promise<string | null> {
  const url = `${NOMINATIM_REVERSE}?format=json&lat=${point.lat}&lon=${point.lng}&zoom=14&addressdetails=1`
  try {
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' },
    })
    if (!res.ok) return null
    const r = (await res.json()) as NominatimResult
    if (!r || !r.address) return r?.display_name ?? null
    const a = r.address
    const parts = [
      a.suburb || a.neighbourhood || a.hamlet,
      a.city || a.town || a.village || a.municipality,
      a.state,
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : (r.display_name ?? null)
  } catch {
    return null
  }
}

/**
 * Search for nearby points of interest (parks, beaches, trails, etc.) around
 * a centre point. Used for suggested adventures.
 */
export async function searchNearbyPois(
  center: GeoPoint,
  radiusMeters: number,
): Promise<Array<{ point: GeoPoint; label: string; type: string }>> {
  // Nominatim doesn't support radius search directly; use a bounding box.
  const latDelta = radiusMeters / 111000
  const lngDelta = radiusMeters / (111000 * Math.cos((center.lat * Math.PI) / 180))
  const bbox = `${center.lat + latDelta},${center.lng - lngDelta},${center.lat - latDelta},${center.lng + lngDelta}`
  const categories = ['park', 'beach', 'forest', 'lake', 'river', 'viewpoint', 'garden', 'historic', 'trail']
  const results: Array<{ point: GeoPoint; label: string; type: string }> = []

  for (const cat of categories) {
    try {
      const url = `${NOMINATIM_SEARCH}?format=json&q=${encodeURIComponent(cat)}&viewbox=${bbox}&bounded=1&limit=3&addressdetails=1`
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
      if (!res.ok) continue
      const data = (await res.json()) as NominatimResult[]
      for (const r of (data || []).slice(0, 2)) {
        results.push({
          point: { lat: parseFloat(r.lat), lng: parseFloat(r.lon) },
          label: r.display_name.split(',').slice(0, 2).join(','),
          type: cat,
        })
      }
    } catch {
      // continue to next category
    }
  }
  return results
}
