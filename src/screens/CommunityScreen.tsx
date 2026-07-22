import { useState } from 'react'
import { Search, Star, MapPin, Users, Play, Filter } from 'lucide-react'
import type { CommunityAdventure } from '@/types/adventure'
import { difficultyColors } from '@/lib/geo'
import { formatDistance, formatDuration } from '@/lib/geo'
import ScreenShell from '@/components/ScreenShell'
import BottomNav from '@/components/BottomNav'
import EmptyState from '@/components/EmptyState'

interface Props { onNavigate: (s: string) => void }

const mockCommunity: CommunityAdventure[] = [
  { id: 'c1', name: 'Hidden Gems of Old Town', author: 'TrailSeeker', author_avatar: '#10b981', location: 'Old Town', difficulty: 'easy', rating: 4.8, plays: 1240, distanceKm: 1.2, durationMin: 25, description: 'Discover secret spots in the historic district', checkpoints: 4 },
  { id: 'c2', name: 'Riverside Mystery', author: 'PathFinder', author_avatar: '#f59e0b', location: 'Riverside', difficulty: 'medium', rating: 4.6, plays: 890, distanceKm: 2.5, durationMin: 40, description: 'A thrilling mystery along the river', checkpoints: 5 },
  { id: 'c3', name: 'Mountain Peak Challenge', author: 'SummitX', author_avatar: '#312f81', location: 'North Ridge', difficulty: 'hard', rating: 4.9, plays: 567, distanceKm: 4.0, durationMin: 60, description: 'Conquer the peak with this challenging route', checkpoints: 6 },
  { id: 'c4', name: 'Night Explorer', author: 'MoonWalker', author_avatar: '#059669', location: 'City Center', difficulty: 'medium', rating: 4.5, plays: 1200, distanceKm: 2.0, durationMin: 35, description: 'Explore the city under the stars', checkpoints: 4 },
  { id: 'c5', name: 'Park Discovery', author: 'GreenWalker', author_avatar: '#f97316', location: 'Central Park', difficulty: 'easy', rating: 4.7, plays: 2100, distanceKm: 1.5, durationMin: 30, description: 'A relaxing adventure through nature', checkpoints: 3 },
  { id: 'c6', name: 'Extreme Urban Quest', author: 'UrbanNinja', author_avatar: '#ef4444', location: 'Downtown', difficulty: 'extreme', rating: 4.9, plays: 345, distanceKm: 5.5, durationMin: 75, description: 'The ultimate urban challenge', checkpoints: 7 },
]

export default function CommunityScreen({ onNavigate }: Props) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const filtered = mockCommunity.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || c.difficulty === filter
    return matchSearch && matchFilter
  })

  return (
    <>
      <ScreenShell title="Community" subtitle="Adventures from explorers worldwide">
        <div className="space-y-4">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search adventures or locations..." className="input-field pl-11" />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {['all', 'easy', 'medium', 'hard', 'extreme'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`chip whitespace-nowrap capitalize ${filter === f ? 'chip-active' : 'chip-inactive'}`}>{f}</button>
            ))}
          </div>

          {filtered.length === 0 ? <EmptyState icon={<Search size={32} />} title="No adventures found" message="Try a different search or filter" /> : (
            <div className="space-y-3">
              {filtered.map((c, i) => (
                <div key={c.id} className="card-premium overflow-hidden stagger" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-ink-900 truncate">{c.name}</h3>
                        <p className="text-xs text-ink-400 mt-0.5">{c.description}</p>
                      </div>
                      <span className={`chip ${difficultyColors[c.difficulty]} ml-2 capitalize flex-shrink-0`}>{c.difficulty}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-ink-400 mb-3">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {c.location}</span>
                      <span className="flex items-center gap-1"><Star size={12} className="text-accent-500" /> {c.rating}</span>
                      <span className="flex items-center gap-1"><Users size={12} /> {c.plays.toLocaleString()}</span>
                      <span className="flex items-center gap-1">{formatDistance(c.distanceKm)}</span>
                      <span className="flex items-center gap-1">{formatDuration(c.durationMin)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: c.author_avatar }}>{c.author.charAt(0)}</div>
                        <span className="text-xs text-ink-500 font-medium">{c.author}</span>
                      </div>
                      <button onClick={() => onNavigate('generator')} className="flex items-center gap-1.5 px-4 py-2 bg-brand-500 text-white rounded-xl text-xs font-bold btn-press hover:bg-brand-600 transition">
                        <Play size={14} /> Play
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScreenShell>
      <BottomNav active="community" onNavigate={onNavigate} />
    </>
  )
}
