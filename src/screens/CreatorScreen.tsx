import { useState } from 'react'
import { PenTool, Plus, Save, X } from 'lucide-react'
import ScreenShell from '@/components/ScreenShell'
import type { Difficulty, ChallengeCategory, ScreenName } from '@/types/adventure'
import { ALL_CATEGORIES } from '@/data/challenges'
import { categoryIcons, difficultyIcons } from '@/data/icons'

interface Props {
  onBack: () => void
  onToast: (type: 'success' | 'error' | 'info' | 'reward', title: string, message?: string) => void
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'extreme']

export default function CreatorScreen({ onBack, onToast }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [duration, setDuration] = useState(45)
  const [cats, setCats] = useState<ChallengeCategory[]>([])
  const [checkpoints, setCheckpoints] = useState(3)

  const toggleCat = (c: ChallengeCategory) => {
    setCats(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])
  }

  const handleSave = () => {
    if (!title.trim()) { onToast('error', 'Title required'); return }
    onToast('success', 'Adventure saved!', 'Your custom adventure has been created')
    setTitle(''); setDescription(''); setCats([])
  }

  return (
    <ScreenShell title="Creator Studio" icon={<PenTool size={18} className="text-brand-400" />} onBack={onBack}>
      <div className="space-y-5">
        <div className="bg-brand-500/10 border border-brand-500/30 rounded-xl p-3">
          <p className="text-xs text-ink-300">Design your own custom adventure with hand-picked challenges and checkpoints.</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Adventure Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="My Custom Adventure"
            className="w-full mt-1.5 bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition" />
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your adventure..." rows={3}
            className="w-full mt-1.5 bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none transition resize-none" />
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Difficulty</label>
          <div className="flex gap-2 mt-1.5">
            {DIFFICULTIES.map(d => {
              const Icon = difficultyIcons[d]
              return (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition active:scale-95 flex items-center justify-center gap-1.5 ${difficulty === d ? 'bg-brand-500 text-white' : 'bg-ink-900 border border-ink-700 text-ink-400'}`}>
                  <Icon size={14} /> {d}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Duration: {duration} min</label>
          <input type="range" min={20} max={240} step={5} value={duration} onChange={e => setDuration(Number(e.target.value))}
            className="w-full mt-2 accent-brand-500" />
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Checkpoints: {checkpoints}</label>
          <input type="range" min={3} max={12} step={1} value={checkpoints} onChange={e => setCheckpoints(Number(e.target.value))}
            className="w-full mt-2 accent-brand-500" />
        </div>

        <div>
          <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Challenge Categories</label>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {ALL_CATEGORIES.map(c => {
              const Icon = categoryIcons[c.id]
              return (
                <button key={c.id} onClick={() => toggleCat(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition active:scale-95 flex items-center gap-1.5 ${cats.includes(c.id) ? 'bg-brand-500 text-white' : 'bg-ink-900 border border-ink-700 text-ink-400'}`}>
                  <Icon size={14} /> {c.label}
                </button>
              )
            })}
          </div>
        </div>

        <button onClick={handleSave}
          className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition active:scale-95 flex items-center justify-center gap-2">
          <Save size={18} /> Save Custom Adventure
        </button>
      </div>
    </ScreenShell>
  )
}
