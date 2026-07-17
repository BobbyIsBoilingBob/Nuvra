import { useState, useMemo } from 'react';
import { GlassCard, Icon, ProgressBar, EmptyState } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { ACHIEVEMENTS, getLevelInfo } from '../data';

export function Achievements() {
  const { profile } = useStore();
  const [category, setCategory] = useState<string>('all');

  const categories = ['all', 'exploration', 'fitness', 'social', 'collection', 'milestones'];

  const getProgress = (a: typeof ACHIEVEMENTS[0]): number => {
    switch (a.metric) {
      case 'distance': return profile.totalDistance;
      case 'adventures': return profile.totalAdventures;
      case 'streak': return profile.walkingStreak;
      case 'treasures': return profile.totalTreasures;
      case 'challenges': return profile.totalChallenges;
      case 'level': return getLevelInfo(profile.xp).level;
      case 'friends': return 0;
      default: return 0;
    }
  };

  const filtered = useMemo(() => category === 'all' ? ACHIEVEMENTS : ACHIEVEMENTS.filter(a => a.category === category), [category]);

  const tierColors = {
    bronze: 'from-amber-600 to-amber-800',
    silver: 'from-gray-300 to-gray-500',
    gold: 'from-gold-400 to-gold-600',
    platinum: 'from-cyan-300 to-plasma-500'
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#f5b800" />
      <div className="relative z-10">
        <TopBar title="Achievements" />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-4 pt-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-all ${category===c?'bg-zeviqo-500 text-ink-950':'glass text-white/50'}`}>{c}</button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {filtered.map(a => {
              const current = getProgress(a);
              const unlocked = profile.unlockedAchievements.includes(a.id) || current >= a.requirement;
              const pct = Math.min(100, (current / a.requirement) * 100);
              return (
                <GlassCard key={a.id} className={`p-4 ${unlocked ? '' : 'opacity-70'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${unlocked ? tierColors[a.tier] : 'from-white/5 to-white/10'} flex items-center justify-center flex-shrink-0`}>
                      <Icon name={a.icon} size={22} className={unlocked ? 'text-white' : 'text-white/30'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">{a.title}</span>
                        {unlocked && <Icon name="CheckCircle" size={16} className="text-emerald-400" />}
                      </div>
                      <div className="text-xs text-white/50 mt-0.5">{a.description}</div>
                      <div className="mt-2">
                        <ProgressBar value={current} max={a.requirement} colorClass={unlocked ? `bg-gradient-to-r ${tierColors[a.tier]}` : 'from-zeviqo-400 to-zeviqo-500'} />
                        <div className="text-[10px] text-white/40 mt-1">{Math.floor(current)} / {a.requirement}</div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
