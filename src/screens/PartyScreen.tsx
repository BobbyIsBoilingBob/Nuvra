import { useState, useCallback, memo } from 'react'
import { Users, Crown, Check, X, Play, UserPlus } from 'lucide-react'
import { ScreenShell } from '@/components/ScreenShell'
import { BottomNav } from '@/components/BottomNav'
import { useToasts, ToastContainer } from '@/components/Toast'
import { EmptyState } from '@/components/EmptyState'
import type { ScreenName, PartyMember } from '@/types/adventure'

interface Props { onNavigate: (s: ScreenName) => void }

const mockParty: PartyMember[] = [
  { id: 'p1', username: 'TrailBlazer', avatar_color: '#10b981', level: 8, status: 'ready', role: 'leader' },
  { id: 'p2', username: 'CityRoamer', avatar_color: '#f59e0b', level: 6, status: 'ready', role: 'member' },
  { id: 'p3', username: 'PeakSeeker', avatar_color: '#8b5cf6', level: 10, status: 'in_adventure', role: 'member' },
  { id: 'p4', username: 'RiddleMaster', avatar_color: '#ef4444', level: 4, status: 'ready', role: 'member' },
]

function PartyScreenInner({ onNavigate }: Props) {
  const { toasts, push, dismiss } = useToasts()
  const [party] = useState<PartyMember[]>(mockParty)

  const handleStart = useCallback(() => {
    const allReady = party.every(m => m.status === 'ready')
    if (!allReady) { push('error', 'Not ready', 'Some members are still in an adventure'); return }
    push('success', 'Party adventure starting!', 'Good luck, team')
    onNavigate('generator')
  }, [party, push, onNavigate])

  const handleNavigate = useCallback((s: ScreenName) => onNavigate(s), [onNavigate])

  const leader = party.find(m => m.role === 'leader')
  const readyCount = party.filter(m => m.status === 'ready').length

  return (
    <>
      <ScreenShell title="Party" subtitle={readyCount + ' of ' + party.length + ' ready'} icon={<Users size={18} />} onBack={() => onNavigate('home')} actions={[{ icon: <UserPlus size={18} />, onClick: () => push('info', 'Invite', 'Share your party code'), label: 'Invite' }]}>
        <div className="space-y-4">
          {/* Party status */}
          <div className="bg-gradient-to-br from-brand-50 to-accent-50/40 border border-brand-200 rounded-2xl p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-ink-900">Party Status</p>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-full">{readyCount}/{party.length} Ready</span>
            </div>
            <p className="text-xs text-ink-500">Leader: {leader?.username ?? 'Unknown'}. All members must be ready to start.</p>
          </div>

          {/* Members */}
          {party.length > 0 ? (
            <div className="space-y-2">
              {party.map((m, i) => {
                return (
                  <div key={m.id} className="card-premium p-3 flex items-center gap-3 animate-fade-in" style={{ animationDelay: String(i * 40) + 'ms' }}>
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: m.avatar_color }}>
                        {m.username.charAt(0).toUpperCase()}
                      </div>
                      {m.role === 'leader' && <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-500 border-2 border-white flex items-center justify-center"><Crown size={10} className="text-white" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-ink-900 truncate">{m.username}</p>
                      <p className="text-xs text-ink-400">Level {m.level} - {m.role === 'leader' ? 'Leader' : 'Member'}</p>
                    </div>
                    {m.status === 'ready' ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-success-600 bg-success-50 px-2.5 py-1.5 rounded-full"><Check size={12} /> Ready</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1.5 rounded-full"><X size={12} /> In Adventure</span>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState icon={<Users size={28} />} title="No party members" message="Invite friends to join your party" actionLabel="Invite Friends" onAction={() => onNavigate('friends')} />
          )}

          {/* Start button */}
          <button onClick={handleStart} className="btn-primary w-full flex items-center justify-center gap-2">
            <Play size={18} /> Start Party Adventure
          </button>
        </div>
      </ScreenShell>
      <BottomNav active="party" onNavigate={handleNavigate} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export const PartyScreen = memo(PartyScreenInner)
