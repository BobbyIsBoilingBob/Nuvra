import { useState } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Button, Pill, RewardPopup } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { CHALLENGES, DIFFICULTY_LABELS } from '../data';
import { vibrate } from '../lib/settings';

export function Challenges() {
  const { claimedChallenges, recordChallengeComplete } = useStore();
  const { profile, updateProfile } = useAuth();
  const [completed, setCompleted] = useState<string | null>(null);

  const handleComplete = async (challengeId: string) => {
    if (claimedChallenges.includes(challengeId) || !profile) return;
    const challenge = CHALLENGES.find(c => c.id === challengeId)!;
    vibrate([20, 40, 20]);
    await updateProfile({
      xp: profile.xp + challenge.xpReward,
      coins: profile.coins + challenge.coinReward,
      completed_challenges: profile.completed_challenges + 1,
      level: Math.floor(Math.sqrt((profile.xp + challenge.xpReward) / 100)) + 1
    });
    recordChallengeComplete(challengeId);
    setCompleted(challengeId);
  };

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent="#ff6b00" />
      <TopBar title="Challenges" showBack />
      <div className="relative z-10 px-4 pt-4 space-y-3">
        <GlassCard className="p-4 text-center animate-fade-in">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ember-400 to-ember-500 flex items-center justify-center mx-auto mb-2">
            <Icon name="Trophy" size={24} className="text-ink-950" />
          </div>
          <p className="text-xs text-white/40">Complete challenges to earn extra rewards</p>
        </GlassCard>

        {CHALLENGES.map(c => {
          const claimed = claimedChallenges.includes(c.id);
          return (
            <GlassCard key={c.id} className="p-4 animate-slide-up">
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${claimed ? 'bg-emerald-500/20' : 'glass'}`}>
                  <Icon name={c.icon} size={20} className={claimed ? 'text-emerald-400' : 'text-ember-400'} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-display font-bold text-white">{c.title}</h4>
                  <p className="text-[11px] text-white/40">{c.description}</p>
                </div>
                <Pill accent="text-white/40">{DIFFICULTY_LABELS[c.difficulty]}</Pill>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/20">+{c.xpReward}</Pill>
                  <Pill icon="Coins" accent="text-gold-300 border-gold-500/20">+{c.coinReward}</Pill>
                </div>
                <Button size="sm" variant={claimed ? 'ghost' : 'primary'} disabled={claimed} onClick={() => handleComplete(c.id)}>
                  {claimed ? 'Completed' : 'Complete'}
                </Button>
              </div>
            </GlassCard>
          );
        })}
      </div>

      <RewardPopup
        visible={completed !== null}
        onClose={() => setCompleted(null)}
        rewards={completed ? [
          { icon: 'Zap', label: 'XP', amount: CHALLENGES.find(c => c.id === completed)?.xpReward ?? 0, color: 'text-zeviqo-400' },
          { icon: 'Coins', label: 'Coins', amount: CHALLENGES.find(c => c.id === completed)?.coinReward ?? 0, color: 'text-gold-400' }
        ] : []}
      />
    </div>
  );
}
