import { useState } from 'react'
import { Map, Play, Save, Clock, Route, MapPin, Star, Coins } from 'lucide-react'
import ScreenShell from '@/components/ScreenShell'
import AdventureMap from '@/components/AdventureMap'
import type { Adventure } from '@/types/adventure'
import { formatDistance, formatDuration } from '@/lib/geo'
import { categoryIcons, difficultyIcons } from '@/data/icons'
import { saveAdventure } from '@/lib/db'

interface Props {
  adventure: Adventure
  onBack: () => void
  onStart: () => void
  onToast: (type: 'success' | 'error' | 'info' | 'reward', title: string, message?: string) => void
}

export default function PreviewScreen({ adventure, onBack, onStart, onToast }: Props) {
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const { error } = await saveAdventure(adventure)
    setSaving(false)
    onToast(error ? 'error' : 'success', error ? 'Save failed' : 'Adventure saved!', error ?? undefined)
  }

  return (
    <ScreenShell title="Adventure Preview" icon={<Map size={18} />} onBack={onBack}>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-ink-100">{adventure.title}</h2>
          <p className="text-sm text-ink-400 mt-1">{adventure.description}</p>
        </div>

        <AdventureMap adventure={adventure} />

        <div className="grid grid-cols-3 gap-2">
          <Stat icon={<Clock size={14} />} label="Duration" value={formatDuration(adventure.durationMin)} />
          <Stat icon={<Route size={14} />} label="Distance" value={formatDistance(adventure.distanceKm)} />
          <Stat icon={<MapPin size={14} />} label="Location" value={adventure.locationName} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink-200 mb-2">{adventure.checkpoints.length} Checkpoints</h3>
          <div className="space-y-2">
            {adventure.checkpoints.map((cp, i) => {
              const ch = cp.challenge
              if (!ch) return (
                <div key={i} className="flex items-center gap-3 bg-ink-900 border border-ink-800 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-full bg-ink-800 flex items-center justify-center text-xs text-ink-400 font-bold">{i + 1}</div>
                  <span className="text-sm text-ink-300">{cp.label}</span>
                </div>
              )
              const CatIcon = categoryIcons[ch.category]
              const DiffIcon = difficultyIcons[ch.difficulty]
              return (
                <div key={i} className="flex items-start gap-3 bg-ink-900 border border-ink-800 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs text-brand-400 font-bold flex-shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <CatIcon size={12} className="text-brand-400" />
                      <DiffIcon size={12} className="text-accent-400" />
                      <span className="text-xs text-ink-500 uppercase">{ch.category} · {ch.difficulty}</span>
                    </div>
                    <p className="text-sm font-medium text-ink-100">{ch.title}</p>
                    <p className="text-xs text-ink-500 mt-0.5 flex items-center gap-2">
                      <span className="flex items-center gap-0.5"><Star size={10} className="text-brand-400" /> {ch.xp} XP</span>
                      <span className="flex items-center gap-0.5"><Coins size={10} className="text-accent-400" /> {ch.coins}</span>
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave} disabled={saving}
            className="flex-1 py-3 bg-ink-800 hover:bg-ink-700 text-ink-200 rounded-xl font-semibold text-sm transition active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Save size={16} /> Save</>}
          </button>
          <button
            onClick={onStart}
            className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
          >
            <Play size={16} /> Start Adventure
          </button>
        </div>
      </div>
    </ScreenShell>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-ink-900 border border-ink-800 rounded-xl p-3">
      <div className="flex items-center gap-1.5 text-ink-500 mb-1">{icon}<span className="text-xs uppercase">{label}</span></div>
      <p className="text-sm font-semibold text-ink-100 truncate">{value}</p>
    </div>
  )
}
