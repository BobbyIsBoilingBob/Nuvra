import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { useSeasonal } from '../hooks/useSeasonal';
import { Sparkles, Snowflake, Trophy, Check, MapPin, Target } from 'lucide-react';
import { useState } from 'react';

function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

export default function Seasonal() {
  const navigate = useStore((s) => s.navigate);
  const { isGuest } = useAuth();
  const { progress, loading, error, claiming, claimReward } = useSeasonal();
  const [claimError, setClaimError] = useState<string | null>(null);
  const [justClaimed, setJustClaimed] = useState(false);

  if (isGuest) {
    return (
      <div className="pb-24"><Header title="Seasonal" />
        <div className="px-4 py-10 text-center"><Snowflake size={48} className="text-ink-500 mx-auto" /><p className="text-ink-300 mt-4">Sign in to join seasonal events.</p><Button className="mt-4" onClick={() => navigate('auth')}>Sign In</Button></div>
      </div>
    );
  }

  if (loading) return <div className="pb-24"><Header title="Seasonal" /><Spinner label="Loading seasonal progress…" /></div>;

  if (!progress) {
    return <div className="pb-24"><Header title="Seasonal" /><p className="text-ink-400 text-sm text-center py-8">Unable to load seasonal progress.</p></div>;
  }

  const advPct = Math.min((progress.adventuresCompleted / progress.targetAdventures) * 100, 100);
  const distPct = Math.min((progress.distanceWalked / progress.targetDistance) * 100, 100);
  const allComplete = progress.adventuresCompleted >= progress.targetAdventures && progress.distanceWalked >= progress.targetDistance;

  const handleClaim = async () => {
    setClaimError(null);
    const res = await claimReward();
    if (res.error) { setClaimError(res.error); return; }
    setJustClaimed(true);
    setTimeout(() => setJustClaimed(false), 3000);
  };

  return (
    <div className="pb-24"><Header title="Seasonal" />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {error && <p className="text-error-400 text-sm">{error}</p>}
        {claimError && <p className="text-error-400 text-sm">{claimError}</p>}

        <Card className="p-5 text-center">
          <div className="h-16 w-16 rounded-2xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center mx-auto mb-3">
            <Sparkles size={32} className="text-brand-300" />
          </div>
          <h2 className="font-display text-xl font-bold text-white">{progress.seasonName}</h2>
          <p className="text-ink-400 text-sm mt-1">Complete {progress.targetAdventures} adventures and walk {formatDistance(progress.targetDistance)} to earn exclusive rewards!</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target size={18} className="text-brand-400" />
            <p className="text-white font-medium">Adventures Completed</p>
          </div>
          <div className="h-2 rounded-full bg-ink-700 overflow-hidden">
            <div className="h-full bg-brand-400 transition-all" style={{ width: `${advPct}%` }} />
          </div>
          <p className="text-ink-300 text-sm mt-1">{progress.adventuresCompleted} / {progress.targetAdventures}</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={18} className="text-brand-400" />
            <p className="text-white font-medium">Distance Walked</p>
          </div>
          <div className="h-2 rounded-full bg-ink-700 overflow-hidden">
            <div className="h-full bg-brand-400 transition-all" style={{ width: `${distPct}%` }} />
          </div>
          <p className="text-ink-300 text-sm mt-1">{formatDistance(progress.distanceWalked)} / {formatDistance(progress.targetDistance)}</p>
        </Card>

        <Card className={`p-5 text-center ${progress.rewardClaimed ? 'border-success-500/40' : allComplete ? 'border-accent-500/40 animate-pulse-glow' : ''}`}>
          <Trophy size={32} className={progress.rewardClaimed ? 'text-success-400 mx-auto' : 'text-accent-400 mx-auto'} />
          <p className="text-white font-semibold mt-2">Seasonal Reward</p>
          <p className="text-ink-400 text-sm mt-1">500 XP + 1000 coins</p>
          {progress.rewardClaimed ? (
            <div className="mt-3 text-success-400 flex items-center justify-center gap-1"><Check size={18} /> Reward claimed!</div>
          ) : justClaimed ? (
            <div className="mt-3 text-success-400 flex items-center justify-center gap-1"><Check size={18} /> Claimed!</div>
          ) : allComplete ? (
            <Button className="mt-4" onClick={handleClaim} disabled={claiming}>{claiming ? <Spinner /> : 'Claim Reward'}</Button>
          ) : (
            <p className="text-ink-400 text-sm mt-3">Complete all goals to unlock the reward.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
