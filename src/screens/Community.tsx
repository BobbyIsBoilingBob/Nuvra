import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { TopBar, BottomNav } from '../components/BottomNav';
import { GlassCard, Icon, AvatarDisplay, Pill, LoadingScreen } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { supabase, type Profile } from '../lib/supabase';
import { getLevelInfo } from '../data';

export function Community() {
  const { setScreen } = useStore();
  const [leaderboard, setLeaderboard] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('xp', { ascending: false })
        .limit(50);
      setLeaderboard((data as Profile[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent="#8b5cf6" />
      <TopBar title="Community" showCurrencies />
      <div className="relative z-10 px-4 pt-3 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <GlassCard className="p-4 flex items-center gap-3" onClick={() => setScreen('friends')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zeviqo-400 to-zeviqo-500 flex items-center justify-center">
              <Icon name="UserPlus" size={18} className="text-ink-950" />
            </div>
            <span className="text-sm font-bold text-white">Friends</span>
          </GlassCard>
          <GlassCard className="p-4 flex items-center gap-3" onClick={() => setScreen('party')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nova-400 to-nova-500 flex items-center justify-center">
              <Icon name="Users" size={18} className="text-ink-950" />
            </div>
            <span className="text-sm font-bold text-white">Party</span>
          </GlassCard>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Icon name="Trophy" size={16} className="text-gold-400" />
            Leaderboard
          </h3>
          <div className="space-y-2">
            {leaderboard.map((p, i) => {
              const levelInfo = getLevelInfo(p.xp ?? 0);
              const isTop3 = i < 3;
              const medalColors = ['#fbbf24', '#c0c0c0', '#cd7f32'];
              return (
                <GlassCard key={p.id} className={`p-3 flex items-center gap-3 ${isTop3 ? 'ring-1' : ''}`} >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm"
                    style={isTop3 ? { background: `${medalColors[i]}22`, color: medalColors[i], border: `1px solid ${medalColors[i]}44` } : undefined}
                  >
                    {isTop3 ? (i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉') : i + 1}
                  </div>
                  <AvatarDisplay emoji={p.avatar_emoji ?? '🧭'} color={p.avatar_color ?? '#00c4ff'} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{p.username}</p>
                    <p className="text-[10px] text-white/40">{levelInfo.emoji} Lv {levelInfo.level}</p>
                  </div>
                  <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/30">{p.xp ?? 0}</Pill>
                  {p.is_online && <div className="w-2 h-2 rounded-full bg-green-400" />}
                </GlassCard>
              );
            })}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
