import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Gift, Trophy, Calendar, Target } from 'lucide-react';

export default function Rewards() {
  const goBack = useStore((s) => s.goBack);
  const navigate = useStore((s) => s.navigate);
  const { isGuest } = useAuth();
  const navigateToAuth = useStore((s) => s.navigateToAuth);
  const coins = useStore((s) => s.coins);
  const xp = useStore((s) => s.xp);
  const level = useStore((s) => s.level);

  const items = [
    { screen: 'dailyRewards', label: 'Daily Rewards', desc: 'Claim your daily streak reward', icon: Gift },
    { screen: 'challenges', label: 'Challenges', desc: 'Weekly and monthly goals', icon: Target },
    { screen: 'achievements', label: 'Achievements', desc: 'Unlock badges and trophies', icon: Trophy },
    { screen: 'seasonal', label: 'Seasonal Event', desc: 'Summer Walking Festival', icon: Calendar },
  ];

  return (
    <div>
      <Header title="Rewards" onBack={goBack} />
      <div className="px-4 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Card className="text-center"><p className="text-xs text-ink-500">Level</p><p className="text-2xl font-bold text-brand-600">{level}</p></Card>
          <Card className="text-center"><p className="text-xs text-ink-500">XP</p><p className="text-2xl font-bold text-brand-600">{xp}</p></Card>
          <Card className="text-center"><p className="text-xs text-ink-500">Coins</p><p className="text-2xl font-bold text-accent-600">🪙 {coins}</p></Card>
          <Card className="text-center"><p className="text-xs text-ink-500">Shop</p><Button size="sm" className="mt-1" onClick={() => navigate('shop')}>Visit</Button></Card>
        </div>

        {isGuest && (
          <Card className="bg-brand-50 border-brand-100">
            <p className="text-sm text-brand-800">Sign in to save your rewards and progress.</p>
            <Button size="sm" className="mt-2" onClick={() => navigateToAuth('rewards')}>Sign In</Button>
          </Card>
        )}

        <div className="space-y-2">
          {items.map(({ screen, label, desc, icon: Icon }) => (
            <Card key={label} onClick={() => navigate(screen as any)} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center"><Icon size={20} /></div>
              <div><p className="font-semibold">{label}</p><p className="text-xs text-ink-500">{desc}</p></div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
