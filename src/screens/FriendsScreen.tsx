import ScreenShell from '@/components/ScreenShell'

export default function FriendsScreen({ onBack }: { onBack: () => void }) {
  const friends = [
    { name: 'TrailBlazer', status: 'On adventure', online: true },
    { name: 'UrbanExplorer', status: 'Online', online: true },
    { name: 'NatureLover', status: 'Last seen 2h ago', online: false },
    { name: 'CompassKing', status: 'On adventure', online: true },
    { name: 'PhotoWalker', status: 'Last seen 1d ago', online: false },
  ]
  return (
    <ScreenShell title="Friends" icon="👥" onBack={onBack}>
      <div className="space-y-2">
        {friends.map((f, i) => (
          <div key={i} className="flex items-center gap-3 bg-ink-900 rounded-xl p-3 border border-ink-800">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-ink-700 flex items-center justify-center">👤</div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-ink-900 ${f.online ? 'bg-success-500' : 'bg-ink-600'}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink-200">{f.name}</p>
              <p className="text-xs text-ink-500">{f.status}</p>
            </div>
          </div>
        ))}
      </div>
    </ScreenShell>
  )
}
