import { useAuth } from '../lib/auth';
import { Card, Screen, EmptyState, Badge } from '../components/ui';
import { Users, Trophy, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, type Profile } from '../lib/supabase';

export default function Community() {
  const { profile } = useAuth();
  const [players, setPlayers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('profiles').select('*').order('xp', { ascending: false }).limit(50);
      setPlayers((data as Profile[]) ?? []);
      setLoading(false);
    })();
  }, []);
  const myRank = players.findIndex((p) => p.id === profile?.id) + 1;
  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4">Community</h1>
      {profile && (
        <Card className="p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{profile.avatar_emoji}</div>
            <div className="flex-1"><p className="text-white font-semibold">{profile.username}</p><p className="text-ink-400 text-xs">Your rank: {myRank > 0 ? `#${myRank}` : 'Unranked'}</p></div>
            <Badge color="#fbbf24"><Zap size={10} className="inline" /> {profile.xp.toLocaleString()}</Badge>
          </div>
        </Card>
      )}
      {loading ? <p className="text-ink-400 text-center py-8">Loading...</p> : players.length === 0 ? <EmptyState icon={Users} title="No players found" /> : (
        <div className="space-y-2">
          {players.map((p, i) => (
            <Card key={p.id} className="p-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i < 3 ? 'bg-zeviqo-500/20 text-zeviqo-400' : 'bg-ink-700/50 text-ink-400'}`}>{i + 1}</div>
              <div className="text-2xl">{p.avatar_emoji}</div>
              <div className="flex-1"><p className="text-white font-semibold text-sm">{p.username}</p><p className="text-ink-400 text-xs">Level {p.level}</p></div>
              <Badge color="#fbbf24"><Zap size={10} className="inline" /> {p.xp.toLocaleString()}</Badge>
            </Card>
          ))}
        </div>
      )}
    </Screen>
  );
}
