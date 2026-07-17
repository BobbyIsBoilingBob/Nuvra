import { useState } from 'react';
import { Icon, GlassCard, Pill, Button, ProgressBar, RewardPopup } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { DAILY_QUESTS, WEEKLY_QUESTS, type Quest, type QuestType } from '../data';

export function Quests(): React.ReactElement {
  const { stats, walkingStreak, questProgress, claimQuest, addXp, addCoins, addGems } = useStore();
  const [tab, setTab] = useState<QuestType>('daily');
  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState<Array<{ icon: string; label: string; amount: number; color: string }>>([]);

  const quests = tab === 'daily' ? DAILY_QUESTS : WEEKLY_QUESTS;

  const getQuestProgress = (q: Quest): number => {
    const qp = questProgress.find(p => p.questId === q.id);
    if (qp) return qp.progress;
    switch (q.category) {
      case 'distance': return stats.totalDistance;
      case 'adventures': return stats.totalAdventures;
      case 'coins': return stats.totalCoinsEarned;
      case 'xp': return stats.totalXpEarned;
      case 'streak': return walkingStreak;
      case 'challenges': return stats.totalChallenges;
      case 'friends': return stats.friendsAdded;
      case 'multiplayer': return stats.multiplayerAdventures;
      default: return 0;
    }
  };

  const handleClaim = (q: Quest) => {
    const progress = getQuestProgress(q);
    if (progress < q.target) return;
    const qp = questProgress.find(p => p.questId === q.id);
    if (qp?.claimed) return;
    claimQuest(q.id);
    if (q.xpReward > 0) addXp(q.xpReward);
    if (q.coinReward > 0) addCoins(q.coinReward);
    if (q.gemReward > 0) addGems(q.gemReward);
    setRewardData([
      ...(q.xpReward > 0 ? [{ icon: 'Zap', label: 'XP', amount: q.xpReward, color: 'text-nova-300' }] : []),
      ...(q.coinReward > 0 ? [{ icon: 'Coins', label: 'Coins', amount: q.coinReward, color: 'text-gold-300' }] : []),
      ...(q.gemReward > 0 ? [{ icon: 'Gem', label: 'Gems', amount: q.gemReward, color: 'text-plasma-400' }] : []),
    ]);
    setShowReward(true);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#7a33ff" />
      <RewardPopup rewards={rewardData} visible={showReward} onClose={() => setShowReward(false)} />
      <div className="relative z-10">
        <TopBar title="Quests" showCurrencies />
        <div className="px-4 max-w-md mx-auto flex flex-col gap-4">
          <div className="flex gap-2 p-1 glass rounded-2xl">
            {(['daily','weekly'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 rounded-xl text-sm font-bold capitalize transition-all ${tab===t?'bg-gradient-to-r from-plasma-400 to-nova-500 text-ink-950':'text-white/50'}`}>{t} Quests</button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {quests.map(q => {
              const progress = getQuestProgress(q);
              const pct = Math.min(100, (progress / q.target) * 100);
              const isComplete = progress >= q.target;
              const qp = questProgress.find(p => p.questId === q.id);
              const claimed = qp?.claimed ?? false;
              const canClaim = isComplete && !claimed;
              return (
                <GlassCard key={q.id} className={`p-4 ${claimed?'opacity-50':''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isComplete?'bg-gradient-to-br from-nova-400 to-cyan-300':'glass'}`}>
                      <Icon name={q.icon} size={18} className={isComplete?'text-ink-950':'text-white/60'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{q.title}</span>
                        {isComplete && !claimed && <Pill icon="Check" accent="text-nova-300 border-nova-500/30">Ready!</Pill>}
                        {claimed && <Pill icon="Check" accent="text-white/40 border-white/10">Claimed</Pill>}
                      </div>
                      <div className="text-xs text-white/40 mt-0.5">{q.description}</div>
                      <div className="mt-2">
                        <ProgressBar value={pct} accent={isComplete?'from-nova-400 to-cyan-300':'from-plasma-400 to-nova-500'} height={6} showShimmer={false} />
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-white/40">{Math.min(progress, q.target).toLocaleString()}/{q.target.toLocaleString()}{q.unit}</span>
                          <div className="flex items-center gap-1.5">
                            {q.xpReward > 0 && <span className="text-[10px] text-nova-300 font-bold">+{q.xpReward} XP</span>}
                            {q.coinReward > 0 && <span className="text-[10px] text-gold-300 font-bold">+{q.coinReward}</span>}
                            {q.gemReward > 0 && <span className="text-[10px] text-plasma-400 font-bold">+{q.gemReward}💎</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {canClaim && <Button variant="primary" size="sm" fullWidth className="mt-3" icon="Gift" onClick={() => handleClaim(q)}>Claim Reward</Button>}
                </GlassCard>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
