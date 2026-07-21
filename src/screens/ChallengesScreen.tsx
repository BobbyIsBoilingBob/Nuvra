import { useState } from 'react'
import { Swords, ChevronDown } from 'lucide-react'
import { CHALLENGE_LIBRARY, ALL_CATEGORIES } from '@/data/challenges'
import { categoryIcons, difficultyIcons } from '@/data/icons'
import type { Difficulty } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'

const diffColors: Record<Difficulty, string> = {
  easy: 'text-brand-400 bg-brand-500/10', medium: 'text-sky-400 bg-sky-500/10', hard: 'text-accent-400 bg-accent-500/10', extreme: 'text-rose-400 bg-rose-500/10',
}

export default function ChallengesScreen() {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <ScreenShell title="Challenges" subtitle={`${CHALLENGE_LIBRARY.length} total challenges`}>
      <div className="space-y-2">
        {ALL_CATEGORIES.map(cat => {
          const challenges = CHALLENGE_LIBRARY.filter(c => c.category === cat.id)
          if (challenges.length === 0) return null
          const Icon = categoryIcons[cat.id]
          const isOpen = expanded === cat.id
          return (
            <div key={cat.id} className="card-premium overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : cat.id)} className="w-full flex items-center gap-3 p-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 flex items-center justify-center"><Icon className="text-brand-400" size={18} /></div>
                <div className="flex-1 text-left"><p className="text-sm font-bold text-ink-100">{cat.label}</p><p className="text-xs text-ink-500">{challenges.length} challenges</p></div>
                <ChevronDown size={18} className={`text-ink-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-2 border-t border-white/[0.04] pt-3">
                  {challenges.map(c => {
                    const DiffIcon = difficultyIcons[c.difficulty]
                    return (
                      <div key={c.id} className="flex items-start gap-3 p-3 bg-surface-100 rounded-xl">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${diffColors[c.difficulty]}`}><DiffIcon size={14} /></div>
                        <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-ink-100">{c.title}</p><p className="text-xs text-ink-500 leading-relaxed">{c.description}</p><div className="flex gap-3 mt-1.5 text-xs text-ink-600"><span className="text-accent-400">+{c.xp} XP</span><span className="text-amber-400">+{c.coins} coins</span></div></div>
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
