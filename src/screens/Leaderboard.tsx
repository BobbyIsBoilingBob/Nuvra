import { useStore } from '../store';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useAuth } from '../lib/auth';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Spinner } from '../components/Spinner';
import { Trophy, Medal } from 'lucide-react';

export default function Leaderboard() {
  const goBack = useStore((s) => s.goBack);
  const { user } = useAuth();
  const { entries, loading, error } = useLeaderboard();
  if (loading) return (<div><Header title="Leaderboard" onBack={goBack} /><div className="flex justify-center py-12"><Spinner /></div></div>);
  const myRank = user ? entries.findIndex((e) => e.id === user.id) + 1 : 0;
  const decorated = entries.map((e) => ({ ...e, isMe: !!user && e.id === user.id }));
  return (
    <div>
      <Header title="Leaderboard" onBack={goBack} subtitle={myRank ? `You're ranked #${myRank}` : 'Top adventurers'} />
      <div className="px-4 py-4 space-y-4">
        {error && <p className="text-sm text-error-600">{error}</p>}
        {decorated.length >= 3 && (
          <div className="grid grid-cols-3 gap-2 items-end">
            {[1, 0, 2].map((idx) => { const e = decorated[idx]; const place = idx + 1; const heights = ['h-20', 'h-28', 'h-16']; const colors = ['bg-ink-200', 'bg-accent-100', 'bg-orange-100']; return (<Card key={e.id} className={`text-center py-3 ${colors[place - 1]} ${heights[place - 1]} flex flex-col justify-end`}><div className="text-2xl">{place === 1 ? '🥇' : place === 2 ? '🥈' : '🥉'}</div><div className="font-bold text-sm mt-1">{e.username}</div><div className="text-xs text-ink-500">{e.xp} XP</div></Card>); })}
          </div>
        )}
        <div className="space-y-2">
          {decorated.map((e, i) => (
            <Card key={e.id} className={`flex items-center gap-3 ${e.isMe ? 'bg-brand-50 border-brand-200' : ''}`}>
              <div className="w-8 text-center font-bold text-ink-500">{i + 1}</div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ background: ['#f59e0b', '#9ca3af', '#d97706'][i] ?? '#1c7af5' }}>{e.username[0]?.toUpperCase()}</div>
              <div className="flex-1"><h3 className="font-semibold">{e.username}{e.isMe && <span className="text-xs text-brand-600 ml-1">(You)</span>}</h3><p className="text-xs text-ink-500">{e.xp} XP · Level {e.level}</p></div>
              {i < 3 && <Trophy size={18} className="text-accent-500" />}
            </Card>
          ))}
        </div>
        {decorated.length === 0 && !loading && <div className="text-center py-12 text-ink-400"><Medal className="mx-auto mb-2" /><p>No rankings yet. Be the first!</p></div>}
      </div>
    </div>
  );
}
