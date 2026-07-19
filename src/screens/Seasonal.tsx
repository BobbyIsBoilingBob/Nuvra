import { useState } from 'react';
import { useStore } from '../store';
import { useSeasonal } from '../hooks/useSeasonal';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { Calendar, Trophy } from 'lucide-react';

export default function Seasonal() {
  const goBack = useStore((s) => s.goBack);
  const addXp = useStore((s) => s.addXp);
  const addCoins = useStore((s) => s.addCoins);
  const { progress, loading, claimReward } = useSeasonal();
  const [busy, setBusy] = useState(false);

  if (loading || !progress) return <div><Header title="Seasonal Event" onBack={goBack} /><div className="p-8 flex justify-center"><Spinner /></div></div>;

  const advPct = Math.min(100, Math.round((progress.adventuresCompleted / progress.targetAdventures) * 100));
  const distPct = Math.min(100, Math.round((progress.distanceWalked / progress.targetDistance) * 100));
  const complete = advPct >= 100 && distPct >= 100;

  async function doClaim() {
    setBusy(true);
    try {
      await claimReward();
      addXp(1000);
      addCoins(500);
    } catch { /* ignore */ } finally { setBusy(false); }
  }

  return (
    <div>
      <Header title="Seasonal Event" onBack={goBack} subtitle={progress.seasonName} />
      <div className="px-4 py-4 space-y-4">
        <Card className="bg-gradient-to-r from-brand-500 to-accent-500 text-white border-0">
          <Calendar size={28} />
          <p className="font-semibold mt-2">{progress.seasonName}</p>
          <p className="text-sm text-white/80">Complete adventures and walk distances to earn exclusive seasonal rewards.</p>
        </Card>

        <Card>
          <div className="flex justify-between text-sm mb-2"><span className="font-medium">Adventures</span><span className="text-ink-500">{progress.adventuresCompleted} / {progress.targetAdventures}</span></div>
          <div className="h-3 rounded-full bg-ink-100 overflow-hidden"><div className="h-full bg-brand-500" style={{ width: `${advPct}%` }} /></div>
          <p className="text-xs text-ink-400 mt-1">{advPct}%</p>
        </Card>

        <Card>
          <div className="flex justify-between text-sm mb-2"><span className="font-medium">Distance</span><span className="text-ink-500">{Math.round(progress.distanceWalked)} / {progress.targetDistance} m</span></div>
          <div className="h-3 rounded-full bg-ink-100 overflow-hidden"><div className="h-full bg-accent-500" style={{ width: `${distPct}%` }} /></div>
          <p className="text-xs text-ink-400 mt-1">{distPct}%</p>
        </Card>

        <Card className="bg-accent-50 border-accent-100">
          <div className="flex items-center gap-2 mb-1"><Trophy size={18} className="text-accent-600" /><p className="font-semibold">Reward</p></div>
          <p className="text-sm text-ink-600">Exclusive seasonal badge + 500 coins + 1000 XP</p>
        </Card>

        {progress.rewardClaimed ? (
          <Button fullWidth variant="success" disabled>Reward Claimed</Button>
        ) : (
          <Button fullWidth onClick={doClaim} disabled={!complete || busy}>
            {busy ? <Spinner size={18} className="mx-auto" /> : complete ? 'Claim Reward' : 'Complete goals to unlock'}
          </Button>
        )}
      </div>
    </div>
  );
}
