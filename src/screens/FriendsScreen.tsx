import { useState } from 'react'
import { Search, UserPlus, UserCheck, MoveHorizontal as MoreHorizontal, MapPin, Zap } from 'lucide-react'
import type { Friend } from '@/types/adventure'
import ScreenShell from '@/components/ScreenShell'
import BottomNav from '@/components/BottomNav'
import EmptyState from '@/components/EmptyState'

interface Props { onNavigate: (s: string) => void }
const mockFriends: Friend[] = [
  { id: 'f1', username: 'TrailBlazer', avatar_color: '#10b981', level: 8, xp: 5200, status: 'online' },
  { id: 'f2', username: 'PathFinder', avatar_color: '#f59e0b', level: 6, xp: 3400, status: 'in_adventure', current_activity: 'Riverside Walk' },
  { id: 'f3', username: 'SummitX', avatar_color: '#312f81', level: 12, xp: 12000, status: 'offline' },
  { id: 'f4', username: 'MoonWalker', avatar_color: '#059669', level: 4, xp: 1800, status: 'online' },
  { id: 'f5', username: 'GreenWalker', avatar_color: '#f97316', level: 7, xp: 4100, status: 'offline' },
]
const mockRequests = [{ id: 'r1', username: 'AdventureAce', avatar_color: '#ef4444', level: 3 }, { id: 'r2', username: 'Wanderlust', avatar_color: '#8b5cf6', level: 5 }]
const statusColors: Record<string, string> = { online: 'bg-success-500', in_adventure: 'bg-accent-500', offline: 'bg-surface-400' }
const statusLabels: Record<string, string> = { online: 'Online', in_adventure: 'In Adventure', offline: 'Offline' }

export default function FriendsScreen({ onNavigate }: Props) {
  const [search, setSearch] = useState(''), [tab, setTab] = useState<'friends'|'requests'|'search'>('friends')
  const [friends, setFriends] = useState(mockFriends), [requests, setRequests] = useState(mockRequests)
  const acceptRequest = (id: string) => { const req = requests.find(r => r.id === id); if (req) setFriends(prev => [...prev, { id: req.id, username: req.username, avatar_color: req.avatar_color, level: req.level, xp: 0, status: 'offline' }]); setRequests(prev => prev.filter(r => r.id !== id)) }
  const declineRequest = (id: string) => setRequests(prev => prev.filter(r => r.id !== id))
  return (
    <>
      <ScreenShell title="Friends" subtitle="Connect with fellow adventurers" actions={[{ icon: <UserPlus size={18} />, onClick: () => setTab('search'), label: 'Search Players' }]}>
        <div className="space-y-4">
          <div className="flex gap-2">{[{ id: 'friends' as const, label: 'Friends (' + friends.length + ')' }, { id: 'requests' as const, label: 'Requests (' + requests.length + ')' }, { id: 'search' as const, label: 'Search' }].map(t => <button key={t.id} onClick={() => setTab(t.id)} className={'chip flex-1 text-center ' + (tab === t.id ? 'chip-active' : 'chip-inactive')}>{t.label}</button>)}</div>
          {tab === 'search' && <div className="relative"><Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" /><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search players by username..." className="input-field pl-11" /></div>}
          {tab === 'requests' && (requests.length === 0 ? <EmptyState icon={<UserPlus size={32} />} title="No pending requests" message="When someone sends a friend request, it will appear here" /> : (
            <div className="space-y-2.5">{requests.map((r, i) => <div key={r.id} className="bg-white border border-surface-200 rounded-xl p-3.5 flex items-center gap-3 shadow-card stagger" style={{ animationDelay: i * 40 + 'ms' }}><div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: r.avatar_color }}>{r.username.charAt(0)}</div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-ink-900 truncate">{r.username}</p><p className="text-xs text-ink-400">Level {r.level}</p></div><button onClick={() => acceptRequest(r.id)} className="px-3 py-2 bg-brand-500 text-white rounded-xl text-xs font-bold btn-press hover:bg-brand-600 transition"><UserCheck size={14} /></button><button onClick={() => declineRequest(r.id)} className="px-3 py-2 bg-surface-100 text-ink-500 rounded-xl text-xs font-bold btn-press hover:bg-surface-200 transition"><MoreHorizontal size={14} /></button></div>)}</div>
          ))}
          {tab === 'friends' && (friends.length === 0 ? <EmptyState icon={<UserPlus size={32} />} title="No friends yet" message="Search for players and send friend requests" actionLabel="Search Players" onAction={() => setTab('search')} /> : (
            <div className="space-y-2.5">{friends.map((f, i) => <div key={f.id} className="bg-white border border-surface-200 rounded-xl p-3.5 flex items-center gap-3 shadow-card stagger" style={{ animationDelay: i * 40 + 'ms' }}><div className="relative"><div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: f.avatar_color }}>{f.username.charAt(0)}</div><div className={'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ' + statusColors[f.status]} /></div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-ink-900 truncate">{f.username}</p><p className="text-xs text-ink-400">{statusLabels[f.status]} · Level {f.level}</p>{f.current_activity && <p className="text-xs text-brand-600 mt-0.5 flex items-center gap-1"><MapPin size={10} /> {f.current_activity}</p>}</div><button onClick={() => onNavigate('party')} className="px-3 py-2 bg-brand-50 border border-brand-200 text-brand-600 rounded-xl text-xs font-bold btn-press hover:bg-brand-100 transition flex items-center gap-1"><Zap size={12} /> Invite</button></div>)}</div>
          ))}
          {tab === 'search' && <div className="space-y-2.5">{[{ id: 's1', username: 'AdventureAce', avatar_color: '#ef4444', level: 3 }, { id: 's2', username: 'Wanderlust', avatar_color: '#8b5cf6', level: 5 }, { id: 's3', username: 'GeoExplorer', avatar_color: '#06b6d4', level: 9 }, { id: 's4', username: 'TrailSeeker', avatar_color: '#84cc16', level: 11 }].filter(s => !search || s.username.toLowerCase().includes(search.toLowerCase())).map((s, i) => <div key={s.id} className="bg-white border border-surface-200 rounded-xl p-3.5 flex items-center gap-3 shadow-card stagger" style={{ animationDelay: i * 40 + 'ms' }}><div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: s.avatar_color }}>{s.username.charAt(0)}</div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-ink-900 truncate">{s.username}</p><p className="text-xs text-ink-400">Level {s.level}</p></div><button onClick={() => setRequests(prev => [...prev, { id: s.id, username: s.username, avatar_color: s.avatar_color, level: s.level }])} className="px-3 py-2 bg-brand-500 text-white rounded-xl text-xs font-bold btn-press hover:bg-brand-600 transition flex items-center gap-1"><UserPlus size={12} /> Add</button></div>)}</div>}
        </div>
      </ScreenShell>
      <BottomNav active="friends" onNavigate={onNavigate} />
    </>
  )
}
