import { useEffect, useState } from 'react'
import { User, Star, Coins, Gem, Route, Footprints, Trophy, Target, TrendingUp, Award, LogOut, Compass } from 'lucide-react'
import ScreenShell from '@/components/ScreenShell'
import LoadingSpinner from '@/components/LoadingSpinner'
import EmptyState from '@/components/EmptyState'
import { useAuth } from '@/lib/auth'
import { getAchievements } from '@/lib/db'
import { achievementIcons } from '@/data/icons'
import { xpProgressInLevel } from '@/lib/geo'
import type { ScreenName, Achievement } from '@/types/adventure'

interface Props {
  onBack: () => void
  onNavigate: (screen: ScreenName) => void
  onToast: (type: 'success' | 'error' | 'info' | 'reward', title: string, message?: string) => void
}

export default function ProfileScreen({ onBack, onNavigate, onToast }: Props) {
  const { profile, signOut } = useAuth()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAchievements().then(a => { setAchievements(a); setLoading(false) })
  }, [])

  if (!profile) {
    return (
      <ScreenShell title="Profile" icon={<User size={18} />} onBack={onBack}>
        <EmptyState icon={<User size={40} />} title="No profile" message="Please sign in again" />
      </ScreenShell>
    )
  }

  const xpInfo = xpProgressInLevel(profile.xp)
  const stats = [
    { icon: <Star size={16} />, label: 'Level', value: profile.level, color: 'text-brand-400' },
    { icon: <TrendingUp size={16} />, label: 'Total XP', value: profile.xp, color: 'text-brand-400' },
    { icon: <Coins size={16} />, label: 'Coins', value: profile.coins, color: 'text-accent-400' },
    { icon: <Gem size={16} />, label: 'Gems', value: profile.gems, color: 'text-cyan-400' },
    { icon: <Route size={16} />, label: 'Distance', value: `${profile.distance_walked.toFixed(1)} km`, color: 'text-success-400' },
    { icon: <Footprints size={16} />, label: 'Steps', value: profile.steps, color: 'text-success-400' },
    { icon: <Trophy size={16} />, label: 'Adventures', value: profile.completed_adventures, color: 'text-yellow-400' },
    { icon: <Target size={16} />, label: 'Challenges', value: profile.completed_challenges, color: 'text-pink-400' },
  ]

  return (
    <ScreenShell title="Profile" icon={<User size={18} />} onBack={onBack}
      headerRight={
        <button onClick={async () => { await signOut(); onToast('info', 'Signed out') }} className="text-ink-400 hover:text-error-400 transition active:scale-90 p-1">
          <LogOut size={18} />
        </button>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: profile.avatar_color || '#10b981' }}>
            <Compass size={32} className="text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-ink-100 truncate">{profile.username}</h2>
            <p className="text-sm text-ink-400 truncate">{profile.bio || 'No bio yet'}</p>
            <p className="text-xs text-ink-500 mt-0.5">Joined {new Date(profile.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="bg-ink-900 border border-ink-800 rounded-2xl p-4">
          <div className="flex justify-between text-xs text-ink-500 mb-2">
            <span>Level {profile.level}</span>
            <span>{xpInfo.current} / {xpInfo.needed} XP</span>
          </div>
          <div className="h-2.5 bg-ink-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all duration-500" style={{ width: `${xpInfo.percent}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map(s => (
            <div key={s.label} className="bg-ink-900 border border-ink-800 rounded-xl p-3">
              <div className={`flex items-center gap-1.5 text-xs ${s.color} mb-1`}>{s.icon}<span className="uppercase">{s.label}</span></div>
              <p className="text-lg font-bold text-ink-100">{s.value}</p>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink-200 mb-3 flex items-center gap-2"><Award size={16} className="text-accent-400" /> Achievements</h3>
          {loading ? <LoadingSpinner size="sm" /> : achievements.length === 0 ? (
            <EmptyState icon={<Award size={32} />} title="No achievements yet" message="Complete adventures to unlock achievements" />
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {achievements.map(a => {
                const Icon = achievementIcons[a.icon] || Award
                return (
                  <div key={a.id} className="bg-ink-900 border border-ink-800 rounded-xl p-3 text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-accent-500/20 border border-accent-500/30 mb-1">
                      <Icon size={20} className="text-accent-400" />
                    </div>
                    <p className="text-xs font-medium text-ink-200">{a.achievement_name}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <button onClick={() => onNavigate('avatar')} className="w-full py-3 bg-ink-800 hover:bg-ink-700 text-ink-200 rounded-xl font-semibold text-sm transition active:scale-95">
          Customise Avatar
        </button>
      </div>
    </ScreenShell>
  )
}
