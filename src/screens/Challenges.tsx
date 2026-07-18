import { useStore } from '../store';
import { CHALLENGES } from '../data';
import { Card, Screen, Badge, Button } from '../components/ui';
import { getIcon } from '../components/ui';
import { Check, Zap } from 'lucide-react';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '../data';

export default function Challenges() {
  const { completedChallenges, recordChallengeComplete, setScreen } = useStore();

  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4">Challenges</h1>
      <div className="space-y-3">
        {CHALLENGES.map(c => {
          const done = completedChallenges.includes(c.id);
          const Icon = getIcon(c.icon);
          return (
            <Card key={c.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-ember-500/10 flex items-center justify-center">
                  <Icon size={20} color="#fb923c" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{c.title}</h3>
                  <p className="text-ink-400 text-sm">{c.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge color={DIFFICULTY_COLORS[c.difficulty]}>{DIFFICULTY_LABELS[c.difficulty]}</Badge>
                    <Badge color="#00c4ff"><Zap size={10} className="inline" /> {c.xpReward} XP</Badge>
                  </div>
                </div>
                {done ? (
                  <Check size={24} color="#22c55e" />
                ) : (
                  <Button size="sm" variant="gold" onClick={() => recordChallengeComplete(c.id)}>Complete</Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      <Button variant="ghost" className="w-full mt-4" onClick={() => setScreen('home')}>Back to Home</Button>
    </Screen>
  );
}
