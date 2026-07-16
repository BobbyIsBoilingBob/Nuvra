import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { xpProgressPercent, xpProgressInLevel, xpForLevel, AVATAR_OPTIONS } from '../lib/gameData'
import { formatDistance } from '../lib/gps'
import type { Achievement, ActivityLog } from '../types'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, profile, signOut, refreshProfile } = useAuthStore()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [editingAvatar, setEditingAvatar] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [username, setUsername] = useState(profile?.username || '')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    setUsername(profile?.username || '')
  }, [profile])

  const fetchData = async () => {
    if (!user) return

    const [achRes, actRes] = await Promise.all([
      supabase.from('achievements').select('*').eq('user_id', user.id).order('unlocked_at', { ascending: false }),
      supabase.from('activity_log').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
    ])

    if (achRes.data) setAchievements(achRes.data as Achievement[])
    if (actRes.data) setActivities(actRes.data as ActivityLog[])
  }

  const saveAvatar = async (emoji: string, color: string) => {
    if (!user) return
    await supabase.from('profiles').update({ avatar_emoji: emoji, avatar_color: color }).eq('id', user.id)
    setEditingAvatar(false)
    refreshProfile()
  }

  const saveUsername = async () => {
    if (!user || !username.trim()) return
    const { error } = await supabase.from('profiles').update({ username: username.trim() }).eq('id', user.id)
    if (error) {
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        alert('That username is already taken. Please choose another.')
      } else {
        alert('Failed to update username.')
      }
      return
    }
    setEditingName(false)
    refreshProfile()
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  if (!profile) return null

  const stats = [
    { label: 'Distance Walked', value: formatDistance(profile.distance_walked), icon: '📏' },
    { label: 'Steps', value: profile.steps.toLocaleString(), icon: '👣' },
    { label: 'Adventures', value: profile.completed_adventures, icon: '🗺️' },
    { label: 'Challenges', value: profile.completed_challenges, icon: '🎯' },
    { label: 'Treasures', value: profile.treasure_collected, icon: '💎' },
    { label: 'Streak', value: `${profile.walking_streak} days`, icon: '🔥' },
    { label: 'Achievements', value: achievements.length, icon: '🏆' },
    { label: 'Exploration', value: `${Math.round(profile.exploration_percentage)}%`, icon: '🧭' },
  ]

  return (
    <div className="h-full overflow-y-auto pb-4">
      <div className="px-4 py-4">
        {/* Profile header */}
        <div className="card p-6 mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setEditingAvatar(true)}
              className="relative w-20 h-20 rounded-3xl flex items-center justify-center text-4xl shadow-md transition-transform hover:scale-105"
              style={{ backgroundColor: profile.avatar_color }}
            >
              {profile.avatar_emoji}
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-neutral-200 flex items-center justify-center text-xs">
                ✏️
              </span>
            </button>

            <div className="flex-1">
              {editingName ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input py-2 text-sm"
                    maxLength={20}
                    autoFocus
                  />
                  <button onClick={saveUsername} className="btn-primary py-2 px-3 text-sm">Save</button>
                </div>
              ) : (
                <div>
                  <h1 className="text-xl font-display font-bold text-neutral-900 flex items-center gap-2">
                    {profile.username}
                    <button onClick={() => setEditingName(true)} className="text-neutral-400 hover:text-neutral-600 text-sm">
                      ✏️
                    </button>
                  </h1>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* XP bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-semibold text-neutral-700">Level {profile.level}</span>
              <span className="text-xs text-neutral-500">
                {xpProgressInLevel(profile.xp)} / {xpForLevel(profile.level)} XP
              </span>
            </div>
            <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                style={{ width: `${xpProgressPercent(profile.xp)}%` }}
              />
            </div>
          </div>

          {/* Coins */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-2xl">🪙</span>
            <span className="text-lg font-bold text-neutral-900">{profile.coins.toLocaleString()}</span>
            <span className="text-sm text-neutral-500">coins</span>
          </div>
        </div>

        {/* Stats grid */}
        <h2 className="text-sm font-semibold text-neutral-700 mb-2">Statistics</h2>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {stats.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="text-lg font-bold text-neutral-900">{stat.value}</p>
                  <p className="text-xs text-neutral-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <h2 className="text-sm font-semibold text-neutral-700 mb-2">Achievements ({achievements.length})</h2>
        {achievements.length === 0 ? (
          <div className="card p-6 text-center mb-4">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-sm text-neutral-500">No achievements yet. Keep exploring!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 mb-5">
            {achievements.map((ach) => (
              <div key={ach.id} className="card p-3 text-center animate-fade-in">
                <span className="text-3xl block mb-1">{ach.icon}</span>
                <p className="text-xs font-semibold text-neutral-900">{ach.achievement_name}</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">{ach.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Activity feed */}
        <h2 className="text-sm font-semibold text-neutral-700 mb-2">Recent Activity</h2>
        {activities.length === 0 ? (
          <div className="card p-6 text-center mb-4">
            <div className="text-4xl mb-2">📊</div>
            <p className="text-sm text-neutral-500">No activity yet. Start exploring!</p>
          </div>
        ) : (
          <div className="space-y-2 mb-5">
            {activities.map((act) => (
              <div key={act.id} className="card p-3 flex items-center gap-3 animate-fade-in">
                <span className="text-xl">
                  {act.activity_type === 'adventure_completed' ? '🗺️' :
                   act.activity_type === 'challenge_completed' ? '🎯' :
                   act.activity_type === 'achievement_unlocked' ? '🏆' :
                   act.activity_type === 'level_up' ? '⭐' :
                   act.activity_type === 'friend_added' ? '🤝' :
                   act.activity_type === 'treasure_found' ? '💎' : '📊'}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">{act.description}</p>
                  <p className="text-xs text-neutral-400">
                    {new Date(act.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sign out */}
        <button onClick={handleSignOut} className="btn w-full bg-error-50 text-error-700 hover:bg-error-100 border border-error-200 mt-4">
          Sign Out
        </button>
      </div>

      {/* Avatar picker modal */}
      {editingAvatar && (
        <div className="fixed inset-0 z-[3000] bg-black/50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setEditingAvatar(false)}>
          <div className="card w-full max-w-sm p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-display font-bold text-neutral-900 mb-4">Choose Avatar</h2>
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  key={`${opt.emoji}-${opt.color}`}
                  onClick={() => saveAvatar(opt.emoji, opt.color)}
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all hover:scale-110 ${
                    profile.avatar_emoji === opt.emoji && profile.avatar_color === opt.color
                      ? 'ring-4 ring-primary-400'
                      : ''
                  }`}
                  style={{ backgroundColor: opt.color }}
                >
                  {opt.emoji}
                </button>
              ))}
            </div>
            <button onClick={() => setEditingAvatar(false)} className="btn-ghost w-full mt-4">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
