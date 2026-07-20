import { useState } from 'react'
import ScreenShell from '@/components/ScreenShell'

export default function CreatorScreen({ onBack }: { onBack: () => void }) {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  return (
    <ScreenShell title="Creator Studio" icon="✏️" onBack={onBack}>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Adventure Title</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="My Custom Adventure" className="w-full mt-1.5 bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Description</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe your adventure..." rows={3} className="w-full mt-1.5 bg-ink-900 border border-ink-700 rounded-xl px-3 py-2.5 text-sm text-ink-100 placeholder-ink-500 focus:border-brand-500 focus:outline-none resize-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-ink-400 uppercase tracking-wider">Difficulty</label>
          <div className="flex gap-2 mt-1.5">
            {['easy', 'medium', 'hard', 'extreme'].map(d => (
              <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition ${difficulty === d ? 'bg-brand-500 text-white' : 'bg-ink-900 border border-ink-700 text-ink-400'}`}>{d}</button>
            ))}
          </div>
        </div>
        <button className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-semibold text-sm transition">Save Custom Adventure</button>
      </div>
    </ScreenShell>
  )
}
