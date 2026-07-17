import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, ProgressBar, Pill } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '../cosmetics';
import { getLevelInfo } from '../data';

const TIER_COLORS: Record<string, string> = {
  bronze: '#cd7f32', silver: '#c0c0c0', gold: '#fbbf24', legendary: '#ef4444',
};

export function Achievements() {
  const { questProgress, history, completedChallenges } = useStore();
  const { profile } = useAuth();
  const [category, setCategory] = useState<string>('all');

  const metrics = useMemo(() => {
    const levelInfo = getLevelInfo(profile?.xp ?? 0);
    return {
      adventures: profile?.completed_adventures ?? history.length,
      distance: profile?.distance_walked ?? 0,
      treasures: profile?.treasure_collected ?? 0,
      streak: profile?.walking_streak ?? 0,
      level: levelInfo.level,
      challenges: completedChallenges.length,
    };
  }, [profile, history, completedChallenges]);

  const filtered = useMemo(() => {
    if (category === 'all') return ACHIEVEMENTS;
    return ACHIEVEMENTS.filter(a => a.category === category);
  }, [category]);

  return (
    <div className="relative min-h-screen pb-8">
      <AdventureBg />
      <TopBar title="Achievements" showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-3 space-y-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${category === 'all' ? 'bg-gradient-to-r from-zeviqo-400 to-zeviqo-500 text-ink-950' : 'glass text-white/60'}`}
          >
            All
          </button>
          {ACHIEVEMENT_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${category === cat ? 'bg-gradient-to-r from-zeviqo-400 to-zeviqo-500 text-ink-950' : 'glass text-white/60'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map(ach => {
            const current = metrics[ach.metric as keyof typeof metrics] ?? 0;
            const pct = Math.min(100, (current / ach.requirement) * 100);
            const isUnlocked = current >= ach.requirement;
            const tierColor = TIER_COLORS[ach.tier] ?? '#94a3b8';
            return (
              <GlassCard key={ach.id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${tierColor}22`, border: `1px solid ${tierColor}44` }}
                  >
                    <Icon name={ach.icon} size={18} style={{ color: tierColor }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white">{ach.title}</p>
                      {isUnlocked && <Icon name="CheckCircle" size={14} className="text-zeviqo-400" />}
                    </div>
                    <p className="text-[10px] text-white/40">{ach.description}</p>
                  </div>
                  <Pill accent="text-white/60 border-white/10">
                    <span style={{ color: tierColor }}>{ach.tier}</span>
                  </Pill>
                </div>
                <div className="flex items-center gap-2">
                  <ProgressBar
                    value={current}
                    max={ach.requirement}
                    className="flex-1"
                    accent={isUnlocked ? 'from-gold-300 to-ember-500' : 'from-zeviqo-400 to-zeviqo-500'}
                  />
                  <span className="text-[10px] text-white/40 font-bold whitespace-nowrap">
                    {Math.floor(current)}/{ach.requirement}
                  </span>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
