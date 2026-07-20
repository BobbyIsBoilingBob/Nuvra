import ScreenShell from '@/components/ScreenShell'

export default function QuestsScreen({ onBack }: { onBack: () => void }) {
  const quests = [
    { title: 'Daily Explorer', desc: 'Complete 1 adventure today', reward: '50 XP', progress: 0, total: 1 },
    { title: 'Weekend Warrior', desc: 'Complete 3 adventures this weekend', reward: '200 XP + 100 coins', progress: 1, total: 3 },
    { title: 'Photography Master', desc: 'Complete 10 photography challenges', reward: '500 XP', progress: 3, total: 10 },
    { title: 'Compass Navigator', desc: 'Finish 5 compass-based challenges', reward: '300 XP', progress: 0, total: 5 },
  ]
  return (
    <ScreenShell title="Quests" icon="📜" onBack={onBack}>
      <div className="space-y-3">
        {quests.map((q, i) => (
          <div key={i} className="bg-ink-900 rounded-xl p-4 border border-ink-800">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-semibold text-ink-200">{q.title}</h3>
              <span className="text-xs text-brand-400">{q.reward}</span>
            </div>
            <p className="text-xs text-ink-400 mb-3">{q.desc}</p>
            <div className="flex justify-between text-xs text-ink-500 mb-1">
              <span>Progress</span>
              <span>{q.progress}/{q.total}</span>
            </div>
            <div className="h-2 bg-ink-800 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${(q.progress / q.total) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </ScreenShell>
  )
}
