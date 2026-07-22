import type { GpsPosition, GpsStatus } from '@/types/adventure'
import type { Difficulty } from '@/types/adventure'

export function distanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000
  const dLat = (b.lat - a.lat) * Math.PI / 180
  const dLng = (b.lng - a.lng) * Math.PI / 180
  const lat1 = a.lat * Math.PI / 180
  const lat2 = b.lat * Math.PI / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(1)} km`
}

export function formatDuration(min: number): string {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

export function xpProgressInLevel(xp: number): { current: number; needed: number } {
  const level = levelFromXp(xp)
  const xpForLevel = (level - 1) ** 2 * 100
  const xpForNext = level ** 2 * 100
  return { current: xp - xpForLevel, needed: xpForNext - xpForLevel }
}

export const difficultyColors: Record<Difficulty, string> = {
  easy: 'text-success-600 bg-success-50 border-success-200',
  medium: 'text-brand-600 bg-brand-50 border-brand-200',
  hard: 'text-warning-600 bg-warning-50 border-warning-200',
  extreme: 'text-error-600 bg-error-50 border-error-200',
}
