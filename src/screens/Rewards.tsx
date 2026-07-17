import { useState } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Pill, Button, ProgressBar, SectionTitle } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { getLevelProgress, LEVELS } from '../data';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '../cosmetics';

export const BADGES_LIST = [
  { id: 'b1', label: 'First Adventure', icon: 'Footprints', color: 'from-zeviqo-400 to-cyan-500' },
  { id: 'b2', label: 'Treasure Hunter', icon: 'Gem', color: 'from-gold-300 to-ember-500' },
  { id: 'b3', label: 'Speed Demon', icon: 'Zap', color: 'from-ember-400 to-rose-500' },
  { id: 'b4', label: 'Explorer', icon: 'Compass', color: 'from-nova-300 to-nova-500' },
  { id: 'b5', label: 'Streak Master', icon: 'Flame', color: 'from-ember-500 to-rose-500' },
  { id: 'b6', label: 'Legend', icon: 'Crown', color: 'from-gold-300 to-ember-500' },
];

export function Rewards() {
  const { profile } = useAuth();
  const [category, setCategory] = useState<string>('all');
  const levelInfo = getLevelProgress(profile?.xp ?? 0);
  const stats: Record<string, number> = { adventures: profile?.completed_adventures ?? 0, distance: profile?.distance_walked ?? 0, treasures: profile?.treasure_collected ?? 0, streak: profile?.walking_streak ?? 0, level: profile?.level ?? 1 };
  const filtered = category === 'all' ? ACHIEVEMENTS : ACHIEVEMENTS.filter(a => a.category === category);

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent="#fbbf24" />
      <TopBar title="Rewards" showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        {/* Level progress */}
        <GlassCard className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">{levelInfo.info.emoji}</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Level {levelInfo.info.level} · {levelInfo.info.title}</p>
              <p className="text-[10px] text-white/40">{levelInfo.current} / {levelInfo.needed} XP</p>
            </div>
          </div>
          <ProgressBar value={levelInfo.current} max={levelInfo.needed} />
        </GlassCard>

        {/* Badges */}
        <GlassCard className="p-4">
          <SectionTitle icon="Award">Badges</SectionTitle>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {BADGES_LIST.map(b => (
              <div key={b.id} className="text-center p-2 glass rounded-xl">
                <div className={`w-10 h-10 mx-auto rounded-xl bg-gradient-to-br ${b.color} flex items-center justify-center`}><Icon name={b.icon} size={18} className="text-ink-950" /></div>
                <p className="text-[9px] font-bold text-white mt-1">{b.label}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Achievements */}
        <GlassCard className="p-4">
          <SectionTitle icon="Trophy">Achievements</SectionTitle>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mt-2">
            <button onClick={() => setCategory('all')} className={`flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-bold ${category === 'all' ? 'bg-zeviqo-500 text-ink-950' : 'glass text-white/60'}`}>All</button>
            {ACHIEVEMENT_CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)} className={`flex-shrink-0 px-3 py-1 rounded-full text-[10px] font-bold ${category === c ? 'bg-zeviqo-500 text-ink-950' : 'glass text-white/60'}`}>{c}</button>
            ))}
          </div>
          <div className="space-y-2 mt-2">
            {filtered.map(a => {
              const progress = stats[a.metric] ?? 0;
              const unlocked = progress >= a.requirement;
              return (
                <div key={a.id} className="flex items-center gap-3 glass rounded-xl p-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${unlocked ? 'bg-gold-500/20' : 'glass'}`}><Icon name={a.icon} size={16} className={unlocked ? 'text-gold-400' : 'text-white/30'} /></div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">{a.title}</p>
                    <p className="text-[10px] text-white/40">{a.description}</p>
                    <ProgressBar value={Math.min(progress, a.requirement)} max={a.requirement} height={3} className="mt-1" />
                  </div>
                  <Pill accent={unlocked ? 'text-emerald-300 border-emerald-500/30' : 'text-white/30 border-white/10'}>{unlocked ? 'Done' : `${Math.min(progress, a.requirement)}/${a.requirement}`}</Pill>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Level milestones */}
        <GlassCard className="p-4">
          <SectionTitle icon="TrendingUp">Level Milestones</SectionTitle>
          <div className="space-y-2 mt-2">
            {LEVELS.filter(l => l.level <= 25).map(l => {
              const reached = (profile?.xp ?? 0) >= l.minXp;
              return (
                <div key={l.level} className="flex items-center gap-3 glass rounded-xl p-3">
                  <div className="text-2xl">{l.emoji}</div>
                  <div className="flex-1"><p className="text-xs font-bold text-white">Level {l.level} · {l.title}</p><p className="text-[10px] text-white/40">{l.minXp.toLocaleString()} XP</p></div>
                  <Pill accent={reached ? 'text-emerald-300 border-emerald-500/30' : 'text-white/30 border-white/10'}>{reached ? 'Reached' : 'Locked'}</Pill>
                </div>
              );
            })}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
