import { useStore } from '../store';
import { useSeasonal } from '../hooks/useSeasonal';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { Sparkles, Lock } from 'lucide-react';

const SEASON_TIERS = [
  { level: 1, reward: '100 coins', icon: '🪙' },
  { level: 3, reward: 'XP Booster', icon: '⚡' },
  { level: 5, reward: 'Trail Badge', icon: '🏅' },
  { level: 10, reward: 'Golden Avatar Frame', icon: '🖼️' },
  { level: 15, reward: 'Exclusive Season Cosmetic', icon: '✨' },
];

export default function Seasonal() {
  const goBack = useStore((s) => s.goBack);
  const navigate = useStore((s) => s.navigate);
  const level = useStore((s) => s.level);
  const { progress, loading, error, claimReward } = useSeasonal();
  if (loading) return (<div><Header title="Seasonal" onBack={goBack} /><div className="flex justify-center py-12"><Spinner /></div></div>);
  const seasonName = progress?.seasonName ?? 'Summer 2026';
  const completed = progress?.adventuresCompleted ?? 0;
  const target = progress?.targetAdventures ?? 10;
  const distance = progress?.distanceWalked ?? 0;
  const targetDist = progress?.targetDistance ?? 50000;
  const rewardClaimed = progress?.rewardClaimed ?? false;
  return (
    <div>
      <Header title={seasonName} onBack={goBack} />
      <div className="px-4 py-4 space-y-4">
        {error && <p className="text-sm text-error-600">{error}</p>}
        <Card className="bg-gradient-to-r from-brand-500 to-accent-500 text-white"><Sparkles size={24} className="mb-2" /><h2 className="text-xl font-bold">{seasonName}</h2><p className="text-white/80 text-sm mt-1">Complete adventures to earn seasonal rewards.</p><div className="mt-3 space-y-2"><div><div className="flex justify-between text-xs mb-1"><span>Adventures</span><span>{completed}/{target}</span></div><div className="h-2 bg-white/30 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(100, (completed / target) * 100)}%` }} /></div></div><div><div className="flex justify-between text-xs mb-1"><span>Distance</span><span>{(distance / 1000).toFixed(1)}/{(targetDist / 1000).toFixed(0)} km</span></div><div className="h-2 bg-white/30 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full transition-all" style={{ width: `${Math.min(100, (distance / targetDist) * 100)}%` }} /></div></div></div></Card>
        <div className="space-y-2">{SEASON_TIERS.map((t) => { const unlocked = level >= t.level; return (<Card key={t.level} className={`flex items-center gap-3 ${unlocked ? '' : 'opacity-60'}`}><div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: unlocked ? '#d1fae5' : '#f3f4f6' }}>{unlocked ? t.icon : <Lock size={18} className="text-ink-400" />}</div><div className="flex-1"><h3 className="font-semibold">Tier {t.level}</h3><p className="text-sm text-ink-500">{t.reward}</p></div>{unlocked && <span className="text-xs text-success-600 font-medium">Unlocked</span>}</Card>); })}</div>
        {!rewardClaimed && completed >= target ? <Button fullWidth onClick={() => claimReward().catch(() => {})}><Sparkles size={18} className="inline mr-2" />Claim Season Reward</Button> : <Button fullWidth onClick={() => navigate('adventures')}>Start Earning XP</Button>}
      </div>
    </div>
  );
}
