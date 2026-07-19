import { useState } from 'react';
import { useStore } from '../store';
import { useDailyRewards } from '../hooks/useDailyRewards';
import { DAILY_REWARDS } from '../data/gameData';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { Check, Flame } from 'lucide-react';

export default function DailyRewards() {
  const goBack = useStore((s) => s.goBack);
  const addXp = useStore((s) => s.addXp);
  const addCoins = useStore((s) => s.addCoins);
  const { streak, canClaim, loading, claim } = useDailyRewards();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justClaimed, setJustClaimed] = useState(false);

  async function doClaim() {
    setBusy(true); setError(null);
    try {
      const reward = await claim();
      if (reward.reward.coins) addCoins(reward.reward.coins);
      if (reward.reward.xp) addXp(reward.reward.xp);
      setJustClaimed(true);
    } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  if (loading) return <div><Header title="Daily Rewards" onBack={goBack} /><div className="p-8 flex justify-center"><Spinner /></div></div>;

  return (
    <div>
      <Header title="Daily Rewards" onBack={goBack} subtitle={`🔥 ${streak} day streak`} />
      <div className="px-4 py-4 space-y-4">
        <Card className="flex items-center gap-3 bg-gradient-to-r from-accent-500 to-brand-500 text-white border-0">
          <Flame size={28} />
          <div><p className="font-semibold">Current Streak: {streak} days</p><p className="text-sm text-white/80">Come back daily to keep your streak!</p></div>
        </Card>

        <div className="grid grid-cols-4 gap-2">
          {DAILY_REWARDS.map((d) => {
            const claimed = d.day < streak || (d.day === streak && !canClaim) || justClaimed;
            const isToday = d.day === streak + (canClaim ? 1 : 0) || (d.day === streak && canClaim);
            return (
              <Card key={d.day} className={`text-center ${claimed ? 'bg-success-50 border-success-100' : isToday ? 'ring-2 ring-brand-500' : ''}`}>
                <p className="text-xs text-ink-400">Day {d.day}</p>
                <p className="text-2xl my-1">{d.reward.item ? '🎁' : '🪙'}</p>
                <p className="text-xs font-medium">{d.reward.coins}🪙</p>
                {d.reward.xp && <p className="text-xs text-brand-600">+{d.reward.xp}xp</p>}
                {claimed && <Check size={14} className="mx-auto text-success-600 mt-1" />}
              </Card>
            );
          })}
        </div>

        {error && <p className="text-sm text-error-600">{error}</p>}

        <Button fullWidth onClick={doClaim} disabled={!canClaim || busy || justClaimed}>
          {busy ? <Spinner size={18} className="mx-auto" /> : justClaimed ? 'Claimed!' : canClaim ? "Claim Today's Reward" : 'Already Claimed Today'}
        </Button>
      </div>
    </div>
  );
}
