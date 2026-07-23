import { useState, useCallback, memo } from 'react'
import { MapPin, Navigation, Sparkles, Clock, Mountain, Zap } from 'lucide-react'
import type { AdventurePreferences, Difficulty, ChallengeCategory, GpsStatus } from '@/types/adventure'
import { getCurrentPosition } from '@/lib/sensors'
import { challengeCategories } from '@/data/challenges'
import { difficultyIcons } from '@/data/navigation'

interface Props { onGenerate: (prefs: AdventurePreferences, center: { lat: number; lng: number } | null, locationName: string) => void; gpsStatus: GpsStatus; setGpsStatus: (s: GpsStatus) => void }

const difficulties: { id: Difficulty; label: string }[] = [{ id: 'easy', label: 'Easy' }, { id: 'medium', label: 'Medium' }, { id: 'hard', label: 'Hard' }, { id: 'extreme', label: 'Extreme' }]
const durations = [15, 30, 45, 60, 90]
const checkpointCounts = [3, 4, 5, 6]

function GeneratorFormInner({ onGenerate, gpsStatus, setGpsStatus }: Props) {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [duration, setDuration] = useState(30)
  const [cpCount, setCpCount] = useState(4)
  const [categories, setCategories] = useState<ChallengeCategory[]>([])
  const [locationName, setLocationName] = useState('')
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null)

  const handleGetLocation = useCallback(async () => {
    setGpsStatus('locating')
    const pos = await getCurrentPosition()
    if (pos) { setCenter({ lat: pos.lat, lng: pos.lng }); setGpsStatus('located'); setLocationName('Current Location') }
    else setGpsStatus('error')
  }, [setGpsStatus])

  const toggleCategory = useCallback((cat: ChallengeCategory) => setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]), [])
  const handleSubmit = useCallback(() => onGenerate({ difficulty, durationMin: duration, checkpointCount: cpCount, categories }, center, locationName || 'Custom Adventure'), [onGenerate, difficulty, duration, cpCount, categories, center, locationName])

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <p className="section-label flex items-center gap-1.5"><Navigation size={12} /> Location</p>
        <button onClick={handleGetLocation} className={'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition btn-press ' + (gpsStatus === 'located' ? 'bg-brand-50 border-brand-500 text-brand-700' : gpsStatus === 'error' ? 'bg-error-50 border-error-400 text-error-700' : 'bg-white border-surface-300 text-ink-700 hover:border-brand-400')}>
          <MapPin size={18} className="flex-shrink-0" />
          <div className="flex-1 text-left"><p className="text-sm font-semibold">{gpsStatus === 'located' ? 'Location Found' : gpsStatus === 'locating' ? 'Finding GPS...' : gpsStatus === 'error' ? 'GPS Unavailable' : 'Use My Location'}</p>{center && <p className="text-xs text-ink-400">{center.lat.toFixed(4)}, {center.lng.toFixed(4)}</p>}</div>
        </button>
      </div>
      <div>
        <p className="section-label flex items-center gap-1.5"><Zap size={12} /> Difficulty</p>
        <div className="grid grid-cols-2 gap-2">
          {difficulties.map(d => { const Icon = difficultyIcons[d.id]; return (
            <button key={d.id} onClick={() => setDifficulty(d.id)} className={'flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition btn-press ' + (difficulty === d.id ? 'bg-brand-500 border-brand-500 text-white' : 'bg-white border-surface-300 text-ink-600 hover:border-brand-400')}><Icon size={16} /> {d.label}</button>
          )})}
        </div>
      </div>
      <div><p className="section-label flex items-center gap-1.5"><Clock size={12} /> Duration</p><div className="flex gap-2 flex-wrap">{durations.map(d => <button key={d} onClick={() => setDuration(d)} className={'chip ' + (duration === d ? 'chip-active' : 'chip-inactive')}>{d} min</button>)}</div></div>
      <div><p className="section-label flex items-center gap-1.5"><Mountain size={12} /> Checkpoints</p><div className="flex gap-2 flex-wrap">{checkpointCounts.map(c => <button key={c} onClick={() => setCpCount(c)} className={'chip ' + (cpCount === c ? 'chip-active' : 'chip-inactive')}>{c} stops</button>)}</div></div>
      <div><p className="section-label flex items-center gap-1.5"><Sparkles size={12} /> Challenge Types</p><div className="flex gap-2 flex-wrap">{challengeCategories.map(c => <button key={c.id} onClick={() => toggleCategory(c.id)} className={'chip ' + (categories.includes(c.id) ? 'chip-active' : 'chip-inactive')}>{c.label}</button>)}</div></div>
      <button onClick={handleSubmit} className="btn-primary flex items-center justify-center gap-2"><Sparkles size={18} /> Generate Adventure</button>
    </div>
  )
}

export const GeneratorForm = memo(GeneratorFormInner)
