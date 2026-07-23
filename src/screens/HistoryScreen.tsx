import { useCallback, memo } from 'react'
import { ScrollText, Clock, Zap, Coins, MapPin, Trophy } from 'lucide-react'
import { ScreenShell } from '@/components/ScreenShell'
import { BottomNav } from '@/components/BottomNav'
import { useToasts, ToastContainer } from '@/components/Toast'
import { SkeletonList } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { useCachedData } from '@/lib/cache'
import { formatDuration } from '@/lib/geo'
import type { ScreenName, AdventureHistoryItem } from '@/types/adventure'

interface Props { onNavigate: (s: ScreenName) => void }

function HistoryScreenInner({ onNavigate }: Props) {
  const { toasts, push, dismiss } = useToasts()
  const { data, loading } = useCachedData<AdventureHistoryItem[]>('history', async () => {
    const { getAdventureHistory } = await import('@/lib/db')
    return getAdventureHistory()
  })

  const handleNavigate = useCallback((s: ScreenName) => onNavigate(s), [onNavigate])

  const totalXp = (data ?? []).reduce((sum, h) => sum + h.xp_earned, 0)
  const totalCoins = (data ?? []).reduce((sum, h) => sum + h.coins_earned, 0)
  const totalAdventures = data?.length ?? 0

  return (
    <>
      <ScreenShell title="History" subtitle="Your adventure log" icon={<ScrollText size={18} />} onBack={() => onNavigate('home')}>
        <div className="space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white border border-surface-200 rounded-xl p-3 text-center shadow-card">
              <Trophy size={18} className="mx-auto text-brand-500 mb-1" />
              <p className="text-lg font-extrabold text-ink-900">{totalAdventures}</p>
              <p className="text-[10px] text-ink-400">Adventures</p>
            </div>
            <div className="bg-white border border-surface-200 rounded-xl p-3 text-center shadow-card">
              <Zap size={18} className="mx-auto text-brand-500 mb-1" />
              <p className="text-lg font-extrabold text-ink-900">{totalXp}</p>
              <p className="text-[10px] text-ink-400">XP Earned</p>
            </div>
            <div className="bg-white border border-surface-200 rounded-xl p-3 text-center shadow-card">
              <Coins size={18} className="mx-auto text-accent-500 mb-1" />
              <p className="text-lg font-extrabold text-ink-900">{totalCoins}</p>
              <p className="text-[10px] text-ink-400">Coins</p>
            </div>
          </div>

          {/* History list */}
          {loading && !data ? <SkeletonList count={4} /> : data && data.length > 0 ? (
            <div className="space-y-2">
              {data.map((h, i) => (
                <div key={h.id} className="card-premium p-3 flex items-center gap-3 animate-fade-in" style={{ animationDelay: String(i * 40) + 'ms' }}>
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <MapPin size={16} className="text-brand-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink-900 truncate">{h.adventure_name}</p>
                    <div className="flex items-center gap-2 text-xs text-ink-400">
                      <span className="truncate">{h.location_name}</span>
                      <span>-</span>
                      <span className="flex items-center gap-0.5"><Clock size={10} /> {formatDuration(h.duration)}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-brand-600">+{h.xp_earned}</p>
                    <p className="text-[10px] text-ink-400">{h.coins_earned} coins - {h.treasures_found} treasures</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<ScrollText size={28} />} title="No adventures yet" message="Complete your first adventure to see it here" actionLabel="Start Adventure" onAction={() => onNavigate('generator')} />
          )}
        </div>
      </ScreenShell>
      <BottomNav active="history" onNavigate={handleNavigate} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export const HistoryScreen = memo(HistoryScreenInner)
