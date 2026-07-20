import ScreenShell from '@/components/ScreenShell'

export default function CommunityScreen({ onBack }: { onBack: () => void }) {
  const posts = [
    { user: 'TrailBlazer', text: 'Just completed an extreme adventure in the mountains! 🏔️', likes: 24 },
    { user: 'UrbanExplorer', text: 'Found a hidden alley with amazing street art today', likes: 18 },
    { user: 'NatureLover', text: 'Spotted 5 different bird species on my morning walk', likes: 12 },
  ]
  return (
    <ScreenShell title="Community" icon="🌐" onBack={onBack}>
      <div className="space-y-3">
        {posts.map((p, i) => (
          <div key={i} className="bg-ink-900 rounded-xl p-4 border border-ink-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-ink-700 flex items-center justify-center text-sm">👤</div>
              <span className="text-sm font-semibold text-ink-200">{p.user}</span>
            </div>
            <p className="text-sm text-ink-300">{p.text}</p>
            <p className="text-xs text-ink-500 mt-2">❤️ {p.likes} likes</p>
          </div>
        ))}
      </div>
    </ScreenShell>
  )
}
