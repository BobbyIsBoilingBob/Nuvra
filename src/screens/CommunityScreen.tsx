import { useEffect, useState } from 'react'
import { Users, Heart, MessageCircle } from 'lucide-react'
import { getActivityFeed } from '@/lib/db'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'

export default function CommunityScreen() {
  const [feed, setFeed] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const f = await getActivityFeed()
      setFeed(f || []); setLoading(false)
    })()
  }, [])

  return (
    <ScreenShell title="Community" subtitle="Adventurer activity">
      {loading ? <div className="flex justify-center py-20"><LoadingSpinner /></div> : feed.length === 0 ? (
        <EmptyState icon={<Users size={32} />} title="No activity yet" message="Add friends to see their adventures here" />
      ) : (
        <div className="space-y-3">
          {feed.map((item, i) => (
            <div key={item.id} className="card-premium p-4 stagger" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{(item.user_id || 'A').charAt(0).toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink-200"><span className="font-bold text-ink-100">Adventurer</span> <span className="text-ink-400">{item.description || item.activity_type}</span></p>
                  <div className="flex items-center gap-4 mt-2.5 text-xs text-ink-500">
                    <button className="flex items-center gap-1 hover:text-accent-400 transition"><Heart size={13} /> Like</button>
                    <button className="flex items-center gap-1 hover:text-brand-400 transition"><MessageCircle size={13} /> Comment</button>
                    <span className="ml-auto">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </ScreenShell>
  )
}
