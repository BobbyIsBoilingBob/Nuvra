import { useStore } from '../store';
import { QUESTS } from '../data';
import { Card, Screen, ProgressBar, Button, Badge, getIcon } from '../components/ui';
import { Zap, Coins, Check, Lock } from 'lucide-react';

export default function Quests() {
  const { questProgress, claimedQuests, claimQuest, setScreen } = useStore();
  const categories = ['daily', 'weekly', 'story'] as const;

  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4">Quests</h1>
      {categories.map(cat => {
        const quests = QUESTS.filter(q => q.category === cat);
        if (quests.length === 0) return null;
        return (
          <div key={cat} className="mb-6">
            <h2 className="text-ink-400 text-sm font-semibold uppercase mb-3">{cat}</h2>
            <div className="space-y-3">
              {quests.map(q => {
                const progress = questProgress[q.metric] ?? 0;
                const complete = progress >= q.target;
                const claimed = claimedQuests.includes(q.id);
                const Icon = getIcon(q.icon);
                return (
                  <Card key={q.id} className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-zeviqo-500/10 flex items-center justify-center"><Icon size={20} color="#00c4ff" /></div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{q.title}</h3>
                        <p className="text-ink-400 text-sm">{q.description}</p>
                      </div>
                      <div className="flex gap-1">
                        <Badge color="#00c4ff"><Zap size={10} className="inline" /> {q.reward.xp}</Badge>
                        <Badge color="#fbbf24"><Coins size={10} className="inline" /> {q.reward.coins}</Badge>
                      </div>
                    </div>
                    <ProgressBar value={progress} max={q.target} color={complete ? '#22c55e' : '#00c4ff'} />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-ink-400 text-xs">{Math.min(progress, q.target)} / {q.target}</span>
                      {claimed ? <span className="text-ink-500 text-xs flex items-center gap-1"><Check size={14} /> Claimed</span>
                        : complete ? <Button size="sm" variant="gold" onClick={() => claimQuest(q.id)}>Claim</Button>
                        : <span className="text-ink-500 text-xs flex items-center gap-1"><Lock size={14} /> In progress</span>}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
      <Button variant="ghost" className="w-full" onClick={() => setScreen('achievements')}>View Achievements</Button>
    </Screen>
  );
}
