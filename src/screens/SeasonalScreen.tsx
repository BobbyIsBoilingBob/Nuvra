import { useCallback, memo } from 'react'
import { Sparkles, Clock, Zap, Coins, Gift } from 'lucide-react'
import { ScreenShell } from '@/components/ScreenShell'
import { BottomNav } from '@/components/BottomNav'
import { useToasts, ToastContainer } from '@/components/Toast'
import { SkeletonList } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { useCachedData } from '@/lib/cache'
import { achievementIcons } from '@/data/navigation'
import type { ScreenName, SeasonalEvent } from '@/types/adventure'

interface Props { onNavigate: (s: ScreenName) => void }

const mockEvents: SeasonalEvent[] = [
  { id: 'e1', name: 'Summer Festival', description: 'Complete beach-themed adventures for exclusive rewards', icon: 'fire', progress: 2, target: 5, reward_xp: 500, reward_coins: 250, ends_at: new Date(Date.now() + 604800000).toISOString() },
  { id: 'e2', name: 'Autumn Trail', description: 'Explore parks and forests during fall season', icon: 'mountain', progress: 0, target: 3, reward_xp: 400, reward_coins: 200, ends_at: new Date(Date.now() + 1209600000).toISOString() },
  { id: 'e3', name: 'Halloween Hunt', description: 'Spooky adventures with mystery challenges', icon: 'star', progress: 1, target: 4, reward_xp: 600, reward_coins: 300, ends_at: new Date(Date.now() + 2592000000).toISOString() },
  { id: 'e4', name: 'Winter Wonderland', description: 'Cold-weather exploration quests', icon: 'compass', progress: 0, target: 6, reward_xp: 800, reward_coins: 400, ends_at: new Date(Date.now() + 5184000000).toISOString() },
]

async function fetchEvents(): Promise<SeasonalEvent[]> {
  return mockEvents
}

function formatTimeLeft(endsAt: string): string {
  const ms = new Date(endsAt).getTime() - Date.now()
  const days = Math.floor(ms / 86400000)
  if (days > 0) return days + 'd left'
  const hours = Math.floor(ms / 3600000)
  if (hours > 0) return hours + 'h left'
  return 'Ending soon'
}

function SeasonalScreenInner({ onNavigate }: Props) {
  const { toasts, push, dismiss } = useToasts()
  const { data, loading } = useCachedData<SeasonalEvent[]>('seasonal', fetchEvents)

  const handleNavigate = useCallback((s: ScreenName) => onNavigate(s), [onNavigate])

  return (
    <>
      <ScreenShell title="Seasonal Events" subtitle="Limited-time adventures" icon={<Sparkles size={18} />} onBack={() => onNavigate('home')}>
        <div className="space-y-4">
          {loading && !data ? <SkeletonList count={3} /> : data && data.length > 0 ? (
            <div className="space-y-3">
              {data.map((event, i) => {
                const Icon = achievementIcons[event.icon] ?? Sparkles
                const pct = Math.min((event.progress / event.target) * 100, 100)
                const isComplete = event.progress >= event.target
                return (
                  <div key={event.id} className="card-premium p-4 animate-fade-in" style={{ animationDelay: String(i * 40) + 'ms' }}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center flex-shrink-0">
                        <Icon size={22} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-ink-900">{event.name}</p>
                        <p className="text-xs text-ink-400">{event.description}</p>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-warning-600 bg-warning-50 px-2 py-1 rounded-full whitespace-nowrap">
                        <Clock size={10} /> {formatTimeLeft(event.ends_at)}
                      </span>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-ink-700">{event.progress} / {event.target} completed</span>
                        <span className="text-xs text-ink-400">{Math.round(pct)}%</span>
                      </div>
                      <div className="h-2.5 bg-surface-200 rounded-full overflow-hidden">
                        <div className={'h-full rounded-full transition-all duration-500 ' + (isComplete ? 'bg-gradient-to-r from-success-500 to-success-600' : 'bg-gradient-to-r from-accent-500 to-accent-600')} style={{ width: pct + '%' }} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-surface-200">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-xs font-bold text-brand-600"><Zap size={12} /> {event.reward_xp} XP</span>
                        <span className="flex items-center gap-1 text-xs font-bold text-accent-600"><Coins size={12} /> {event.reward_coins}</span>
                      </div>
                      {isComplete ? (
                        <button onClick={() => push('reward', 'Reward claimed!', 'Seasonal event completed')} className="btn-primary text-sm flex items-center gap-1.5 px-4 py-2">
                          <Gift size={14} /> Claim
                        </button>
                      ) : (
                        <button onClick={() => onNavigate('generator')} className="btn-secondary text-sm px-4 py-2">Join</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState icon={<Sparkles size={28} />} title="No active events" message="Check back later for seasonal adventures" />
          )}
        </div>
      </ScreenShell>
      <BottomNav active="seasonal" onNavigate={handleNavigate} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export const SeasonalScreen = memo(SeasonalScreenInner)
