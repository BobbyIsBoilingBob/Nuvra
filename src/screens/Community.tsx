import { useStore } from '../store';
import { useFriends } from '../hooks/useFriends';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Spinner } from '../components/Spinner';
import { Button } from '../components/Button';
import { Trophy, Users } from 'lucide-react';

export default function Community() {
  const goBack = useStore((s) => s.goBack);
  const navigate = useStore((s) => s.navigate);
  const { friends } = useFriends();
  const { entries, loading: lbLoading } = useLeaderboard();

  return (
    <div>
      <Header title="Community" onBack={goBack} />
      <div className="px-4 py-4 space-y-4">
        <Card onClick={() => navigate('friends')} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center"><Users size={20} /></div>
          <div className="flex-1"><p className="font-semibold">Friends</p><p className="text-xs text-ink-500">{friends.length} friends</p></div>
        </Card>
        <Card onClick={() => navigate('leaderboard')} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-100 text-accent-600 flex items-center justify-center"><Trophy size={20} /></div>
          <div className="flex-1"><p className="font-semibold">Leaderboard</p><p className="text-xs text-ink-500">Top walkers</p></div>
        </Card>
        <Card onClick={() => navigate('party')} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success-100 text-success-600 flex items-center justify-center"><Users size={20} /></div>
          <div className="flex-1"><p className="font-semibold">Party</p><p className="text-xs text-ink-500">Walk together</p></div>
        </Card>

        <h2 className="font-semibold pt-2">Top Walkers</h2>
        {lbLoading ? <div className="flex justify-center"><Spinner /></div> : entries.slice(0, 5).map((e, i) => (
          <Card key={e.id} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${i < 3 ? 'bg-accent-100 text-accent-700' : 'bg-ink-100 text-ink-500'}`}>{i + 1}</div>
            <div className="flex-1"><p className="font-medium">{e.username}</p><p className="text-xs text-ink-500">Lv {e.level} · {Math.round(e.distance_walked)}m</p></div>
            <span className="text-sm font-semibold text-brand-600">{e.xp} XP</span>
          </Card>
        ))}

        <Button variant="secondary" fullWidth onClick={() => navigate('friends')}>Find Friends</Button>
      </div>
    </div>
  );
}
