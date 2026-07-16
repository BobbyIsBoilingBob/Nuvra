import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import type { Challenge, Profile } from '../types'
import { addXpAndCoins, createNotification, logActivity, updateProfileStats, checkAchievements } from '../lib/gameService'
import { formatDistance } from '../lib/gps'

const CHALLENGE_TEMPLATES = [
  {
    type: 'daily_steps' as const,
    title: 'Daily Step Challenge',
    description: 'Walk 2,000 steps today',
    target: 2000,
    rewardXp: 40,
    rewardCoins: 60,
  },
  {
    type: 'daily_distance' as const,
    title: 'Daily Distance Challenge',
    description: 'Walk 1.5 km today',
    target: 1500,
    rewardXp: 50,
    rewardCoins: 80,
  },
  {
    type: 'weekly_adventures' as const,
    title: 'Weekly Adventurer',
    description: 'Complete 3 adventures this week',
    target: 3,
    rewardXp: 100,
    rewardCoins: 200,
  },
  {
    type: 'streak' as const,
    title: 'Streak Keeper',
    description: 'Maintain a 3-day walking streak',
    target: 3,
    rewardXp: 75,
    rewardCoins: 150,
  },
]

export function ChallengesPage() {
  const { user, profile, refreshProfile } = useAuthStore()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [rewardPopup, setRewardPopup] = useState<{ xp: number; coins: number; title: string } | null>(null)

  useEffect(() => {
    fetchChallenges()
  }, [])

  const fetchChallenges = async () => {
    if (!user) return
    setLoading(true)
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setChallenges(data as Challenge[])
    }
    setLoading(false)
  }

  const generateDailyChallenges = useCallback(async () => {
    if (!user) return

    // Check if user already has active challenges
    const { data: existing } = await supabase
      .from('challenges')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    if (existing) return

    // Pick 2 random challenges
    const shuffled = [...CHALLENGE_TEMPLATES].sort(() => Math.random() - 0.5)
    const selected = shuffled.slice(0, 2)

    const expiresAt = new Date()
    expiresAt.setHours(23, 59, 59, 999)

    const inserts = selected.map((tmpl) => ({
      user_id: user.id,
      type: tmpl.type,
      title: tmpl.title,
      description: tmpl.description,
      target: tmpl.target,
      progress: 0,
      status: 'active' as const,
      reward_xp: tmpl.rewardXp,
      reward_coins: tmpl.rewardCoins,
      expires_at: expiresAt.toISOString(),
    }))

    await supabase.from('challenges').insert(inserts)
    fetchChallenges()
  }, [user])

  useEffect(() => {
    if (user && challenges.length === 0 && !loading) {
      generateDailyChallenges()
    }
  }, [user, challenges.length, loading, generateDailyChallenges])

  const updateChallengeProgress = async (challengeId: string, newProgress: number) => {
    const challenge = challenges.find((c) => c.id === challengeId)
    if (!challenge || challenge.status !== 'active') return

    const progress = Math.min(newProgress, challenge.target)
    const isComplete = progress >= challenge.target

    await supabase
      .from('challenges')
      .update({
        progress,
        status: isComplete ? 'completed' : 'active',
        completed_at: isComplete ? new Date().toISOString() : null,
      })
      .eq('id', challengeId)

    if (isComplete) {
      // Award rewards
      const { profile: updatedProfile } = await addXpAndCoins(user!.id, challenge.reward_xp, challenge.reward_coins)

      const newCompletedCount = (profile?.completed_challenges || 0) + 1
      await updateProfileStats(user!.id, { completed_challenges: newCompletedCount })

      await createNotification(user!.id, 'challenge', 'Challenge Complete!', `${challenge.title}: +${challenge.reward_xp} XP, +${challenge.reward_coins} coins`)
      await logActivity(user!.id, 'challenge_completed', `Completed: ${challenge.title}`, { xp: challenge.reward_xp, coins: challenge.reward_coins })

      if (updatedProfile) {
        await checkAchievements(user!.id, {
          steps: updatedProfile.steps,
          distance_walked: updatedProfile.distance_walked,
          completed_adventures: updatedProfile.completed_adventures,
          treasure_collected: updatedProfile.treasure_collected,
          level: updatedProfile.level,
          coins: updatedProfile.coins,
          walking_streak: updatedProfile.walking_streak,
          friends: 0,
          completed_challenges: newCompletedCount,
        })
      }

      setRewardPopup({ xp: challenge.reward_xp, coins: challenge.reward_coins, title: challenge.title })
      refreshProfile()
    }

    fetchChallenges()
  }

  const getProgressFromProfile = (challenge: Challenge, profile: Profile | null): number => {
    if (!profile) return 0
    switch (challenge.type) {
      case 'daily_steps':
        return profile.steps
      case 'daily_distance':
        return profile.distance_walked
      case 'weekly_adventures':
        return profile.completed_adventures
      case 'streak':
        return profile.walking_streak
      default:
        return 0
    }
  }

  const activeChallenges = challenges.filter((c) => c.status === 'active')
  const completedChallenges = challenges.filter((c) => c.status === 'completed')

  return (
    <div className="h-full overflow-y-auto pb-4">
      <div className="px-4 py-4">
        <h1 className="text-2xl font-display font-bold text-neutral-900 mb-1">Challenges</h1>
        <p className="text-sm text-neutral-500 mb-4">Complete daily challenges for rewards</p>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="card p-4">
                <div className="shimmer-bg h-20 rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Active challenges */}
            <h2 className="text-sm font-semibold text-neutral-700 mb-2">Active</h2>
            {activeChallenges.length === 0 ? (
              <div className="card p-8 text-center mb-4">
                <div className="text-5xl mb-3">🎯</div>
                <p className="text-neutral-500 font-medium mb-1">No active challenges</p>
                <p className="text-sm text-neutral-400">New challenges generate automatically!</p>
              </div>
            ) : (
              <div className="space-y-3 mb-6">
                {activeChallenges.map((challenge) => {
                  const liveProgress = getProgressFromProfile(challenge, profile)
                  const displayProgress = Math.min(Math.max(challenge.progress, liveProgress), challenge.target)
                  const percent = (displayProgress / challenge.target) * 100
                  const isReady = displayProgress >= challenge.target

                  return (
                    <div key={challenge.id} className="card p-4 animate-fade-in">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-neutral-900">{challenge.title}</h3>
                          <p className="text-xs text-neutral-500 mt-0.5">{challenge.description}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <span className="badge bg-primary-50 text-primary-600">+{challenge.reward_xp} XP</span>
                          <span className="badge bg-accent-50 text-accent-600">+{challenge.reward_coins} 🪙</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-neutral-500 mb-1.5">
                          <span>
                            {challenge.type === 'daily_distance' ? formatDistance(displayProgress) :
                             challenge.type === 'daily_steps' ? `${Math.round(displayProgress)} steps` :
                             `${Math.round(displayProgress)}/${challenge.target}`}
                          </span>
                          <span>{Math.round(percent)}%</span>
                        </div>
                        <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isReady ? 'bg-success-500' : 'bg-primary-500'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {isReady && (
                        <button
                          onClick={() => updateChallengeProgress(challenge.id, displayProgress)}
                          className="btn-primary w-full mt-3 text-sm py-2.5"
                        >
                          Claim Reward!
                        </button>
                      )}

                      {challenge.expires_at && !isReady && (
                        <p className="text-xs text-neutral-400 mt-2">
                          ⏰ Expires {new Date(challenge.expires_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Completed challenges */}
            {completedChallenges.length > 0 && (
              <>
                <h2 className="text-sm font-semibold text-neutral-700 mb-2">Completed</h2>
                <div className="space-y-2">
                  {completedChallenges.map((challenge) => (
                    <div key={challenge.id} className="card p-3 opacity-75">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">✅</span>
                          <div>
                            <h3 className="font-medium text-neutral-700 text-sm">{challenge.title}</h3>
                            {challenge.completed_at && (
                              <p className="text-xs text-neutral-400">
                                {new Date(challenge.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <span className="badge bg-primary-50 text-primary-600">+{challenge.reward_xp}</span>
                          <span className="badge bg-accent-50 text-accent-600">+{challenge.reward_coins}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Reward popup */}
      {rewardPopup && (
        <div
          className="fixed inset-0 z-[3000] bg-black/60 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setRewardPopup(null)}
        >
          <div
            className="card w-full max-w-sm p-8 text-center animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-6xl mb-4 animate-bounce-soft">🎯</div>
            <h2 className="text-xl font-display font-extrabold text-neutral-900 mb-1">Challenge Complete!</h2>
            <p className="text-sm text-neutral-500 mb-4">{rewardPopup.title}</p>
            <div className="flex justify-center gap-4 mb-6">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-primary-600">+{rewardPopup.xp}</span>
                <span className="text-xs text-neutral-500">XP</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold text-accent-600">+{rewardPopup.coins}</span>
                <span className="text-xs text-neutral-500">Coins</span>
              </div>
            </div>
            <button onClick={() => setRewardPopup(null)} className="btn-primary w-full">
              Nice!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
