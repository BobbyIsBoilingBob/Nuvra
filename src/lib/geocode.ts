import type { GeoPoint } from '@/types/adventure'

export async function geocodeLocation(query: string): Promise<{ point: GeoPoint; label: string } | null> {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) return null
    const r = data[0]
    return { point: { lat: parseFloat(r.lat), lng: parseFloat(r.lon) }, label: r.display_name?.split(',').slice(0, 2).join(',').trim() || query }
  } catch { return null }
}
