import { useEffect, useState } from 'react'
import { Globe, Activity } from 'lucide-react'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { getActivityFeed } from '@/lib/db'

interface Props {
  onBack: () => void
}

interface ActivityItem {
  id: string
  activity_type: string
  description: string | null
  metadata: Record<string, unknown>
  created_at: string
  user_id: string
}

export default function CommunityScreen({ onBack }: Props) {
  const [feed, setFeed] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getActivityFeed().then(f => { setFeed(f); setLoading(false) })
  }, [])

  return (
    <ScreenShell title="Community" icon={<Globe size={18} className="text-brand-400" />} onBack={onBack}>
      {loading ? <LoadingSpinner label="Loading activity..." /> :
       feed.length === 0 ? (
         <EmptyState icon={<Activity size={40} />} title="No activity yet" message="Community activity will appear here as you and others complete adventures" />
       ) : (
         <div className="space-y-2">
           {feed.map(item => (
             <div key={item.id} className="bg-ink-900 border border-ink-800 rounded-xl p-3">
               <div className="flex items-start gap-3">
                 <div className="w-9 h-9 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
                   <Activity size={16} className="text-brand-400" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm text-ink-200">{item.description || item.activity_type}</p>
                   <p className="text-xs text-ink-500 mt-1">{new Date(item.created_at).toLocaleString()}</p>
                 </div>
               </div>
             </div>
           ))}
         </div>
       )}
    </ScreenShell>
  )
}
