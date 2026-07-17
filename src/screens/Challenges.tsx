import { useState } from 'react';
import { Icon, GlassCard, Pill, Button, RewardPopup } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { CHALLENGES } from '../data';

export function Challenges(): React.ReactElement {
  const { recordChallengeComplete } = useStore();
  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState<Array<{ icon: string; label: string; amount: number; color: string }>>([]);

  const handleComplete = (id: string, xp: number, coins: number) => {
    recordChallengeComplete(id, xp, coins);
    setRewardData([
      { icon: 'Zap', label: 'XP', amount: xp, color: 'text-zeviqo-300' },
      { icon: 'Coins', label: 'Coins', amount: coins, color: 'text-gold-300' },
    ]);
    setShowReward(true);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#ff6b00" />
      <RewardPopup rewards={rewardData} visible={showReward} onClose={() => setShowReward(false)} />
      <div className="relative z-10">
        <TopBar showBack title="Challenges" showCurrencies />
        <div className="px-4 max-w-md mx-auto flex flex-col gap-3">
          <p className="text-xs text-white/40 text-center">Complete challenges during your adventures for bonus rewards!</p>
          {CHALLENGES.map(c => (
            <GlassCard key={c.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ember-400 to-gold-500 flex items-center justify-center flex-shrink-0"><Icon name={c.icon} size={22} className="text-ink-950" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><span className="text-sm font-black text-white">{c.title}</span><Pill accent="text-ember-300 border-ember-500/30">{c.difficulty}</Pill></div>
                  <div className="text-xs text-white/50 mt-0.5">{c.description}</div>
                  <div className="flex items-center gap-2 mt-2"><Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/30">+{c.xpReward} XP</Pill><Pill icon="Coins" accent="text-gold-300 border-gold-500/30">+{c.coinReward}</Pill></div>
                </div>
              </div>
              <Button variant="secondary" size="sm" fullWidth className="mt-3" icon="Check" onClick={() => handleComplete(c.id, c.xpReward, c.coinReward)}>Mark Complete</Button>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
}
