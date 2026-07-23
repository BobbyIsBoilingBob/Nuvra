import { useState, useCallback, memo } from 'react'
import { User, Zap, Coins, Gem, Flame, Trophy, CreditCard as Edit2, Check, X } from 'lucide-react'
import { ScreenShell } from '@/components/ScreenShell'
import { BottomNav } from '@/components/BottomNav'
import { useToasts, ToastContainer } from '@/components/Toast'
import { SkeletonProfile } from '@/components/Skeleton'
import { EmptyState } from '@/components/EmptyState'
import { useCachedData } from '@/lib/cache'
import { useAuth } from '@/lib/auth'
import { useLevelInfo, formatDuration } from '@/lib/geo'
import { getAchievements, getAdventureHistory, updateProfile } from '@/lib/db'
import { achievementIcons } from '@/data/navigation'
import type { ScreenName, Achievement, AdventureHistoryItem } from '@/types/adventure'

interface Props { onNavigate: (s: ScreenName) => void }

function ProfileScreenInner({ onNavigate }: Props) {
  const { profile, refreshProfile } = useAuth()
  const { toasts, push, dismiss } = useToasts()
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState(profile?.username ?? '')

  const { data: achievements, loading: achLoading } = useCachedData<Achievement[]>('achievements', getAchievements)
  const { data: history, loading: histLoading } = useCachedData<AdventureHistoryItem[]>('history', getAdventureHistory)

  const levelInfo = useLevelInfo(profile?.xp ?? 0)
  const unlockedAch = achievements?.filter(a => a.unlocked) ?? []

  const handleSave = useCallback(async () => {
    if (!profile) return
    const ok = await updateProfile({ id: profile.id, username: username.trim() })
    if (ok) { push('success', 'Profile updated', 'Your name has been changed'); refreshProfile(); setEditing(false) }
    else push('error', 'Update failed', 'Could not save changes')
  }, [profile, username, push, refreshProfile])

  const handleNavigate = useCallback((s: ScreenName) => onNavigate(s), [onNavigate])

  if (!profile) {
    return (
      <ScreenShell title="Profile" icon={<User size={18} />} onBack={() => onNavigate('home')}>
        <SkeletonProfile />
      </ScreenShell>
    )
  }

  return (
    <>
      <ScreenShell title="Profile" subtitle={profile.username} icon={<User size={18} />} onBack={() => onNavigate('home')} actions={[{ icon: editing ? <Check size={18} /> : <Edit2 size={18} />, onClick: () => editing ? handleSave() : setEditing(true), label: editing ? 'Save' : 'Edit' }]}>
        <div className="space-y-5">
          {/* Profile header */}
          <div className="bg-gradient-to-br from-brand-50 to-accent-50/40 border border-brand-200 rounded-2xl p-5 text-center animate-fade-in">
            <div className="inline-block w-24 h-24 rounded-full mb-3 flex items-center justify-center text-3xl font-extrabold text-white" style={{ background: profile.avatar_color }}>
              {profile.username.charAt(0).toUpperCase()}
            </div>
            {editing ? (
              <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="input-field text-center" maxLength={20} />
                <button onClick={() => setEditing(false)} className="w-9 h-9 rounded-xl bg-surface-200 flex items-center justify-center text-ink-600 btn-press"><X size={16} /></button>
              </div>
            ) : (
              <p className="text-lg font-extrabold text-ink-900">{profile.username}</p>
            )}
            <p className="text-sm text-ink-400 mt-1">Level {levelInfo.level} Explorer</p>
            <div className="h-2.5 bg-surface-200 rounded-full overflow-hidden mt-3 max-w-xs mx-auto">
              <div className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500" style={{ width: levelInfo.pct + '%' }} />
            </div>
            <p className="text-xs text-ink-400 mt-1.5">{levelInfo.current} / {levelInfo.needed} XP</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-surface-200 rounded-xl p-3.5 flex items-center gap-3 shadow-card">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center"><Zap size={20} className="text-brand-500" /></div>
              <div><p className="text-lg font-extrabold text-ink-900">{profile.xp}</p><p className="text-xs text-ink-400">Total XP</p></div>
            </div>
            <div className="bg-white border border-surface-200 rounded-xl p-3.5 flex items-center gap-3 shadow-card">
              <div className="w-10 h-10 rounded-lg bg-accent-50 flex items-center justify-center"><Coins size={20} className="text-accent-500" /></div>
              <div><p className="text-lg font-extrabold text-ink-900">{profile.coins}</p><p className="text-xs text-ink-400">Coins</p></div>
            </div>
            <div className="bg-white border border-surface-200 rounded-xl p-3.5 flex items-center gap-3 shadow-card">
              <div className="w-10 h-10 rounded-lg bg-success-50 flex items-center justify-center"><Gem size={20} className="text-success-500" /></div>
              <div><p className="text-lg font-extrabold text-ink-900">{profile.gems}</p><p className="text-xs text-ink-400">Gems</p></div>
            </div>
            <div className="bg-white border border-surface-200 rounded-xl p-3.5 flex items-center gap-3 shadow-card">
              <div className="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center"><Flame size={20} className="text-warning-500" /></div>
              <div><p className="text-lg font-extrabold text-ink-900">{profile.walking_streak}</p><p className="text-xs text-ink-400">Day Streak</p></div>
            </div>
          </div>

          {/* Achievements */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="section-label mb-0">Achievements</p>
              <span className="text-xs font-bold text-ink-400">{unlockedAch.length} / {achievements?.length ?? 0}</span>
            </div>
            {achLoading && !achievements ? <SkeletonProfile /> : achievements && achievements.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((a, i) => {
                  const Icon = achievementIcons[a.icon] ?? Trophy
                  return (
                    <div key={a.id} className={'rounded-xl p-3.5 border-2 transition animate-fade-in ' + (a.unlocked ? 'bg-white border-brand-300 shadow-card' : 'bg-surface-50 border-surface-200')} style={{ animationDelay: String(i * 40) + 'ms' }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={'w-9 h-9 rounded-lg flex items-center justify-center ' + (a.unlocked ? 'bg-gradient-to-br from-brand-500 to-brand-600' : 'bg-surface-200')}>
                          <Icon size={16} className={a.unlocked ? 'text-white' : 'text-ink-400'} />
                        </div>
                        {a.unlocked && <Check size={14} className="text-success-500" />}
                      </div>
                      <p className="text-sm font-bold text-ink-900">{a.achievement_name}</p>
                      <p className="text-xs text-ink-400">{a.description}</p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <EmptyState icon={<Trophy size={28} />} title="No achievements yet" message="Complete adventures to unlock achievements" />
            )}
          </div>

          {/* Recent history */}
          <div>
            <p className="section-label">Recent Adventures</p>
            {histLoading && !history ? <SkeletonProfile /> : history && history.length > 0 ? (
              <div className="space-y-2">
                {history.slice(0, 5).map((h, i) => (
                  <div key={h.id} className="card-premium p-3 flex items-center gap-3 animate-fade-in" style={{ animationDelay: String(i * 40) + 'ms' }}>
                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center"><Trophy size={16} className="text-brand-500" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-ink-900 truncate">{h.adventure_name}</p>
                      <p className="text-xs text-ink-400">{h.location_name} - {formatDuration(h.duration)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-brand-600">+{h.xp_earned}</p>
                      <p className="text-[10px] text-ink-400">XP</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState icon={<Trophy size={28} />} title="No adventures yet" message="Complete your first adventure to see it here" actionLabel="Generate Adventure" onAction={() => onNavigate('generator')} />
            )}
          </div>
        </div>
      </ScreenShell>
      <BottomNav active="profile" onNavigate={handleNavigate} />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </>
  )
}

export const ProfileScreen = memo(ProfileScreenInner)
