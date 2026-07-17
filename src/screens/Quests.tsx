import { useState } from 'react';
import { GlassCard, Icon, Pill, Button, ProgressBar, EmptyState } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { DAILY_QUESTS, WEEKLY_QUESTS } from '../data';

export function Quests() {
  const { questProgress, completedQuests, claimQuest } = useStore();
  const [tab, setTab] = useState<'daily' | 'weekly'>('daily');
  const quests = tab === 'daily' ? DAILY_QUESTS : WEEKLY_QUESTS;

  const getProgress = (metric: string, target: number) => Math.min(questProgress[metric] || 0, target);
  const isCompleted = (questId: string) => completedQuests.includes(questId);
  const isClaimable = (questId: string, metric: string, target: number) => !isCompleted(questId) && getProgress(metric, target) >= target;

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#22c55e" />
      <div className="relative z-10">
        <TopBar title="Quests" />
        <div className="px-4 max-w-md mx-auto flex flex-col gap-4 pt-4">
          <div className="flex gap-2 p-1 glass rounded-2xl">
            <button onClick={() => setTab('daily')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab==='daily'?'bg-gradient-to-r from-zeviqo-400 to-zeviqo-500 text-ink-950':'text-white/50'}`}>Daily</button>
            <button onClick={() => setTab('weekly')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab==='weekly'?'bg-gradient-to-r from-zeviqo-400 to-zeviqo-500 text-ink-950':'text-white/50'}`}>Weekly</button>
          </div>
          <div className="flex flex-col gap-2">
            {quests.map(q => {
              const current = getProgress(q.metric, q.target);
              const completed = isCompleted(q.id);
              const claimable = isClaimable(q.id, q.metric, q.target);
              return (
                <GlassCard key={q.id} className={`p-4 ${completed ? 'opacity-50' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zeviqo-400/20 to-plasma-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon name={q.icon} size={18} className="text-zeviqo-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{q.title}</span>
                        {completed && <Icon name="CheckCircle" size={16} className="text-emerald-400" />}
                      </div>
                      <div className="text-xs text-white/50 mt-0.5">{q.description}</div>
                      <div className="mt-2">
                        <ProgressBar value={current} max={q.target} colorClass="from-emerald-400 to-zeviqo-500" />
                        <div className="flex justify-between mt-1 text-[10px] text-white/40">
                          <span>{current.toLocaleString()} / {q.target.toLocaleString()}</span>
                          <div className="flex gap-1.5">
                            <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/30">+{q.xpReward}</Pill>
                            <Pill icon="Coins" accent="text-gold-300 border-gold-500/30">+{q.coinReward}</Pill>
                          </div>
                        </div>
                      </div>
                      {claimable && <Button size="sm" variant="primary" fullWidth className="mt-2" icon="Gift" onClick={() => claimQuest(q.id)}>Claim Reward</Button>}
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
          {quests.length === 0 && <EmptyState icon="Target" title="No quests" desc="Check back later for new quests!" />}
        </div>
      </div>
    </div>
  );
}
