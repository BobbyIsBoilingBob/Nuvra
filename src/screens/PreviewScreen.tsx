import { useState, useCallback, memo } from 'react'
import { MapPin, Clock, Mountain, Zap, Play, Save, ArrowLeft } from 'lucide-react'
import { ScreenShell } from '@/components/ScreenShell'
import { useToasts, ToastContainer } from '@/components/Toast'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { AdventureMap } from '@/components/AdventureMap'
import { formatDistance, formatDuration, difficultyColors } from '@/lib/geo'
import { saveAdventure } from '@/lib/db'
import { difficultyIcons, categoryIcons } from '@/data/navigation'
import type { ScreenName, Adventure, Difficulty } from '@/types/adventure'

interface Props { adventure: Adventure; onNavigate: (s: ScreenName) => void; onStart: (adv: Adventure) => void; onBack: () => void }

function PreviewScreenInner({ adventure, onNavigate, onStart, onBack }: Props) {
  const { toasts, push, dismiss } = useToasts()
  const [saving, setSaving] = useState(false)

  const handleSave = useCallback(async () => {
    setSaving(true)
    const { error } = await saveAdventure(adventure)
    setSaving(false)
    if (error) { push('error', 'Save failed', error); return }
    push('success', 'Adventure saved!', 'Find it in your profile')
  }, [adventure, push])

  const handleStart = useCallback(() => {
    push('success', 'Adventure starting!', 'Good luck, explorer')
    onStart(adventure)
  }, [adventure, onStart, push])

  const diffColor = difficultyColors[adventure.difficulty]
  const DiffIcon = difficultyIcons[adventure.difficulty]

  return (
    <>
      <ScreenShell title="Adventure Preview" subtitle={adventure.locationName} icon={<MapPin size={18} />} onBack={onBack ?? (() => onNavigate('generator'))}>
        <div className="space-y-5">
          {/* Map */}
          <div className="rounded-2xl overflow-hidden border border-surface-200 shadow-card animate-fade-in">
            <AdventureMap adventure={adventure} />
          </div>

          {/* Info card */}
          <div className="card-premium p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <span className={'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ' + diffColor}>
                <DiffIcon size={12} /> {adventure.difficulty.charAt(0).toUpperCase() + adventure.difficulty.slice(1)}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-surface-100 text-ink-600 border border-surface-200">
                <Mountain size={12} /> {adventure.checkpoints.length} checkpoints
              </span>
            </div>
            <p className="text-sm text-ink-700">{adventure.description}</p>
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-surface-200">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-700"><Clock size={14} className="text-brand-500" /> {formatDuration(adventure.durationMin)}</span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-700"><MapPin size={14} className="text-brand-500" /> {formatDistance(adventure.distanceKm)}</span>
            </div>
          </div>

          {/* Checkpoints list */}
          <div>
            <p className="section-label">Checkpoints</p>
            <div className="space-y-2">
              {adventure.checkpoints.map((cp, i) => {
                const catIcon = cp.challenge ? categoryIcons[cp.challenge.category] : null
                const CatIcon = catIcon ?? Zap
                return (
                  <div key={i} className="card-premium p-3 flex items-center gap-3 animate-fade-in" style={{ animationDelay: String(i * 40) + 'ms' }}>
                    <div className="w-9 h-9 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-ink-900 truncate">{cp.title ?? 'Checkpoint ' + (i + 1)}</p>
                      {cp.challenge && <p className="text-xs text-ink-400 truncate">{cp.challenge.description}</p>}
                    </div>
                    {cp.challenge && <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center"><CatIcon size={14} className="text-ink-500" /></div>}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving} className="flex-1 btn-secondary flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? <LoadingSpinner size="sm" /> : <Save size={16} />}
              Save
            </button>
            <button onClick={handleStart} className="flex-1 btn-primary flex items-center justify-center gap-2">
              <Play size={18} /> Start Adventure
            </button>
          </div>
        </div>
      </ScreenShell>
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export const PreviewScreen = memo(PreviewScreenInner)
