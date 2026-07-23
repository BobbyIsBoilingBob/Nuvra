import { useState, useCallback, memo } from 'react'
import { Users, Star, MapPin, Clock, Play, Search } from 'lucide-react'
import { ScreenShell } from '@/components/ScreenShell'
import { BottomNav } from '@/components/BottomNav'
import { useToasts, ToastContainer } from '@/components/Toast'
import { SkeletonList } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { useCachedData } from '@/lib/cache'
import { formatDistance, formatDuration, difficultyColors } from '@/lib/geo'
import { difficultyIcons } from '@/data/navigation'
import type { ScreenName, CommunityAdventure, Difficulty } from '@/types/adventure'

interface Props { onNavigate: (s: ScreenName) => void }

const mockCommunity: CommunityAdventure[] = [
  { id: 'c1', name: 'Riverside Mystery', author: 'TrailBlazer', author_avatar: '#10b981', location: 'Thames Path', difficulty: 'easy', rating: 4.8, plays: 1240, distanceKm: 1.8, durationMin: 25, description: 'A scenic riverside walk with trivia about local history.', checkpoints: 4 },
  { id: 'c2', name: 'Downtown Dash', author: 'CityRoamer', author_avatar: '#f59e0b', location: 'City Center', difficulty: 'medium', rating: 4.6, plays: 890, distanceKm: 2.5, durationMin: 35, description: 'Explore downtown landmarks with photo challenges.', checkpoints: 5 },
  { id: 'c3', name: 'Hilltop Hunt', author: 'PeakSeeker', author_avatar: '#8b5cf6', location: 'North Ridge', difficulty: 'hard', rating: 4.9, plays: 567, distanceKm: 3.8, durationMin: 55, description: 'A challenging hillside adventure with compass navigation.', checkpoints: 6 },
  { id: 'c4', name: 'Park Puzzler', author: 'RiddleMaster', author_avatar: '#ef4444', location: 'Central Park', difficulty: 'easy', rating: 4.5, plays: 2100, distanceKm: 1.2, durationMin: 20, description: 'Solve riddles while strolling through the park.', checkpoints: 3 },
  { id: 'c5', name: 'Night Explorer', author: 'NightOwl', author_avatar: '#3b82f6', location: 'Old Town', difficulty: 'extreme', rating: 4.7, plays: 320, distanceKm: 5.0, durationMin: 75, description: 'A nighttime adventure for the brave. Bring a flashlight!', checkpoints: 6 },
  { id: 'c6', name: 'Market Trail', author: 'FoodieFan', author_avatar: '#ec4899', location: 'Market Square', difficulty: 'medium', rating: 4.4, plays: 1500, distanceKm: 2.0, durationMin: 30, description: 'Discover hidden gems in the local market area.', checkpoints: 4 },
]

async function fetchCommunity(): Promise<CommunityAdventure[]> {
  return mockCommunity
}

function CommunityScreenInner({ onNavigate }: Props) {
  const { toasts, push, dismiss } = useToasts()
  const [search, setSearch] = useState('')
  const [filterDiff, setFilterDiff] = useState<Difficulty | 'all'>('all')
  const { data, loading } = useCachedData<CommunityAdventure[]>('community', fetchCommunity)

  const handleNavigate = useCallback((s: ScreenName) => onNavigate(s), [onNavigate])

  const filtered = (data ?? []).filter(a => {
    if (filterDiff !== 'all' && a.difficulty !== filterDiff) return false
    if (search.trim() && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.location.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <>
      <ScreenShell title="Community" subtitle="Shared adventures" icon={<Users size={18} />} onBack={() => onNavigate('home')}>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search adventures..." className="input-field pl-10" />
          </div>

          {/* Difficulty filter */}
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFilterDiff('all')} className={'chip ' + (filterDiff === 'all' ? 'chip-active' : 'chip-inactive')}>All</button>
            {(['easy', 'medium', 'hard', 'extreme'] as Difficulty[]).map(d => {
              const Icon = difficultyIcons[d]
              return <button key={d} onClick={() => setFilterDiff(d)} className={'chip flex items-center gap-1 ' + (filterDiff === d ? 'chip-active' : 'chip-inactive')}><Icon size={12} /> {d.charAt(0).toUpperCase() + d.slice(1)}</button>
            })}
          </div>

          {/* List */}
          {loading && !data ? <SkeletonList count={4} /> : filtered.length > 0 ? (
            <div className="space-y-3">
              {filtered.map((adv, i) => {
                const diffColor = difficultyColors[adv.difficulty]
                return (
                  <div key={adv.id} className="card-premium p-4 animate-fade-in" style={{ animationDelay: String(i * 40) + 'ms' }}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: adv.author_avatar }}>
                        {adv.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-ink-900">{adv.name}</p>
                        <p className="text-xs text-ink-400">by {adv.author}</p>
                      </div>
                      <span className="flex items-center gap-1 text-xs font-bold text-accent-600"><Star size={12} className="fill-accent-500 text-accent-500" /> {adv.rating}</span>
                    </div>
                    <p className="text-xs text-ink-600 mb-3">{adv.description}</p>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex items-center gap-1 text-xs text-ink-400"><MapPin size={12} /> {adv.location}</span>
                      <span className={'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ' + diffColor}>{adv.difficulty}</span>
                      <span className="flex items-center gap-1 text-xs text-ink-400"><Clock size={12} /> {formatDuration(adv.durationMin)}</span>
                      <span className="text-xs text-ink-400">{formatDistance(adv.distanceKm)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-surface-200">
                      <span className="text-xs text-ink-400">{adv.plays} plays - {adv.checkpoints} checkpoints</span>
                      <button onClick={() => push('info', 'Coming soon', 'Multiplayer adventures are in beta')} className="btn-primary text-sm flex items-center gap-1.5"><Play size={14} /> Play</button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState icon={<Users size={28} />} title="No adventures found" message="Try a different search or filter" />
          )}
        </div>
      </ScreenShell>
      <BottomNav active="community" onNavigate={handleNavigate} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export const CommunityScreen = memo(CommunityScreenInner)
