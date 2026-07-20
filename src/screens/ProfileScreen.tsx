import { useEffect, useState } from 'react'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { useAuth } from '@/lib/auth'
import { levelFromXp, formatDistance } from '@/lib/geo'

interface Props { onBack: () => void }

export default function ProfileScreen({ onBack }: Props) {
  const { profile, signOut } = useAuth()
  const [loading, setLoading] = useState(!profile)

  useEffect(() => {
    if (!profile) setLoading(true)
    else setLoading(false)
  }, [profile])

  if (loading || !profile) {
    return <ScreenShell title="Profile" icon="👤" onBack={onBack}><LoadingSpinner label="Loading profile..." /></ScreenShell>
  }

  const level = levelFromXp(profile.xp)

  return (
    <ScreenShell title="Profile" icon="👤" onBack={onBack}>
      <div className="text-center mb-6">
        <div className="w-24 h-24 rounded-full mx-auto mb-3 flex items-center justify-center text-4xl"
          style={{ background: profile.avatar_color || '#1ba87d' }}>
          {profile.avatar_emoji}
        </div>
        <h2 className="text-xl font-bold text-ink-100">{profile.username}</h2>
        <p className="text-sm text-ink-400">Level {level} · {profile.bio || 'Adventurer'}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-ink-900 rounded-xl p-4 text-center border border-ink-800">
          <p className="text-2xl font-bold text-brand-400">{profile.xp.toLocaleString()}</p>
          <p className="text-xs text-ink-500 mt-1">Total XP</p>
        </div>
        <div className="bg-ink-900 rounded-xl p-4 text-center border border-ink-800">
          <p className="text-2xl font-bold text-accent-400">{profile.coins.toLocaleString()}</p>
          <p className="text-xs text-ink-500 mt-1">Coins</p>
        </div>
        <div className="bg-ink-900 rounded-xl p-4 text-center border border-ink-800">
          <p className="text-2xl font-bold text-purple-400">{profile.gems || 0}</p>
          <p className="text-xs text-ink-500 mt-1">Gems</p>
        </div>
        <div className="bg-ink-900 rounded-xl p-4 text-center border border-ink-800">
          <p className="text-2xl font-bold text-ink-100">{profile.completed_adventures}</p>
          <p className="text-xs text-ink-500 mt-1">Adventures</p>
        </div>
        <div className="bg-ink-900 rounded-xl p-4 text-center border border-ink-800">
          <p className="text-2xl font-bold text-ink-100">{profile.completed_challenges}</p>
          <p className="text-xs text-ink-500 mt-1">Challenges</p>
        </div>
        <div className="bg-ink-900 rounded-xl p-4 text-center border border-ink-800">
          <p className="text-2xl font-bold text-ink-100">{formatDistance(profile.distance_walked)}</p>
          <p className="text-xs text-ink-500 mt-1">Walked</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-ink-900 rounded-xl p-4 border border-ink-800">
          <h3 className="text-sm font-semibold text-ink-200 mb-2">Stats</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-ink-400">Walking Streak</span><span className="text-ink-200">{profile.walking_streak} days 🔥</span></div>
            <div className="flex justify-between"><span className="text-ink-400">Steps</span><span className="text-ink-200">{profile.steps.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-ink-400">Treasures</span><span className="text-ink-200">{profile.treasure_collected}</span></div>
            <div className="flex justify-between"><span className="text-ink-400">Exploration</span><span className="text-ink-200">{Math.round(profile.exploration_percentage)}%</span></div>
          </div>
        </div>

        <button
          onClick={signOut}
          className="w-full py-3 bg-error-500/10 border border-error-500/30 text-error-400 rounded-xl font-semibold text-sm transition active:scale-95 hover:bg-error-500/20"
        >
          Sign Out
        </button>
      </div>
    </ScreenShell>
  )
}
