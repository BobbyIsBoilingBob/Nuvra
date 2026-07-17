import { useState } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar, BottomNav } from '../components/BottomNav';
import { GlassCard, Icon, Pill, Button, ProgressBar, SectionTitle } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { QUESTS } from '../data';

export function Quests() {
  const { questProgress, claimedQuests, claimQuest, addQuestProgress } = useStore();
  const { profile, updateProfile } = useAuth();
  const [tab, setTab] = useState<'daily' | 'weekly'>('daily');

  const quests = QUESTS.filter(q => q.category === tab);

  async function handleClaim(questId: string) {
    const quest = QUESTS.find(q => q.id === questId);
    if (!quest || !profile) return;
    claimQuest(questId);
    await updateProfile({
      xp: (profile.xp ?? 0) + quest.reward.xp,
      coins: (profile.coins ?? 0) + quest.reward.coins,
    });
  }

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg />
      <TopBar title="Quests" showCurrencies />
      <div className="relative z-10 px-4 pt-3 space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setTab('daily')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${tab === 'daily' ? 'bg-gradient-to-r from-zeviqo-400 to-zeviqo-500 text-ink-950' : 'glass text-white/60'}`}
          >
            Daily
          </button>
          <button
            onClick={() => setTab('weekly')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${tab === 'weekly' ? 'bg-gradient-to-r from-zeviqo-400 to-zeviqo-500 text-ink-950' : 'glass text-white/60'}`}
          >
            Weekly
          </button>
        </div>

        <div className="space-y-3">
          {quests.map(quest => {
            const progress = questProgress[quest.metric] ?? 0;
            const pct = Math.min(100, (progress / quest.target) * 100);
            const isComplete = progress >= quest.target;
            const isClaimed = claimedQuests.includes(quest.id);
            return (
              <GlassCard key={quest.id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center flex-shrink-0">
                    <Icon name={quest.icon} size={18} className="text-zeviqo-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">{quest.title}</p>
                    <p className="text-[10px] text-white/40">{quest.description}</p>
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/30">+{quest.reward.xp}</Pill>
                    <Pill icon="Coins" accent="text-gold-400 border-gold-500/30">+{quest.reward.coins}</Pill>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <ProgressBar value={progress} max={quest.target} className="flex-1" />
                  <span className="text-[10px] text-white/40 font-bold whitespace-nowrap">{Math.floor(progress)}/{quest.target}</span>
                </div>
                {isClaimed ? (
                  <Button variant="ghost" fullWidth disabled icon="Check">Claimed</Button>
                ) : isComplete ? (
                  <Button variant="gold" fullWidth icon="Gift" onClick={() => handleClaim(quest.id)}>Claim Reward</Button>
                ) : (
                  <Button variant="secondary" fullWidth disabled>In Progress</Button>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
