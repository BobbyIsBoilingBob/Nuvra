import { useEffect, useState } from 'react'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { getActivityFeed } from '@/lib/db'

interface Props { onBack: () => void }

export default function CommunityScreen({ onBack }: Props) {
  const [activities, setActivities] = useState<{ id: string; activity_type: string; description: string | null; metadata: Record<string, unknown>; created_at: string; user_id: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getActivityFeed(30).then(data => {
      setActivities(data)
      setLoading(false)
    })
  }, [])

  return (
    <ScreenShell title="Community" icon="🌐" onBack={onBack}>
      <p className="text-sm text-ink-400 mb-4">See what the community is up to.</p>
      {loading ? <LoadingSpinner label="Loading activity..." /> :
       activities.length === 0 ? <EmptyState icon="🌐" title="No Activity Yet" message="Community activity will appear here once you and others start adventuring." /> :
       <div className="space-y-3">
         {activities.map(a => (
           <div key={a.id} className="bg-ink-900 rounded-xl p-4 border border-ink-800">
             <div className="flex items-center gap-2 mb-2">
               <div className="w-8 h-8 rounded-full bg-ink-700 flex items-center justify-center text-sm">👤</div>
               <span className="text-sm font-semibold text-ink-200">{a.activity_type}</span>
               <span className="text-xs text-ink-500 ml-auto">{new Date(a.created_at).toLocaleDateString()}</span>
             </div>
             <p className="text-sm text-ink-300">{a.description || a.activity_type}</p>
           </div>
         ))}
       </div>
      }
    </ScreenShell>
  )
}
