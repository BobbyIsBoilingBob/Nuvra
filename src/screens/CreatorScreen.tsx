import { useState } from 'react'
import ScreenShell from '@/components/ScreenShell'
import { useAuth } from '@/lib/auth'
import { saveAdventure } from '@/lib/db'
import type { Difficulty } from '@/types/adventure'

interface Props { onBack: () => void }

export default function CreatorScreen({ onBack }: Props) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [duration, setDuration] = useState(45)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    if (!user || !title.trim()) return
    setSaving(true)
    await saveAdventure({
      id: `custom-${Date.now()}`,
      title: title.trim(),
      description: desc.trim(),
      difficulty,
      durationMin: duration,
      distanceKm: 0,
      locationName: 'Custom',
      locationSource: 'manual',
      center: { lat: 0, lng: 0 },
      checkpoints: [],
      path: [],
      preferences: { difficulty, durationMin: duration, categories: [] },
      createdAt: new Date().toISOString(),
    })
    setSaving(false)
    setSaved(true)
    setTitle('')
    setDesc('')
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <ScreenShell title="Creator Studio" icon="✏️" onBack={onBack}>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Adventure Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="My Custom Adventure" className="w-full mt-1.5 bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition" />
        </div>
        <div>
          <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Description</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe your adventure..." rows={3} className="w-full mt-1.5 bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none resize-none transition" />
        </div>
        <div>
          <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Difficulty</label>
          <div className="flex gap-2 mt-1.5">
            {(['easy', 'medium', 'hard', 'extreme'] as Difficulty[]).map(d => (
              <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition active:scale-95 ${difficulty === d ? 'bg-brand-500 text-white' : 'bg-ink-900 border border-ink-700 text-ink-400'}`}>{d}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Duration (minutes)</label>
          <input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} min={10} max={240} className="w-full mt-1.5 bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 text-sm text-ink-100 focus:border-brand-500 focus:outline-none transition" />
        </div>
        <button onClick={handleSave} disabled={saving || !title.trim()} className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition active:scale-95 disabled:opacity-50">
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Custom Adventure'}
        </button>
      </div>
    </ScreenShell>
  )
}
