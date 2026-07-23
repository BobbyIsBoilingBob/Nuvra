import { useState, useCallback, memo } from 'react'
import { UserPlus, Search, UserCheck, MessageCircle, Zap } from 'lucide-react'
import { ScreenShell } from '@/components/ScreenShell'
import { BottomNav } from '@/components/BottomNav'
import { useToasts, ToastContainer } from '@/components/Toast'
import { SkeletonList } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { useCachedData } from '@/lib/cache'
import { useLevelInfo } from '@/lib/geo'
import type { ScreenName, Friend } from '@/types/adventure'

interface Props { onNavigate: (s: ScreenName) => void }

const mockFriends: Friend[] = [
  { id: 'f1', username: 'TrailBlazer', avatar_color: '#10b981', level: 8, xp: 4200, status: 'online', current_activity: 'Browsing adventures' },
  { id: 'f2', username: 'CityRoamer', avatar_color: '#f59e0b', level: 6, xp: 2800, status: 'in_adventure', current_activity: 'Riverside Mystery' },
  { id: 'f3', username: 'PeakSeeker', avatar_color: '#8b5cf6', level: 10, xp: 6500, status: 'offline' },
  { id: 'f4', username: 'RiddleMaster', avatar_color: '#ef4444', level: 4, xp: 1500, status: 'online', current_activity: 'Solving riddles' },
  { id: 'f5', username: 'NightOwl', avatar_color: '#3b82f6', level: 7, xp: 3500, status: 'offline' },
  { id: 'f6', username: 'FoodieFan', avatar_color: '#ec4899', level: 5, xp: 2200, status: 'in_adventure', current_activity: 'Market Trail' },
]

async function fetchFriends(): Promise<Friend[]> {
  return mockFriends
}

const statusColors: Record<Friend['status'], string> = {
  online: 'bg-success-500',
  offline: 'bg-surface-400',
  in_adventure: 'bg-brand-500',
}
const statusLabels: Record<Friend['status'], string> = {
  online: 'Online',
  offline: 'Offline',
  in_adventure: 'In Adventure',
}

function FriendCard({ friend, onAdd }: { friend: Friend; onAdd: (f: Friend) => void }) {
  const levelInfo = useLevelInfo(friend.xp)
  return (
    <div className="card-premium p-3 flex items-center gap-3 animate-fade-in">
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: friend.avatar_color }}>
          {friend.username.charAt(0).toUpperCase()}
        </div>
        <div className={'absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ' + statusColors[friend.status]} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-ink-900 truncate">{friend.username}</p>
        <p className="text-xs text-ink-400">Level {levelInfo.level} - {statusLabels[friend.status]}</p>
        {friend.current_activity && <p className="text-[10px] text-brand-500 font-medium truncate">{friend.current_activity}</p>}
      </div>
      <button onClick={() => onAdd(friend)} className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-500 hover:bg-brand-100 transition btn-press">
        <MessageCircle size={16} />
      </button>
    </div>
  )
}

function FriendsScreenInner({ onNavigate }: Props) {
  const { toasts, push, dismiss } = useToasts()
  const [search, setSearch] = useState('')
  const { data, loading } = useCachedData<Friend[]>('friends', fetchFriends)

  const handleAdd = useCallback((f: Friend) => {
    push('info', 'Message', 'Opening chat with ' + f.username)
  }, [push])

  const handleNavigate = useCallback((s: ScreenName) => onNavigate(s), [onNavigate])

  const filtered = (data ?? []).filter(f => !search.trim() || f.username.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <ScreenShell title="Friends" subtitle="Your adventure crew" icon={<UserPlus size={18} />} onBack={() => onNavigate('home')} actions={[{ icon: <UserCheck size={18} />, onClick: () => push('info', 'Friend requests', 'No new requests'), label: 'Requests' }]}>
        <div className="space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search friends..." className="input-field pl-10" />
          </div>

          {loading && !data ? <SkeletonList count={4} /> : filtered.length > 0 ? (
            <div className="space-y-2">
              {filtered.map((f, i) => <FriendCard key={f.id} friend={f} onAdd={handleAdd} />)}
            </div>
          ) : (
            <EmptyState icon={<UserPlus size={28} />} title="No friends found" message="Add friends to adventure together" actionLabel="Find Friends" onAction={() => push('info', 'Coming soon', 'Friend discovery is in beta')} />
          )}

          {/* Suggested */}
          <div>
            <p className="section-label flex items-center gap-1.5"><Zap size={12} /> Suggested</p>
            <div className="space-y-2">
              {(['ExplorerX', 'WanderW', 'TrekkerY'] as const).map((name, i) => (
                <div key={name} className="card-premium p-3 flex items-center gap-3 animate-fade-in" style={{ animationDelay: String(i * 40) + 'ms' }}>
                  <div className="w-10 h-10 rounded-xl bg-surface-200 flex items-center justify-center text-ink-500 font-bold">{name.charAt(0)}</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-ink-900">{name}</p>
                    <p className="text-xs text-ink-400">Similar interests</p>
                  </div>
                  <button onClick={() => push('success', 'Request sent', 'Friend request sent to ' + name)} className="btn-secondary text-sm px-4 py-2">Add</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScreenShell>
      <BottomNav active="friends" onNavigate={handleNavigate} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export const FriendsScreen = memo(FriendsScreenInner)
