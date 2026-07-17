import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar, BottomNav } from '../components/BottomNav';
import { GlassCard, Icon, Pill, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { CHALLENGES, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '../data';
import { vibrate } from '../lib/settings';

export function Challenges() {
  const { completedChallenges, recordChallengeComplete, addQuestProgress } = useStore();
  const { profile, updateProfile } = useAuth();

  async function handleComplete(challengeId: string) {
    const challenge = CHALLENGES.find(c => c.id === challengeId);
    if (!challenge || !profile || completedChallenges.includes(challengeId)) return;
    vibrate(30);
    recordChallengeComplete(challengeId);
    await updateProfile({
      xp: (profile.xp ?? 0) + challenge.xpReward,
      coins: (profile.coins ?? 0) + challenge.coinReward,
      completed_challenges: (profile.completed_challenges ?? 0) + 1,
    });
    addQuestProgress('combo', 1);
  }

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent="#fb923c" />
      <TopBar title="Challenges" showCurrencies />
      <div className="relative z-10 px-4 pt-3 space-y-3">
        {CHALLENGES.map(ch => {
          const isDone = completedChallenges.includes(ch.id);
          const diffColor = DIFFICULTY_COLORS[ch.difficulty];
          return (
            <GlassCard key={ch.id} className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center flex-shrink-0">
                  <Icon name={ch.icon} size={18} className="text-ember-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{ch.title}</p>
                  <p className="text-[10px] text-white/40">{ch.description}</p>
                </div>
                <Pill accent="text-white/60 border-white/10">
                  <span style={{ color: diffColor }}>{DIFFICULTY_LABELS[ch.difficulty]}</span>
                </Pill>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/30">+{ch.xpReward} XP</Pill>
                  <Pill icon="Coins" accent="text-gold-400 border-gold-500/30">+{ch.coinReward}</Pill>
                </div>
                {isDone ? (
                  <Button variant="ghost" disabled icon="Check">Completed</Button>
                ) : (
                  <Button size="sm" icon="Check" onClick={() => handleComplete(ch.id)}>Complete</Button>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>
      <BottomNav />
    </div>
  );
}
