import { useState } from 'react'
import { PenTool, MapPin, Sparkles, Save, Play } from 'lucide-react'
import { generateAdventure, generateSuggestedAdventures } from '@/lib/generator'
import { saveAdventure } from '@/lib/db'
import { detectSensors } from '@/lib/sensors'
import { getCurrentPosition } from '@/lib/gps'
import type { Adventure, Difficulty, ChallengeCategory, SensorAvailability, GeoPoint } from '@/types/adventure'
import { ALL_CATEGORIES } from '@/data/challenges'
import { categoryIcons } from '@/data/icons'
import ScreenShell from '@/components/ScreenShell'
import AdventureMap from '@/components/AdventureMap'
import { useToasts, ToastContainer } from '@/components/Toast'

const DIFFS: { id: Difficulty; label: string; color: string }[] = [
  { id: 'easy', label: 'Easy', color: 'from-brand-500 to-brand-600' },
  { id: 'medium', label: 'Medium', color: 'from-sky-500 to-sky-600' },
  { id: 'hard', label: 'Hard', color: 'from-accent-500 to-accent-600' },
  { id: 'extreme', label: 'Extreme', color: 'from-rose-500 to-rose-600' },
]

export default function CreatorScreen() {
  const [name, setName] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [duration, setDuration] = useState(45)
  const [distance, setDistance] = useState(3)
  const [cats, setCats] = useState<ChallengeCategory[]>([])
  const [center, setCenter] = useState<GeoPoint>({ lat: 0, lng: 0 })
  const [adventure, setAdventure] = useState<Adventure | null>(null)
  const [generating, setGenerating] = useState(false)
  const { toasts, push, dismiss } = useToasts()

  const useGps = async () => {
    try { const p = await getCurrentPosition(); if (p) { setCenter({ lat: p.lat, lng: p.lng }); push('success', 'Location found!') } }
    catch { push('error', 'GPS Error', 'Could not get location') }
  }

  const generate = async () => {
    if (!name.trim()) { push('error', 'Name required'); return }
    if (center.lat === 0 && center.lng === 0) { push('error', 'Location required', 'Use GPS or set a location'); return }
    setGenerating(true)
    const sa: SensorAvailability = await detectSensors()
    const adv = generateAdventure({ center, locationName: name.trim(), locationSource: 'manual', preferences: { difficulty, durationMin: duration, approxDistanceKm: distance, categories: cats }, sensorAvail: sa })
    setAdventure(adv); setGenerating(false); push('success', 'Adventure created!')
  }

  const save = async () => {
    if (!adventure) return
    const { error } = await saveAdventure(adventure)
    if (error) { push('error', 'Save failed', error); return }
    push('success', 'Adventure saved!')
  }

  const toggleCat = (c: ChallengeCategory) => setCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  return (
    <>
      <ScreenShell title="Creator" subtitle="Design your adventure">
        <div className="space-y-4">
          <div className="card-premium p-4">
            <label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">Adventure Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. My Local Trail" className="w-full bg-surface-100 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none" />
          </div>

          <div className="card-premium p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Location</label>
              <button onClick={useGps} className="flex items-center gap-1.5 text-xs font-bold text-brand-400 btn-press"><MapPin size={14} /> Use GPS</button>
            </div>
            {center.lat !== 0 || center.lng !== 0 ? <p className="text-xs text-ink-500">{center.lat.toFixed(4)}, {center.lng.toFixed(4)}</p> : <p className="text-xs text-ink-600">No location set</p>}
          </div>

          <div className="card-premium p-4">
            <label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">Difficulty</label>
            <div className="grid grid-cols-4 gap-2">
              {DIFFS.map(d => (
                <button key={d.id} onClick={() => setDifficulty(d.id)} className={`py-2.5 rounded-xl text-xs font-bold transition-all btn-press ${difficulty === d.id ? `bg-gradient-to-r ${d.color} text-white` : 'bg-surface-200 text-ink-500'}`}>{d.label}</button>
              ))}
            </div>
          </div>

          <div className="card-premium p-4 space-y-3">
            <div><div className="flex justify-between mb-1.5"><label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Duration</label><span className="text-xs text-brand-400 font-bold">{duration} min</span></div><input type="range" min="15" max="120" step="5" value={duration} onChange={e => setDuration(+e.target.value)} className="w-full accent-brand-500" /></div>
            <div><div className="flex justify-between mb-1.5"><label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Distance</label><span className="text-xs text-brand-400 font-bold">{distance} km</span></div><input type="range" min="1" max="20" step="0.5" value={distance} onChange={e => setDistance(+e.target.value)} className="w-full accent-brand-500" /></div>
          </div>

          <div className="card-premium p-4">
            <label className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 block">Categories (optional)</label>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map(c => {
                const Icon = categoryIcons[c.id]
                const sel = cats.includes(c.id)
                return <button key={c.id} onClick={() => toggleCat(c.id)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all btn-press ${sel ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-surface-200 text-ink-500 border border-transparent'}`}><Icon size={12} /> {c.label}</button>
              })}
            </div>
          </div>

          <button onClick={generate} disabled={generating} className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl text-sm font-bold btn-press disabled:opacity-50 flex items-center justify-center gap-2"><Sparkles size={16} /> {generating ? 'Generating...' : 'Generate Adventure'}</button>

          {adventure && (
            <>
              <div className="card-premium p-4">
                <div className="flex items-center gap-2 mb-3"><PenTool size={16} className="text-brand-400" /><p className="text-sm font-bold text-ink-100">{adventure.title}</p></div>
                <div className="h-48 rounded-xl overflow-hidden mb-3"><AdventureMap adventure={adventure} /></div>
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div><p className="text-xs text-ink-500">Distance</p><p className="text-sm font-bold text-ink-100">{adventure.distanceKm}km</p></div>
                  <div><p className="text-xs text-ink-500">Duration</p><p className="text-sm font-bold text-ink-100">{adventure.durationMin}min</p></div>
                  <div><p className="text-xs text-ink-500">Checkpoints</p><p className="text-sm font-bold text-ink-100">{adventure.checkpoints.length}</p></div>
                </div>
                <button onClick={save} className="w-full py-2.5 bg-surface-200 rounded-xl text-xs font-bold text-ink-300 btn-press flex items-center justify-center gap-1.5"><Save size={14} /> Save Adventure</button>
              </div>
            </>
          )}
        </div>
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
