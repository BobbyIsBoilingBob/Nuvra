import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { useDailyRewards } from '../hooks/useDailyRewards';
import { DAILY_REWARDS } from '../data/gameData';
import { Gift, Check, Flame } from 'lucide-react';
import { useState } from 'react';

export default function DailyRewards() {
  const navigate = useStore((s) => s.navigate);
  const { isGuest } = useAuth();
  const { lastClaimDate, currentStreak, totalClaimed, loading, canClaim, claiming, claim, error } = useDailyRewards();
  const [claimError, setClaimError] = useState<string | null>(null);
  const [justClaimed, setJustClaimed] = useState<number | null>(null);

  if (isGuest) {
    return (
      <div className="pb-24"><Header title="Daily Rewards" />
        <div className="px-4 py-10 text-center"><Gift size={48} className="text-ink-500 mx-auto" /><p className="text-ink-300 mt-4">Sign in to claim daily rewards.</p><Button className="mt-4" onClick={() => navigate('auth')}>Sign In</Button></div>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const claimableDay = ((currentStreak % 7) + 1);

  const handleClaim = async (day: number) => {
    if (day !== claimableDay || !canClaim) return;
    setClaimError(null);
    const reward = DAILY_REWARDS.find((d) => d.day === day)?.reward ?? {};
    const res = await claim(reward);
    if (res.error) { setClaimError(res.error); return; }
    setJustClaimed(day);
    setTimeout(() => setJustClaimed(null), 2000);
  };

  return (
    <div className="pb-24"><Header title="Daily Rewards" />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        <Card className="p-4 flex items-center gap-3">
          <Flame size={24} className="text-accent-400" />
          <div className="flex-1">
            <p className="text-white font-semibold">Current Streak: {currentStreak} days</p>
            <p className="text-ink-400 text-xs">Total claimed: {totalClaimed}</p>
          </div>
          {lastClaimDate && <p className="text-ink-400 text-xs">Last: {lastClaimDate}</p>}
        </Card>

        {loading && <Spinner label="Loading rewards…" />}
        {error && <p className="text-error-400 text-sm">{error}</p>}
        {claimError && <p className="text-error-400 text-sm">{claimError}</p>}

        <div className="grid grid-cols-4 gap-3">
          {DAILY_REWARDS.map((d) => {
            const isClaimed = lastClaimDate && (
              (d.day <= (currentStreak % 7 || 7) && d.day !== claimableDay) ||
              (d.day === claimableDay && !canClaim)
            );
            const isClaimableNow = d.day === claimableDay && canClaim;
            return (
              <Card key={d.day} className={`p-3 text-center ${isClaimableNow ? 'border-brand-500/50 animate-pulse-glow' : ''} ${isClaimed ? 'opacity-50' : ''}`}>
                <p className="text-ink-400 text-xs">Day {d.day}</p>
                <Gift size={24} className={`mx-auto my-2 ${isClaimed ? 'text-ink-500' : 'text-accent-400'}`} />
                <p className="text-white text-xs font-medium">
                  {d.reward.coins ? `${d.reward.coins}c` : ''} {d.reward.xp ? `${d.reward.xp}xp` : ''}
                </p>
                {justClaimed === d.day ? (
                  <div className="mt-1 text-success-400 flex items-center justify-center"><Check size={14} /></div>
                ) : isClaimableNow ? (
                  <Button size="sm" className="mt-1 w-full text-xs py-1" onClick={() => handleClaim(d.day)} disabled={claiming}>
                    {claiming ? '…' : 'Claim'}
                  </Button>
                ) : (
                  <div className="mt-1 h-6 flex items-center justify-center">
                    {isClaimed && <Check size={14} className="text-ink-500" />}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {!canClaim && (
          <p className="text-center text-ink-400 text-sm">Come back tomorrow to claim your next reward!</p>
        )}
      </div>
    </div>
  );
}
