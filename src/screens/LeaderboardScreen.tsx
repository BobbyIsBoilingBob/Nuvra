import ScreenShell from '@/components/ScreenShell'

export default function LeaderboardScreen({ onBack }: { onBack: () => void }) {
  const leaders = [
    { rank: 1, name: 'TrailBlazer', xp: 15420, icon: '🥇' },
    { rank: 2, name: 'CompassKing', xp: 12890, icon: '🥈' },
    { rank: 3, name: 'UrbanExplorer', xp: 11200, icon: '🥉' },
    { rank: 4, name: 'NatureLover', xp: 9800, icon: '4' },
    { rank: 5, name: 'PhotoWalker', xp: 8650, icon: '5' },
    { rank: 6, name: 'You', xp: 2450, icon: '6', isYou: true },
  ]
  return (
    <ScreenShell title="Leaderboard" icon="🏆" onBack={onBack}>
      <div className="space-y-2">
        {leaders.map((l, i) => (
          <div key={i} className={`flex items-center gap-3 rounded-xl p-3 border ${l.isYou ? 'bg-brand-500/10 border-brand-500/30' : 'bg-ink-900 border-ink-800'}`}>
            <span className="text-lg font-bold w-8 text-center">{l.icon}</span>
            <div className="w-9 h-9 rounded-full bg-ink-700 flex items-center justify-center text-sm">👤</div>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${l.isYou ? 'text-brand-400' : 'text-ink-200'}`}>{l.name}</p>
            </div>
            <p className="text-sm text-ink-400">{l.xp.toLocaleString()} XP</p>
          </div>
        ))}
      </div>
    </ScreenShell>
  )
}
