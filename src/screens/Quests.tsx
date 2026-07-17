import { useState } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Button, ProgressBar, Pill } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { DAILY_QUESTS, WEEKLY_QUESTS, type Quest } from '../data';

export function Quests() {
  const { questProgress, completedQuests, claimQuest } = useStore();
  const { profile, updateProfile } = useAuth();
  const [tab, setTab] = useState<'daily' | 'weekly'>('daily');
  const [claiming, setClaiming] = useState<string | null>(null);

  const quests = tab === 'daily' ? DAILY_QUESTS : WEEKLY_QUESTS;

  const getProgress = (q: Quest): number => {
    if (q.metric === 'distance') return questProgress.distance ?? 0;
    if (q.metric === 'steps') return questProgress.steps ?? 0;
    if (q.metric === 'adventures') return questProgress.adventures ?? 0;
    if (q.metric === 'treasures') return questProgress.treasures ?? 0;
    if (q.metric === 'challenges') return questProgress.challenges ?? 0;
    if (q.metric === 'streak') return profile?.walking_streak ?? 0;
    return 0;
  };

  const handleClaim = async (q: Quest) => {
    if (completedQuests.includes(q.id)) return;
    const progress = getProgress(q);
    if (progress < q.target) return;
    setClaiming(q.id);
    if (profile) {
      await updateProfile({
        xp: profile.xp + q.xpReward,
        coins: profile.coins + q.coinReward,
        level: Math.floor(Math.sqrt((profile.xp + q.xpReward) / 100)) + 1
      });
    }
    claimQuest(q.id);
    setClaiming(null);
  };

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg />
      <TopBar title="Quests" showBack />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        <div className="flex gap-1 p-1 glass rounded-2xl animate-fade-in">
          <button onClick={() => setTab('daily')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${tab==='daily'?'bg-zeviqo-500 text-ink-950':'text-white/50'}`}>Daily</button>
          <button onClick={() => setTab('weekly')} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${tab==='weekly'?'bg-zeviqo-500 text-ink-950':'text-white/50'}`}>Weekly</button>
        </div>

        <div className="space-y-3">
          {quests.map(q => {
            const progress = getProgress(q);
            const pct = Math.min(100, (progress / q.target) * 100);
            const done = progress >= q.target;
            const claimed = completedQuests.includes(q.id);
            return (
              <GlassCard key={q.id} className="p-4 animate-slide-up">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center"><Icon name={q.icon} size={18} className="text-zeviqo-400" /></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-display font-bold text-white">{q.title}</h4>
                    <p className="text-[11px] text-white/40">{q.description}</p>
                  </div>
                  {claimed && <Pill icon="Check" accent="text-emerald-300 border-emerald-500/20">Done</Pill>}
                </div>
                <div className="flex items-center justify-between text-[10px] text-white/40 mb-1">
                  <span>{Math.min(progress, q.target).toLocaleString()} / {q.target.toLocaleString()}</span>
                  <span>{Math.round(pct)}%</span>
                </div>
                <ProgressBar value={progress} max={q.target} />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/20">+{q.xpReward}</Pill>
                    <Pill icon="Coins" accent="text-gold-300 border-gold-500/20">+{q.coinReward}</Pill>
                  </div>
                  <Button size="sm" variant={done && !claimed ? 'primary' : 'ghost'} disabled={!done || claimed || claiming === q.id} onClick={() => handleClaim(q)}>
                    {claimed ? 'Claimed' : done ? 'Claim' : 'In Progress'}
                  </Button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
