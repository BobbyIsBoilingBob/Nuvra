import { useStore } from '../store';
import { useDailyRewards } from '../hooks/useDailyRewards';
import { DAILY_REWARDS } from '../data/gameData';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { Gift, Check } from 'lucide-react';
import { useState } from 'react';

export default function DailyRewards() {
  const goBack = useStore((s) => s.goBack);
  const addXp = useStore((s) => s.addXp);
  const addCoins = useStore((s) => s.addCoins);
  const { streak, canClaim, claim, loading, error } = useDailyRewards();
  const [claiming, setClaiming] = useState(false);
  const dayIdx = Math.max(0, (streak - 1) % DAILY_REWARDS.length);
  const todayReward = canClaim ? DAILY_REWARDS[dayIdx] : null;
  const rewardLabel = todayReward ? `${todayReward.reward.coins ?? 0} coins${todayReward.reward.xp ? ` + ${todayReward.reward.xp} XP` : ''}${todayReward.reward.item ? ` + ${todayReward.reward.item}` : ''}` : 'Come back tomorrow!';

  async function handleClaim() {
    setClaiming(true);
    try {
      const r = await claim();
      if (r?.reward.coins) addCoins(r.reward.coins);
      if (r?.reward.xp) addXp(r.reward.xp);
    } catch { /* ignore */ } finally { setClaiming(false); }
  }

  if (loading) return (<div><Header title="Daily Rewards" onBack={goBack} /><div className="flex justify-center py-12"><Spinner /></div></div>);
  return (
    <div>
      <Header title="Daily Rewards" onBack={goBack} subtitle={`🔥 ${streak} day streak`} />
      <div className="px-4 py-4 space-y-4">
        {error && <p className="text-sm text-error-600">{error}</p>}
        <Card className="text-center py-8"><Gift size={48} className="mx-auto text-accent-500 mb-3" /><h2 className="text-xl font-bold">Day {streak + (canClaim ? 1 : 0)} Reward</h2><p className="text-ink-500 mt-1">{rewardLabel}</p>{todayReward && (<div className="flex items-center justify-center gap-3 mt-3 text-lg font-bold"><span className="text-accent-600">🪙 {todayReward.reward.coins ?? 0}</span>{todayReward.reward.xp && <span className="text-brand-600">⭐ {todayReward.reward.xp} XP</span>}</div>)}</Card>
        <Card><h3 className="font-semibold mb-3">7-Day Progress</h3><div className="grid grid-cols-7 gap-1">{Array.from({ length: 7 }).map((_, i) => { const day = i + 1; const claimed = day <= streak; const isToday = day === streak + 1 && canClaim; return (<div key={day} className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs ${claimed ? 'bg-success-100 text-success-700' : isToday ? 'bg-brand-100 text-brand-700 ring-2 ring-brand-300' : 'bg-ink-50 text-ink-400'}`}><span className="font-bold">D{day}</span>{claimed && <Check size={12} />}</div>); })}</div></Card>
        {canClaim ? <Button fullWidth onClick={handleClaim} disabled={claiming}>{claiming ? <Spinner size={18} className="mx-auto" /> : <><Gift size={18} className="inline mr-2" />Claim Today's Reward</>}</Button> : <p className="text-center text-sm text-ink-400">Come back tomorrow for your next reward!</p>}
      </div>
    </div>
  );
}
