import { useStore } from '../store';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Target, Trophy, Check } from 'lucide-react';

const QUEST = { id: 'q-daily-walk', title: 'Daily Walk', description: 'Walk at least 1 km today.', reward: { xp: 50, coins: 20 }, target: 1000, progress: 600 };

export default function QuestDetail() {
  const goBack = useStore((s) => s.goBack);
  const pct = Math.min(100, Math.round((QUEST.progress / QUEST.target) * 100));

  return (
    <div>
      <Header title={QUEST.title} onBack={goBack} />
      <div className="px-4 py-4 space-y-4">
        <Card>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center"><Target size={20} /></div>
            <div><p className="font-semibold">{QUEST.title}</p><p className="text-xs text-ink-500">Daily quest</p></div>
          </div>
          <p className="text-ink-700">{QUEST.description}</p>
        </Card>

        <Card>
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium">Progress</span>
            <span className="text-ink-500">{QUEST.progress} / {QUEST.target} m</span>
          </div>
          <div className="h-3 rounded-full bg-ink-100 overflow-hidden">
            <div className="h-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-ink-400 mt-1">{pct}% complete</p>
        </Card>

        <Card className="bg-accent-50 border-accent-100">
          <div className="flex items-center gap-2 mb-1"><Trophy size={18} className="text-accent-600" /><p className="font-semibold">Reward</p></div>
          <p className="text-sm text-ink-600">+{QUEST.reward.xp} XP · +{QUEST.reward.coins} coins</p>
        </Card>

        <Button fullWidth disabled={pct < 100}>
          {pct >= 100 ? <><Check size={18} className="inline mr-2" />Claim Reward</> : 'Keep walking to complete'}
        </Button>
      </div>
    </div>
  );
}
