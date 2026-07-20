import ScreenShell from '@/components/ScreenShell'
import { CHALLENGE_LIBRARY, ALL_CATEGORIES } from '@/data/challenges'

export default function ChallengesScreen({ onBack }: { onBack: () => void }) {
  return (
    <ScreenShell title="Challenges" icon="⚔️" onBack={onBack}>
      <p className="text-sm text-ink-400 mb-4">Browse all {CHALLENGE_LIBRARY.length} challenges across {ALL_CATEGORIES.length} categories.</p>
      <div className="space-y-4">
        {ALL_CATEGORIES.map(cat => {
          const challenges = CHALLENGE_LIBRARY.filter(c => c.category === cat.id)
          return (
            <div key={cat.id} className="bg-ink-900 rounded-xl p-4 border border-ink-800">
              <h3 className="text-sm font-semibold text-ink-200 mb-2">{cat.icon} {cat.label} <span className="text-ink-500">({challenges.length})</span></h3>
              <div className="space-y-1.5">
                {challenges.map(c => (
                  <div key={c.id} className="flex items-center justify-between text-xs">
                    <span className="text-ink-300">{c.title}</span>
                    <span className={`px-1.5 py-0.5 rounded ${c.difficulty === 'easy' ? 'text-success-400' : c.difficulty === 'medium' ? 'text-accent-400' : c.difficulty === 'hard' ? 'text-error-400' : 'text-purple-400'}`}>{c.difficulty}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </ScreenShell>
  )
}
