import { useEffect, useState } from 'react'
import { Leaf, Trophy, Route, Check } from 'lucide-react'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import { getSeasonalProgress } from '@/lib/db'
import { formatDistance } from '@/lib/geo'

interface Props {
  onBack: () => void
}

export default function SeasonalScreen({ onBack }: Props) {
  const [data, setData] = useState<{ adventures_completed: number; distance_walked: number; target_adventures: number; target_distance: number; reward_claimed: boolean } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSeasonalProgress().then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return <ScreenShell title="Seasonal" icon={<Leaf size={18} className="text-orange-400" />} onBack={onBack}><LoadingSpinner /></ScreenShell>

  const adventures = data?.adventures_completed ?? 0
  const distance = data?.distance_walked ?? 0
  const advTarget = data?.target_adventures ?? 10
  const distTarget = data?.target_distance ?? 50
  const rewardClaimed = data?.reward_claimed ?? false

  return (
    <ScreenShell title="Seasonal" icon={<Leaf size={18} className="text-orange-400" />} onBack={onBack}>
      <div className="space-y-5">
        <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/10 border border-orange-500/30 rounded-2xl p-5 text-center">
          <Leaf size={32} className="mx-auto mb-2 text-orange-400" />
          <h2 className="text-lg font-bold text-ink-100">Summer Season</h2>
          <p className="text-xs text-ink-400 mt-1">Complete seasonal goals for exclusive rewards</p>
        </div>

        <div className="space-y-4">
          <SeasonalCard icon={<Trophy size={18} className="text-yellow-400" />} label="Adventures" value={adventures} target={advTarget} claimed={rewardClaimed} />
          <SeasonalCard icon={<Route size={18} className="text-success-400" />} label="Distance" value={distance} target={distTarget} claimed={rewardClaimed} displayValue={formatDistance(distance)} />
        </div>

        {rewardClaimed && (
          <div className="bg-success-500/10 border border-success-500/30 rounded-xl p-3 flex items-center gap-2">
            <Check size={16} className="text-success-400" />
            <p className="text-sm text-success-400">Seasonal reward claimed!</p>
          </div>
        )}
      </div>
    </ScreenShell>
  )
}

function SeasonalCard({ icon, label, value, target, claimed, displayValue }: { icon: React.ReactNode; label: string; value: number; target: number; claimed: boolean; displayValue?: string }) {
  return (
    <div className="bg-ink-900 border border-ink-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-ink-200 flex items-center gap-2">{icon} {label}</span>
        <span className="text-xs text-ink-400">{displayValue ?? value} / {target}</span>
      </div>
      <div className="h-2 bg-ink-800 rounded-full overflow-hidden">
        <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${Math.min(100, (value / target) * 100)}%` }} />
      </div>
    </div>
  )
}
