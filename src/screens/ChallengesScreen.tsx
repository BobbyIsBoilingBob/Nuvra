import { useState } from 'react'
import { ChevronDown, ChevronUp, Star, Coins } from 'lucide-react'
import { ALL_CATEGORIES, CHALLENGE_LIBRARY } from '@/data/challenges'
import { categoryIcons, difficultyIcons } from '@/data/icons'
import type { ChallengeCategory, Difficulty } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'

const diffColors: Record<Difficulty, string> = {
  easy: 'text-success-400 bg-success-500/10', medium: 'text-amber-400 bg-amber-500/10', hard: 'text-error-400 bg-error-500/10', extreme: 'text-purple-400 bg-purple-500/10',
}

export default function ChallengesScreen() {
  const [expanded, setExpanded] = useState<ChallengeCategory | null>(null)

  return (
    <ScreenShell title="Challenges" subtitle={`${CHALLENGE_LIBRARY.length} unique challenges`}>
      <div className="space-y-3">
        {ALL_CATEGORIES.map((cat, i) => {
          const Icon = categoryIcons[cat.id]
          const challenges = CHALLENGE_LIBRARY.filter(c => c.category === cat.id)
          const isOpen = expanded === cat.id
          return (
            <div key={cat.id} className="bg-surface-100 border border-white/[0.04] rounded-2xl overflow-hidden stagger" style={{ animationDelay: `${i * 30}ms` }}>
              <button onClick={() => setExpanded(isOpen ? null : cat.id)} className="w-full p-4 flex items-center gap-3 btn-press">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center"><Icon size={20} className="text-white" /></div>
                <div className="flex-1 text-left"><p className="text-sm font-bold text-ink-100">{cat.label}</p><p className="text-xs text-ink-500">{challenges.length} challenges</p></div>
                {isOpen ? <ChevronUp size={18} className="text-ink-400" /> : <ChevronDown size={18} className="text-ink-400" />}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-2 animate-fade-in">
                  {challenges.map((ch, j) => {
                    const DiffIcon = difficultyIcons[ch.difficulty]
                    return (
                      <div key={j} className="bg-surface-200 rounded-xl p-3 border border-white/[0.03]">
                        <div className="flex items-start justify-between mb-1.5">
                          <p className="text-sm font-semibold text-ink-100 flex-1 pr-2">{ch.title}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${diffColors[ch.difficulty]}`}><DiffIcon size={10} /> {ch.difficulty}</span>
                        </div>
                        <p className="text-xs text-ink-400 leading-relaxed mb-2">{ch.description}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="flex items-center gap-1 text-brand-400"><Star size={11} /> {ch.xp} XP</span>
                          <span className="flex items-center gap-1 text-accent-400"><Coins size={11} /> {ch.coins}</span>
                          {ch.sensorType !== 'none' && <span className="text-ink-500 capitalize">{ch.sensorType}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </ScreenShell>
  )
}
