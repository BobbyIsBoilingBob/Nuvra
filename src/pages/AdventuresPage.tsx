import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import type { Adventure } from '../types'
import { ADVENTURE_TYPES } from '../lib/gameData'
import { formatDistance } from '../lib/gps'

export function AdventuresPage() {
  const { user } = useAuthStore()
  const [adventures, setAdventures] = useState<Adventure[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  useEffect(() => {
    fetchAdventures()
  }, [])

  const fetchAdventures = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('adventures')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setAdventures(data as Adventure[])
    }
    setLoading(false)
  }

  const filtered = adventures.filter((a) => {
    if (filter === 'all') return true
    return a.status === filter
  })

  const activeCount = adventures.filter((a) => a.status === 'active').length
  const completedCount = adventures.filter((a) => a.status === 'completed').length

  return (
    <div className="h-full overflow-y-auto pb-4">
      <div className="px-4 py-4">
        <h1 className="text-2xl font-display font-bold text-neutral-900 mb-1">Adventures</h1>
        <p className="text-sm text-neutral-500 mb-4">Your exploration journey</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="stat-card">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧭</span>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{activeCount}</p>
                <p className="text-xs text-neutral-500">Active</p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{completedCount}</p>
                <p className="text-xs text-neutral-500">Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Adventure list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4">
                <div className="shimmer-bg h-16 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="text-5xl mb-3">🗺️</div>
            <p className="text-neutral-500 font-medium mb-1">No adventures yet</p>
            <p className="text-sm text-neutral-400">Start exploring from the Map page!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((adv) => {
              const advType = ADVENTURE_TYPES.find((t) => t.type === adv.type)
              const waypoints = adv.waypoints as Array<{ lat: number; lng: number; label: string; reached: boolean }>
              const reachedCount = waypoints.filter((w) => w.reached).length

              return (
                <div key={adv.id} className="card p-4 animate-fade-in">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{advType?.icon || '🧭'}</span>
                      <div>
                        <h3 className="font-semibold text-neutral-900">{advType?.label || adv.type}</h3>
                        <p className="text-xs text-neutral-500">
                          {new Date(adv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <span className={`badge ${
                      adv.status === 'completed' ? 'bg-success-50 text-success-700' :
                      adv.status === 'active' ? 'bg-primary-50 text-primary-700' :
                      'bg-neutral-100 text-neutral-500'
                    }`}>
                      {adv.status === 'completed' ? '✓ Completed' : adv.status === 'active' ? 'Active' : 'Abandoned'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="text-primary-600 font-semibold">+{adv.reward_xp} XP</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-accent-600 font-semibold">+{adv.reward_coins} 🪙</span>
                    </div>
                    {waypoints.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-neutral-500">{reachedCount}/{waypoints.length} checkpoints</span>
                      </div>
                    )}
                    {adv.target_distance && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-neutral-500">{formatDistance(adv.target_distance)} goal</span>
                      </div>
                    )}
                  </div>

                  {adv.status === 'completed' && adv.completed_at && (
                    <p className="text-xs text-success-600 mt-2">
                      Completed on {new Date(adv.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
