import { useMemo } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar, BottomNav } from '../components/BottomNav';
import { GlassCard, Icon, ProgressBar, Pill } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { getLevelProgress, LEVELS } from '../data';
import { ACHIEVEMENTS } from '../cosmetics';

const TIER_COLORS: Record<string, string> = {
  bronze: '#cd7f32', silver: '#c0c0c0', gold: '#fbbf24', legendary: '#ef4444',
};

export function Rewards() {
  const { history, completedChallenges } = useStore();
  const { profile } = useAuth();
  const levelInfo = getLevelProgress(profile?.xp ?? 0);

  const metrics = useMemo(() => ({
    adventures: profile?.completed_adventures ?? history.length,
    distance: profile?.distance_walked ?? 0,
    treasures: profile?.treasure_collected ?? 0,
    streak: profile?.walking_streak ?? 0,
    level: levelInfo.info.level,
    challenges: completedChallenges.length,
  }), [profile, history, completedChallenges, levelInfo]);

  const unlockedAchievements = ACHIEVEMENTS.filter(a => (metrics[a.metric as keyof typeof metrics] ?? 0) >= a.requirement);
  const nextMilestones = LEVELS.filter(l => l.level > levelInfo.info.level).slice(0, 3);

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent="#fbbf24" />
      <TopBar title="Rewards" showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-3 space-y-4">
        <GlassCard className="p-5 text-center">
          <div className="text-4xl mb-2">{levelInfo.info.emoji}</div>
          <h2 className="text-lg font-display font-bold text-white">Level {levelInfo.info.level}</h2>
          <p className="text-xs text-white/40">{levelInfo.info.title}</p>
          <div className="flex items-center gap-2 mt-3">
            <ProgressBar value={levelInfo.current} max={levelInfo.needed} className="flex-1" accent="from-gold-300 to-ember-500" />
            <span className="text-[10px] text-white/40 font-bold whitespace-nowrap">{levelInfo.current}/{levelInfo.needed}</span>
          </div>
        </GlassCard>

        <div>
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Icon name="Trophy" size={14} className="text-gold-400" />
            Level Milestones
          </h3>
          <div className="space-y-2">
            {nextMilestones.map(lvl => (
              <GlassCard key={lvl.level} className="p-3 flex items-center gap-3">
                <div className="text-2xl">{lvl.emoji}</div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">Level {lvl.level} · {lvl.title}</p>
                  <p className="text-[10px] text-white/40">{lvl.minXp} XP required</p>
                </div>
                <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/30">{lvl.minXp}</Pill>
              </GlassCard>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Icon name="Award" size={14} className="text-gold-400" />
            Badges ({unlockedAchievements.length})
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {ACHIEVEMENTS.map(ach => {
              const isUnlocked = (metrics[ach.metric as keyof typeof metrics] ?? 0) >= ach.requirement;
              const tierColor = TIER_COLORS[ach.tier] ?? '#94a3b8';
              return (
                <GlassCard key={ach.id} className={`p-3 text-center ${isUnlocked ? '' : 'opacity-40'}`}>
                  <div
                    className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-1"
                    style={isUnlocked ? { background: `${tierColor}22`, border: `1px solid ${tierColor}44` } : undefined}
                  >
                    {isUnlocked ? (
                      <Icon name={ach.icon} size={18} style={{ color: tierColor }} />
                    ) : (
                      <Icon name="Lock" size={16} className="text-white/30" />
                    )}
                  </div>
                  <p className="text-[9px] font-bold text-white truncate">{ach.title}</p>
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
