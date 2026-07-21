import { useState } from 'react'
import { Swords, ChevronDown, ChevronUp, Star, Coins } from 'lucide-react'
import ScreenShell from '@/components/ScreenShell'
import type { ChallengeCategory, Difficulty } from '@/types/adventure'
import { ALL_CATEGORIES, CHALLENGE_LIBRARY } from '@/data/challenges'
import { categoryIcons, difficultyIcons } from '@/data/icons'

interface Props {
  onBack: () => void
}

export default function ChallengesScreen({ onBack }: Props) {
  const [expanded, setExpanded] = useState<ChallengeCategory | null>('observation')

  return (
    <ScreenShell title="Challenges" icon={<Swords size={18} />} onBack={onBack}>
      <p className="text-sm text-ink-400 mb-4">{CHALLENGE_LIBRARY.length} challenges across {ALL_CATEGORIES.length} categories</p>
      <div className="space-y-2">
        {ALL_CATEGORIES.map(cat => {
          const Icon = categoryIcons[cat.id]
          const challenges = CHALLENGE_LIBRARY.filter(c => c.category === cat.id)
          const isOpen = expanded === cat.id
          return (
            <div key={cat.id} className="bg-ink-900 border border-ink-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : cat.id)}
                className="w-full flex items-center gap-3 p-3.5 hover:bg-ink-800/50 transition active:scale-[0.98]"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
                  <Icon size={18} className="text-brand-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold text-ink-100">{cat.label}</p>
                  <p className="text-xs text-ink-500">{challenges.length} challenges</p>
                </div>
                {isOpen ? <ChevronUp size={18} className="text-ink-500" /> : <ChevronDown size={18} className="text-ink-500" />}
              </button>
              {isOpen && (
                <div className="px-3.5 pb-3.5 space-y-2 animate-fade-in">
                  {challenges.map(c => {
                    const DiffIcon = difficultyIcons[c.difficulty as Difficulty]
                    return (
                      <div key={c.id} className="flex items-start gap-2.5 bg-ink-950 border border-ink-800 rounded-lg p-3">
                        <DiffIcon size={14} className="text-accent-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink-100">{c.title}</p>
                          <p className="text-xs text-ink-500 mt-0.5">{c.description}</p>
                          <p className="text-xs text-ink-600 mt-1 flex items-center gap-2">
                            <span className="uppercase">{c.difficulty}</span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5"><Star size={10} className="text-brand-400" /> {c.xp} XP</span>
                            <span>·</span>
                            <span className="flex items-center gap-0.5"><Coins size={10} className="text-accent-400" /> {c.coins}</span>
                          </p>
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
