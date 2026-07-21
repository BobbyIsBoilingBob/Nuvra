import { useState, useEffect, useCallback } from 'react'
import { Plus, Minus, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { generateAdventure } from '@/lib/generator'
import { saveAdventure } from '@/lib/db'
import { detectSensors } from '@/lib/sensors'
import { getCurrentPosition } from '@/lib/gps'
import type { Adventure, AdventurePreferences, Difficulty, ChallengeCategory } from '@/types/adventure'
import { ALL_CATEGORIES } from '@/data/challenges'
import { categoryIcons } from '@/data/icons'
import ScreenShell from '@/components/ScreenShell'
import { useToasts, ToastContainer } from '@/components/Toast'

const DIFFS: { id: Difficulty; label: string; active: string }[] = [
  { id: 'easy', label: 'Easy', active: 'from-emerald-500 to-emerald-600' },
  { id: 'medium', label: 'Medium', active: 'from-amber-500 to-orange-500' },
  { id: 'hard', label: 'Hard', active: 'from-red-500 to-rose-600' },
  { id: 'extreme', label: 'Extreme', active: 'from-purple-500 to-violet-600' },
]

interface Props { onPreview: (a: Adventure) => void }

export default function CreatorScreen({ onPreview }: Props) {
  const [title, setTitle] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [duration, setDuration] = useState(45)
  const [numCheckpoints, setNumCheckpoints] = useState(5)
  const [cats, setCats] = useState<ChallengeCategory[]>([])
  const [generating, setGenerating] = useState(false)
  const { toasts, push, dismiss } = useToasts()

  const toggleCat = useCallback((c: ChallengeCategory) => setCats(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]), [])

  const handleCreate = async () => {
    if (!title.trim()) { push('error', 'Enter a title'); return }
    setGenerating(true)
    try {
      let center = { lat: 0, lng: 0 }
      const pos = await getCurrentPosition()
      if (pos) center = { lat: pos.lat, lng: pos.lng }
      const prefs: AdventurePreferences = { difficulty, durationMin: duration, categories: cats }
      const adv = generateAdventure({ center, locationName: title, locationSource: 'manual', preferences: prefs, sensorAvail: detectSensors() })
      const { error } = await saveAdventure(adv)
      if (error) { push('error', 'Save failed', error); setGenerating(false); return }
      push('success', 'Adventure created!'); setTimeout(() => onPreview(adv), 600)
    } catch { push('error', 'Creation failed'); setGenerating(false) }
    finally { setGenerating(false) }
  }

  return (
    <>
      <ScreenShell title="Creator" subtitle="Design custom adventures">
        <div className="space-y-5">
          <div>
            <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Adventure Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="My Custom Adventure" className="w-full mt-2 bg-surface-100 border border-white/[0.06] rounded-xl px-3.5 py-3 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition" />
          </div>

          <div>
            <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Difficulty</label>
            <div className="flex gap-2 mt-2">
              {DIFFS.map(d => <button key={d.id} onClick={() => setDifficulty(d.id)} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold btn-press ${difficulty === d.id ? `bg-gradient-to-r ${d.active} text-white shadow-lg` : 'bg-surface-100 border border-white/[0.06] text-ink-400'}`}>{d.label}</button>)}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Duration: {duration} min</label>
            <input type="range" min="15" max="240" step="5" value={duration} onChange={e => setDuration(parseInt(e.target.value))} className="custom-range w-full mt-3" />
          </div>

          <div>
            <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Checkpoints: {numCheckpoints}</label>
            <div className="flex items-center gap-3 mt-2">
              <button onClick={() => setNumCheckpoints(n => Math.max(2, n - 1))} className="w-10 h-10 rounded-xl bg-surface-200 flex items-center justify-center btn-press"><Minus size={18} className="text-ink-300" /></button>
              <div className="flex-1 h-2.5 bg-surface-300 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all" style={{ width: `${(numCheckpoints / 15) * 100}%` }} /></div>
              <button onClick={() => setNumCheckpoints(n => Math.min(15, n + 1))} className="w-10 h-10 rounded-xl bg-surface-200 flex items-center justify-center btn-press"><Plus size={18} className="text-ink-300" /></button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-ink-400 uppercase tracking-wider">Challenge Types</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ALL_CATEGORIES.map(c => { const Icon = categoryIcons[c.id]; return <button key={c.id} onClick={() => toggleCat(c.id)} className={`px-3 py-2 rounded-lg text-xs font-medium btn-press flex items-center gap-1.5 ${cats.includes(c.id) ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white' : 'bg-surface-100 border border-white/[0.06] text-ink-400'}`}><Icon size={14} /> {c.label}</button> })}
            </div>
          </div>

          <button onClick={handleCreate} disabled={generating} className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl font-bold text-sm btn-press shadow-glow-brand disabled:opacity-50 flex items-center justify-center gap-2">
            {generating ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</> : <><Sparkles size={18} /> Create Adventure</>}
          </button>
        </div>
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}
