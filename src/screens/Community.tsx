import { useState } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { supabase, type Profile } from '../lib/supabase';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Pill, Button, AvatarDisplay } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';

export function Community() {
  const { setScreen } = useStore();
  const { profile } = useAuth();
  const [leaderboard, setLeaderboard] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLeaderboard() {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('xp', { ascending: false }).limit(20);
    setLeaderboard((data as Profile[]) ?? []);
    setLoading(false);
  }

  if (loading && leaderboard.length === 0) loadLeaderboard();

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent="#8b5cf6" />
      <TopBar title="Community" showCurrencies />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <GlassCard className="p-3 flex items-center gap-2" onClick={() => setScreen('friends')}><Icon name="Users" size={18} className="text-zeviqo-400" /><span className="text-xs font-bold text-white">Friends</span></GlassCard>
          <GlassCard className="p-3 flex items-center gap-2" onClick={() => setScreen('party')}><Icon name="Swords" size={18} className="text-ember-400" /><span className="text-xs font-bold text-white">Party</span></GlassCard>
        </div>
        <div>
          <h2 className="text-sm font-bold text-white mb-2">Leaderboard</h2>
          {loading ? (
            <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="glass rounded-2xl p-3 animate-pulse"><div className="h-4 w-2/3 bg-white/10 rounded" /></div>)}</div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((p, i) => (
                <GlassCard key={p.id} className={`p-3 flex items-center gap-3 ${p.id === profile?.id ? 'border-zeviqo-500/30' : ''}`}>
                  <span className={`text-sm font-bold w-6 text-center ${i < 3 ? 'text-gold-400' : 'text-white/40'}`}>{i + 1}</span>
                  <AvatarDisplay emoji={p.avatar_emoji} color={p.avatar_color} size={36} />
                  <div className="flex-1"><p className="text-xs font-bold text-white">{p.username}</p><p className="text-[10px] text-white/40">Level {p.level}</p></div>
                  <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/30">{p.xp.toLocaleString()}</Pill>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
