import { useState, useMemo } from 'react';
import { Icon, GlassCard, Pill, ProgressBar } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { ACHIEVEMENTS, type Achievement, type AchievementCategory } from '../data';

const CATEGORIES: { id: AchievementCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'Grid' },
  { id: 'distance', label: 'Distance', icon: 'Footprints' },
  { id: 'adventures', label: 'Adventures', icon: 'Flag' },
  { id: 'streaks', label: 'Streaks', icon: 'Flame' },
  { id: 'friends', label: 'Friends', icon: 'Users' },
  { id: 'multiplayer', label: 'Multiplayer', icon: 'Users' },
  { id: 'coins', label: 'Coins', icon: 'Coins' },
  { id: 'xp', label: 'XP', icon: 'Zap' },
  { id: 'challenges', label: 'Challenges', icon: 'Swords' },
];

export function Achievements(): React.ReactElement {
  const { stats, walkingStreak, achievementProgress } = useStore();
  const [filter, setFilter] = useState<AchievementCategory | 'all'>('all');

  const getProgress = (a: Achievement): number => {
    switch (a.category) {
      case 'distance': return stats.totalDistance;
      case 'adventures': return stats.totalAdventures;
      case 'streaks': return walkingStreak;
      case 'friends': return stats.friendsAdded;
      case 'multiplayer': return stats.multiplayerAdventures;
      case 'coins': return stats.totalCoinsEarned;
      case 'xp': return stats.totalXpEarned;
      case 'challenges': return stats.totalChallenges;
      default: return 0;
    }
  };

  const filtered = useMemo(() => filter === 'all' ? ACHIEVEMENTS : ACHIEVEMENTS.filter(a => a.category === filter), [filter]);
  const unlockedCount = achievementProgress.filter(a => a.unlocked).length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#ffcc1a" />
      <div className="relative z-10">
        <TopBar title="Achievements" showCurrencies />
        <div className="px-4 max-w-md mx-auto flex flex-col gap-4">
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><Icon name="Trophy" size={20} className="text-gold-300" /><span className="text-sm font-black text-white">Achievement Progress</span></div>
              <Pill accent="text-gold-300 border-gold-500/30">{unlockedCount}/{totalCount}</Pill>
            </div>
            <ProgressBar value={(unlockedCount/totalCount)*100} accent="from-gold-400 to-ember-500" height={8} />
          </GlassCard>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setFilter(c.id)} className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${filter===c.id?'bg-gradient-to-r from-gold-400 to-ember-500 text-ink-950':'glass text-white/60'}`}>
                <Icon name={c.icon} size={12} />{c.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            {filtered.map(a => {
              const progress = getProgress(a);
              const ap = achievementProgress.find(p => p.achievementId === a.id);
              const unlocked = ap?.unlocked ?? progress >= a.target;
              const pct = Math.min(100, (progress / a.target) * 100);
              return (
                <GlassCard key={a.id} className={`p-4 ${unlocked?'ring-1 ring-gold-400/20':''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${unlocked?'bg-gradient-to-br from-gold-400 to-ember-500 shadow-glow':'glass'}`}>
                      <Icon name={a.icon} size={22} className={unlocked?'text-ink-950':'text-white/30'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{a.title}</span>
                        {unlocked && <Icon name="CheckCircle" size={14} className="text-gold-300" />}
                      </div>
                      <div className="text-xs text-white/40 mt-0.5">{a.description}</div>
                      {!unlocked && (
                        <div className="mt-2">
                          <ProgressBar value={pct} accent="from-gold-400 to-ember-500" height={6} showShimmer={false} />
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[10px] text-white/40">{Math.min(progress, a.target).toLocaleString()}/{a.target.toLocaleString()}{a.unit}</span>
                            <div className="flex items-center gap-1.5">
                              {a.xpReward > 0 && <span className="text-[10px] text-zeviqo-300 font-bold">+{a.xpReward} XP</span>}
                              {a.gemReward > 0 && <span className="text-[10px] text-plasma-400 font-bold">+{a.gemReward}💎</span>}
                            </div>
                          </div>
                        </div>
                      )}
                      {unlocked && (
                        <div className="flex items-center gap-1.5 mt-2">
                          {a.xpReward > 0 && <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/30">+{a.xpReward} XP</Pill>}
                          {a.gemReward > 0 && <Pill icon="Gem" accent="text-plasma-400 border-plasma-500/30">+{a.gemReward}</Pill>}
                          <Pill accent="text-gold-300 border-gold-500/30">Unlocked</Pill>
                        </div>
                      )}
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
