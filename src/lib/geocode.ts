import type { GeoPoint } from '@/types/adventure'

interface GeocodeResult {
  point: GeoPoint
  label: string
}

export async function geocodeLocation(query: string): Promise<GeocodeResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } })
    if (!res.ok) return null
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return null
    const r = data[0]
    return {
      point: { lat: parseFloat(r.lat), lng: parseFloat(r.lon) },
      label: r.display_name?.split(',').slice(0, 2).join(',').trim() || query,
    }
  } catch {
    return null
  }
}
