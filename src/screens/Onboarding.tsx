import { useAuth } from '../lib/auth';
import { useStore } from '../store';
import { Card, Screen, Button, ProgressBar } from '../components/ui';
import { getLevelProgress } from '../data';
import { Compass, Map, Trophy, Footprints, Gem, Flame, Check } from 'lucide-react';

export default function Onboarding() {
  const { profile } = useAuth();
  const { setScreen } = useStore();
  if (!profile) return null;
  const levelInfo = getLevelProgress(profile.xp);

  const steps = [
    { icon: Compass, title: 'Explore Adventures', desc: 'Browse and start walking adventures', done: true },
    { icon: Map, title: 'Track Your Walk', desc: 'GPS tracks your route and distance', done: profile.distance_walked > 0 },
    { icon: Trophy, title: 'Complete Quests', desc: 'Earn XP and coins from daily quests', done: profile.completed_adventures > 0 },
    { icon: Footprints, title: 'Build Your Streak', desc: 'Walk every day to increase your streak', done: profile.walking_streak > 0 },
    { icon: Gem, title: 'Collect Cosmetics', desc: 'Buy trails, pets, and themes', done: false },
    { icon: Flame, title: 'Reach Level 25', desc: 'Become a Zeviqo Legend', done: profile.level >= 25 },
  ];

  const doneCount = steps.filter(s => s.done).length;

  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-2">Welcome to Zeviqo!</h1>
      <p className="text-ink-400 mb-4">Complete these steps to get started</p>

      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-semibold">Progress</span>
          <span className="text-ink-400 text-sm">{doneCount}/{steps.length}</span>
        </div>
        <ProgressBar value={doneCount} max={steps.length} color="#22c55e" />
      </Card>

      <div className="space-y-3">
        {steps.map((s, i) => (
          <Card key={i} className={`p-4 ${s.done ? 'border-green-500/30' : ''}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.done ? 'bg-green-500/10' : 'bg-ink-700/30'}`}>
                {s.done ? <Check size={20} color="#22c55e" /> : <s.icon size={20} color="#5a6a9a" />}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{s.title}</h3>
                <p className="text-ink-400 text-sm">{s.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button size="lg" className="w-full mt-4" onClick={() => setScreen('home')}>Get Started</Button>
    </Screen>
  );
}
