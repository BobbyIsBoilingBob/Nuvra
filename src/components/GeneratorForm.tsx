import { useState, useCallback } from 'react'
import { MapPin, Sparkles, Compass, Camera, Smartphone, Navigation } from 'lucide-react'
import type { AdventurePreferences, ChallengeCategory, Difficulty, GpsStatus, SensorAvailability } from '@/types/adventure'
import { ALL_CATEGORIES } from '@/data/challenges'
import { categoryIcons } from '@/data/icons'
import { detectSensors } from '@/lib/sensors'
import { getCurrentPosition } from '@/lib/gps'
import { geocodeLocation } from '@/lib/geocode'

interface Props {
  onGenerate: (prefs: AdventurePreferences, center: { lat: number; lng: number } | null, locationName: string) => void
  gpsStatus: GpsStatus; setGpsStatus: (s: GpsStatus) => void
}

const DIFFS: { id: Difficulty; label: string; active: string }[] = [
  { id: 'easy', label: 'Easy', active: 'from-emerald-500 to-emerald-600' },
  { id: 'medium', label: 'Medium', active: 'from-amber-500 to-orange-500' },
  { id: 'hard', label: 'Hard', active: 'from-red-500 to-rose-600' },
  { id: 'extreme', label: 'Extreme', active: 'from-purple-500 to-violet-600' },
]
const DURATIONS = [20, 30, 45, 60, 90, 120, 240]
const DUR_LABELS: Record<number, string> = { 20: '20 min', 30: '30 min', 45: '45 min', 60: '1 hr', 90: '1.5 hr', 120: '2 hr', 240: '4 hr' }

export default function GeneratorForm({ onGenerate, gpsStatus, setGpsStatus }: Props) {
  const [location, setLocation] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [duration, setDuration] = useState(45)
  const [maxKm, setMaxKm] = useState(''), [minKm, setMinKm] = useState(''), [approxKm, setApproxKm] = useState('')
  const [cats, setCats] = useState<ChallengeCategory[]>([])
  const [generating, setGenerating] = useState(false)
  const [sensorAvail] = useState<SensorAvailability>(detectSensors)

  const toggleCat = useCallback((c: ChallengeCategory) => setCats(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]), [])

  const useGps = async () => {
    setGpsStatus('locating')
    const pos = await getCurrentPosition()
    if (pos) { setLocation(`${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`); setGpsStatus('located') } else setGpsStatus('denied')
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      let center: { lat: number; lng: number } | null = null
      let name = location || 'Your Location'
      if (location.trim()) {
        const r = await geocodeLocation(location)
        if (r) { center = r.point; name = r.label }
      }
      if (!center) {
        const pos = await getCurrentPosition()
        if (pos) { center = { lat: pos.lat, lng: pos.lng }; name = 'Your GPS Location'; setGpsStatus('located') }
      }
      onGenerate({ location: location || undefined, maxDistanceKm: maxKm ? parseFloat(maxKm) : undefined, minDistanceKm: minKm ? parseFloat(minKm) : undefined, approxDistanceKm: approxKm ? parseFloat(approxKm) : undefined, difficulty, durationMin: duration, categories: cats }, center, name)
    } finally { setGenerating(false) }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Location</label>
        <div className="flex gap-2 mt-2">
          <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Brisbane, Noosa, Central Park..."
            className="flex-1 bg-surface-100 border border-white/[0.06] rounded-xl px-3.5 py-3 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition" />
          <button onClick={useGps} className="px-3.5 py-3 bg-surface-200 border border-white/[0.06] rounded-xl text-sm text-brand-400 hover:bg-surface-300 btn-press whitespace-nowrap flex items-center gap-1.5">
            <MapPin size={16} /> GPS
          </button>
        </div>
        <p className="text-xs text-ink-500 mt-2">{gpsStatus === 'locating' ? 'Getting your location...' : gpsStatus === 'located' ? 'GPS location found!' : gpsStatus === 'denied' ? 'GPS denied — enter a location above' : 'Leave blank to use your GPS location.'}</p>
      </div>
      <div>
        <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Difficulty</label>
        <div className="flex gap-2 mt-2">
          {DIFFS.map(d => (
            <button key={d.id} onClick={() => setDifficulty(d.id)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold btn-press ${difficulty === d.id ? `bg-gradient-to-r ${d.active} text-white shadow-lg` : 'bg-surface-100 border border-white/[0.06] text-ink-400 hover:text-ink-200'}`}>{d.label}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Adventure Length</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {DURATIONS.map(d => (
            <button key={d} onClick={() => setDuration(d)} className={`px-3.5 py-2.5 rounded-xl text-sm font-medium btn-press ${duration === d ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-glow-brand' : 'bg-surface-100 border border-white/[0.06] text-ink-400 hover:text-ink-200'}`}>{DUR_LABELS[d]}</button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Distance (optional)</label>
        <div className="flex gap-2 mt-2">
          <input type="number" value={maxKm} onChange={e => setMaxKm(e.target.value)} placeholder="Max km" className="w-1/3 bg-surface-100 border border-white/[0.06] rounded-xl px-3 py-3 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition" />
          <input type="number" value={minKm} onChange={e => setMinKm(e.target.value)} placeholder="Min km" className="w-1/3 bg-surface-100 border border-white/[0.06] rounded-xl px-3 py-3 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition" />
          <input type="number" value={approxKm} onChange={e => setApproxKm(e.target.value)} placeholder="~ km" className="w-1/3 bg-surface-100 border border-white/[0.06] rounded-xl px-3 py-3 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition" />
        </div>
      </div>
      <div>
        <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Challenge Types (optional)</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {ALL_CATEGORIES.map(c => {
            const Icon = categoryIcons[c.id]
            return <button key={c.id} onClick={() => toggleCat(c.id)} className={`px-3 py-2 rounded-lg text-xs font-medium btn-press flex items-center gap-1.5 ${cats.includes(c.id) ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white' : 'bg-surface-100 border border-white/[0.06] text-ink-400 hover:text-ink-200'}`}><Icon size={14} /> {c.label}</button>
          })}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {sensorAvail.compass && <span className="text-xs text-ink-400 bg-surface-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-white/[0.04]"><Compass size={12} className="text-brand-400" /> Compass</span>}
        {sensorAvail.accelerometer && <span className="text-xs text-ink-400 bg-surface-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-white/[0.04]"><Smartphone size={12} className="text-brand-400" /> Accelerometer</span>}
        {sensorAvail.camera && <span className="text-xs text-ink-400 bg-surface-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-white/[0.04]"><Camera size={12} className="text-brand-400" /> Camera</span>}
        {sensorAvail.gps && <span className="text-xs text-ink-400 bg-surface-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 border border-white/[0.04]"><Navigation size={12} className="text-brand-400" /> GPS</span>}
      </div>
      <button onClick={handleGenerate} disabled={generating} className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white rounded-xl font-bold text-sm btn-press disabled:opacity-50 shadow-glow-brand flex items-center justify-center gap-2">
        {generating ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</> : <><Sparkles size={18} /> Generate Adventure</>}
      </button>
    </div>
  )
}
