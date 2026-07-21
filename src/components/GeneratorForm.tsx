import { useState, useCallback } from 'react'
import { MapPin, Sparkles, Compass, Camera, Smartphone, Navigation } from 'lucide-react'
import type { AdventurePreferences, ChallengeCategory, Difficulty, GpsStatus, SensorAvailability } from '@/types/adventure'
import { ALL_CATEGORIES } from '@/data/challenges'
import { categoryIcons } from '@/data/icons'
import { detectSensors } from '@/lib/sensors'
import { getCurrentPosition } from '@/lib/gps'

interface Props {
  onGenerate: (prefs: AdventurePreferences, center: { lat: number; lng: number } | null, locationName: string) => void
  gpsStatus: GpsStatus
  setGpsStatus: (s: GpsStatus) => void
}

const DIFFICULTIES: { id: Difficulty; label: string; color: string; activeColor: string }[] = [
  { id: 'easy', label: 'Easy', color: 'bg-success-500/20 text-success-400', activeColor: 'bg-success-500 text-white' },
  { id: 'medium', label: 'Medium', color: 'bg-accent-500/20 text-accent-400', activeColor: 'bg-accent-500 text-white' },
  { id: 'hard', label: 'Hard', color: 'bg-error-500/20 text-error-400', activeColor: 'bg-error-500 text-white' },
  { id: 'extreme', label: 'Extreme', color: 'bg-purple-500/20 text-purple-400', activeColor: 'bg-purple-500 text-white' },
]

const DURATIONS = [20, 30, 45, 60, 90, 120, 240]
const DURATION_LABELS: Record<number, string> = {
  20: '20 min', 30: '30 min', 45: '45 min', 60: '1 hr', 90: '1.5 hr', 120: '2 hr', 240: '4 hr',
}

export default function GeneratorForm({ onGenerate, gpsStatus, setGpsStatus }: Props) {
  const [location, setLocation] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [duration, setDuration] = useState(45)
  const [maxKm, setMaxKm] = useState('')
  const [minKm, setMinKm] = useState('')
  const [approxKm, setApproxKm] = useState('')
  const [cats, setCats] = useState<ChallengeCategory[]>([])
  const [generating, setGenerating] = useState(false)
  const [sensorAvail] = useState<SensorAvailability>(detectSensors)

  const toggleCat = useCallback((c: ChallengeCategory) => {
    setCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }, [])

  const useGps = async () => {
    setGpsStatus('locating')
    const pos = await getCurrentPosition()
    if (pos) {
      setLocation(`${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`)
      setGpsStatus('located')
    } else {
      setGpsStatus('denied')
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      let center: { lat: number; lng: number } | null = null
      let locationName = location || 'Your Location'

      if (location.trim()) {
        const { geocodeLocation } = await import('@/lib/geocode')
        const result = await geocodeLocation(location)
        if (result) { center = result.point; locationName = result.label }
      }

      if (!center) {
        const pos = await getCurrentPosition()
        if (pos) { center = { lat: pos.lat, lng: pos.lng }; locationName = 'Your GPS Location'; setGpsStatus('located') }
      }

      const prefs: AdventurePreferences = {
        location: location || undefined,
        maxDistanceKm: maxKm ? parseFloat(maxKm) : undefined,
        minDistanceKm: minKm ? parseFloat(minKm) : undefined,
        approxDistanceKm: approxKm ? parseFloat(approxKm) : undefined,
        difficulty, durationMin: duration, categories: cats,
      }
      onGenerate(prefs, center, locationName)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Location (optional)</label>
        <div className="flex gap-2 mt-1.5">
          <input
            type="text" value={location} onChange={e => setLocation(e.target.value)}
            placeholder="e.g. Brisbane, Noosa, Central Park..."
            className="flex-1 bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition"
          />
          <button
            onClick={useGps}
            className="px-3 py-2.5 bg-ink-800 border border-ink-700 rounded-xl text-sm text-brand-400 hover:bg-ink-700 transition whitespace-nowrap active:scale-95 flex items-center gap-1.5"
          >
            <MapPin size={16} /> GPS
          </button>
        </div>
        <p className="text-xs text-ink-500 mt-1.5">
          {gpsStatus === 'locating' ? 'Getting your location...' :
           gpsStatus === 'located' ? 'GPS location found!' :
           gpsStatus === 'denied' ? 'GPS denied — enter a location above' :
           gpsStatus === 'unavailable' ? 'GPS not available — enter a location above' :
           'Leave blank to use your GPS location.'}
        </p>
      </div>

      <div>
        <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Difficulty</label>
        <div className="flex gap-2 mt-1.5">
          {DIFFICULTIES.map(d => (
            <button
              key={d.id} onClick={() => setDifficulty(d.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition active:scale-95 ${difficulty === d.id ? d.activeColor : `bg-ink-900 border border-ink-700 ${d.color} hover:bg-ink-800`}`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Adventure Length</label>
        <div className="flex flex-wrap gap-2 mt-1.5">
          {DURATIONS.map(d => (
            <button
              key={d} onClick={() => setDuration(d)}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition active:scale-95 ${duration === d ? 'bg-brand-500 text-white' : 'bg-ink-900 border border-ink-700 text-ink-400 hover:text-ink-200 hover:bg-ink-800'}`}
            >
              {DURATION_LABELS[d]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Distance Preferences (optional)</label>
        <div className="flex gap-2 mt-1.5">
          <input type="number" value={maxKm} onChange={e => setMaxKm(e.target.value)} placeholder="Max km"
            className="w-1/3 bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition" />
          <input type="number" value={minKm} onChange={e => setMinKm(e.target.value)} placeholder="Min km"
            className="w-1/3 bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition" />
          <input type="number" value={approxKm} onChange={e => setApproxKm(e.target.value)} placeholder="~ km"
            className="w-1/3 bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition" />
        </div>
        <p className="text-xs text-ink-500 mt-1.5">All distance fields are optional.</p>
      </div>

      <div>
        <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Challenge Types (optional)</label>
        <div className="flex flex-wrap gap-2 mt-1.5">
          {ALL_CATEGORIES.map(c => {
            const Icon = categoryIcons[c.id]
            return (
              <button
                key={c.id} onClick={() => toggleCat(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition active:scale-95 flex items-center gap-1.5 ${cats.includes(c.id) ? 'bg-brand-500 text-white' : 'bg-ink-900 border border-ink-700 text-ink-400 hover:text-ink-200 hover:bg-ink-800'}`}
              >
                <Icon size={14} /> {c.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {sensorAvail.compass && <span className="text-xs text-ink-500 bg-ink-900/80 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-ink-800"><Compass size={12} /> Compass</span>}
        {sensorAvail.accelerometer && <span className="text-xs text-ink-500 bg-ink-900/80 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-ink-800"><Smartphone size={12} /> Accelerometer</span>}
        {sensorAvail.camera && <span className="text-xs text-ink-500 bg-ink-900/80 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-ink-800"><Camera size={12} /> Camera</span>}
        {sensorAvail.gps && <span className="text-xs text-ink-500 bg-ink-900/80 px-2.5 py-1 rounded-lg flex items-center gap-1 border border-ink-800"><Navigation size={12} /> GPS</span>}
      </div>

      <button
        onClick={handleGenerate} disabled={generating}
        className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition disabled:opacity-50 active:scale-95 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
      >
        {generating ? (
          <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
        ) : (
          <><Sparkles size={18} /> Generate Adventure</>
        )}
      </button>
    </div>
  )
}
