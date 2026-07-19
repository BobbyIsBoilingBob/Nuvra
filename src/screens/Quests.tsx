import { useStore } from '../store';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Target, Trophy } from 'lucide-react';

const STATIC_QUESTS = [
  { id: 'q-daily-walk', title: 'Daily Walk', description: 'Walk at least 1 km today.', reward: { xp: 50, coins: 20 }, target: 1000 },
  { id: 'q-weekly-3', title: 'Weekly Explorer', description: 'Complete 3 adventures this week.', reward: { xp: 200, coins: 100 }, target: 3 },
  { id: 'q-monthly-10', title: 'Monthly Marathon', description: 'Walk 50 km this month.', reward: { xp: 500, coins: 300 }, target: 50000 },
];

export default function Quests() {
  const goBack = useStore((s) => s.goBack);
  const navigate = useStore((s) => s.navigate);

  return (
    <div>
      <Header title="Quests" onBack={goBack} />
      <div className="px-4 py-4 space-y-3">
        {STATIC_QUESTS.map((q) => (
          <Card key={q.id} onClick={() => navigate('questDetail')} className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center"><Target size={20} /></div>
            <div className="flex-1">
              <p className="font-semibold">{q.title}</p>
              <p className="text-sm text-ink-500">{q.description}</p>
              <p className="text-xs text-accent-600 mt-1"><Trophy size={12} className="inline" /> +{q.reward.xp} XP · +{q.reward.coins} coins</p>
            </div>
          </Card>
        ))}
        <Button variant="secondary" fullWidth onClick={() => navigate('challenges')}>View Challenges</Button>
      </div>
    </div>
  );
}
