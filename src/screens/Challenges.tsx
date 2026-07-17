import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Pill, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { CHALLENGES, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '../data';

export function Challenges() {
  const { completedChallenges, recordChallengeComplete, updateQuestProgress } = useStore();
  const { profile, updateProfile } = useAuth();

  function handleComplete(chId: string) {
    if (completedChallenges.includes(chId)) return;
    const ch = CHALLENGES.find(c => c.id === chId);
    if (!ch) return;
    recordChallengeComplete(chId);
    updateQuestProgress('challenges', 1);
    if (profile) updateProfile({ xp: profile.xp + ch.xpReward, coins: profile.coins + ch.coinReward, completed_challenges: profile.completed_challenges + 1 });
  }

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent="#fb923c" />
      <TopBar title="Challenges" showBack showCurrencies />
      <div className="relative z-10 px-4 pt-4 space-y-3">
        {CHALLENGES.map(ch => {
          const done = completedChallenges.includes(ch.id);
          return (
            <GlassCard key={ch.id} className={`p-4 ${done ? 'border-emerald-500/20' : ''}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${done ? 'bg-emerald-500/20' : 'bg-ember-500/20'}`}><Icon name={ch.icon} size={22} className={done ? 'text-emerald-400' : 'text-ember-400'} /></div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-white">{ch.title}</p>
                  <p className="text-[11px] text-white/50">{ch.description}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Pill accent="text-white/50 border-white/10">{DIFFICULTY_LABELS[ch.difficulty]}</Pill>
                    <Pill icon="Zap" accent="text-gold-300 border-gold-500/30">+{ch.xpReward}</Pill>
                    <Pill icon="Coins" accent="text-gold-300 border-gold-500/30">+{ch.coinReward}</Pill>
                  </div>
                </div>
                {done ? <Pill accent="text-emerald-300 border-emerald-500/30">Done</Pill> : <Button size="sm" onClick={() => handleComplete(ch.id)}>Complete</Button>}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
