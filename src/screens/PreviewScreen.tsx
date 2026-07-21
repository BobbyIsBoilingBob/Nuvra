import { ArrowLeft, Play, Clock, Route, Mountain, Star, Coins, MapPin } from 'lucide-react'
import type { Adventure } from '@/types/adventure'
import { formatDistance, formatDuration } from '@/lib/geo'
import { categoryIcons, difficultyIcons } from '@/data/icons'
import AdventureMap from '@/components/AdventureMap'

interface Props { adventure: Adventure; onStart: () => void; onBack: () => void }

export default function PreviewScreen({ adventure, onStart, onBack }: Props) {
  const DiffIcon = difficultyIcons[adventure.difficulty]
  const totalXp = adventure.checkpoints.reduce((s, c) => s + (c.challenge?.xp ?? 0), 0)
  const totalCoins = adventure.checkpoints.reduce((s, c) => s + (c.challenge?.coins ?? 0), 0)

  return (
    <div className="min-h-screen">
      <div className="glass sticky top-0 z-20 px-4 py-3 flex items-center gap-3 border-b border-white/[0.06] safe-top">
        <button onClick={onBack} className="w-9 h-9 rounded-xl bg-surface-200 flex items-center justify-center btn-press"><ArrowLeft size={18} className="text-ink-200" /></button>
        <div><h1 className="text-base font-bold text-ink-100">Adventure Preview</h1><p className="text-xs text-ink-500">{adventure.locationName}</p></div>
      </div>
      <div className="px-4 pt-4 pb-28 space-y-4 max-w-md mx-auto">
        <div className="rounded-2xl overflow-hidden border border-white/[0.06] shadow-card animate-slide-up"><AdventureMap adventure={adventure} /></div>

        <div className="grid grid-cols-2 gap-3 animate-slide-up">
          <div className="bg-surface-100 border border-white/[0.04] rounded-xl p-3.5 flex items-center gap-2.5">
            <Clock size={18} className="text-brand-400" /><div><p className="text-xs text-ink-500">Duration</p><p className="text-sm font-bold text-ink-100">{formatDuration(adventure.durationMin)}</p></div>
          </div>
          <div className="bg-surface-100 border border-white/[0.04] rounded-xl p-3.5 flex items-center gap-2.5">
            <Route size={18} className="text-brand-400" /><div><p className="text-xs text-ink-500">Distance</p><p className="text-sm font-bold text-ink-100">{formatDistance(adventure.distanceKm)}</p></div>
          </div>
          <div className="bg-surface-100 border border-white/[0.04] rounded-xl p-3.5 flex items-center gap-2.5">
            <Mountain size={18} className="text-brand-400" /><div><p className="text-xs text-ink-500">Checkpoints</p><p className="text-sm font-bold text-ink-100">{adventure.checkpoints.length}</p></div>
          </div>
          <div className="bg-surface-100 border border-white/[0.04] rounded-xl p-3.5 flex items-center gap-2.5">
            <DiffIcon size={18} className="text-brand-400" /><div><p className="text-xs text-ink-500">Difficulty</p><p className="text-sm font-bold text-ink-100 capitalize">{adventure.difficulty}</p></div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-brand-500/10 to-accent-500/10 border border-brand-500/20 rounded-xl p-3.5 flex items-center justify-around animate-slide-up">
          <div className="text-center"><Star size={18} className="text-brand-400 mx-auto mb-1" /><p className="text-lg font-bold text-ink-100">{totalXp}</p><p className="text-xs text-ink-500">Total XP</p></div>
          <div className="w-px h-10 bg-white/[0.06]" />
          <div className="text-center"><Coins size={18} className="text-accent-400 mx-auto mb-1" /><p className="text-lg font-bold text-ink-100">{totalCoins}</p><p className="text-xs text-ink-500">Coins</p></div>
        </div>

        <div className="animate-slide-up">
          <h3 className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-3">Checkpoints</h3>
          <div className="space-y-2.5">
            {adventure.checkpoints.map((cp, i) => {
              const Icon = cp.challenge ? categoryIcons[cp.challenge.category] : MapPin
              return (
                <div key={i} className="bg-surface-100 border border-white/[0.04] rounded-xl p-3.5 flex items-center gap-3 stagger" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="w-9 h-9 rounded-lg bg-surface-200 flex items-center justify-center text-xs font-bold text-ink-300 flex-shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink-100 truncate">{cp.challenge?.title ?? 'Checkpoint'}</p>
                    <p className="text-xs text-ink-500 mt-0.5 flex items-center gap-1.5"><Icon size={11} /> {cp.challenge?.category ?? 'Waypoint'}</p>
                  </div>
                  {cp.challenge && <div className="text-right"><p className="text-xs font-bold text-brand-400">+{cp.challenge.xp} XP</p></div>}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto px-4 pb-5 pt-3 bg-gradient-to-t from-ink-950 to-transparent">
        <button onClick={onStart} className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white rounded-xl font-bold text-sm btn-press shadow-glow-brand flex items-center justify-center gap-2">
          <Play size={18} /> Start Adventure
        </button>
      </div>
    </div>
  )
}
