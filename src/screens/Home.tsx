import { useMemo } from 'react';
import { Icon, GlassCard, XpBar, LevelBadge, StatChip, Pill } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { getLevelInfo, ADVENTURES, DAILY_QUESTS } from '../data';

export function Home(): React.ReactElement {
  const { profile, setScreen, stats, walkingStreak, dailyReward, questProgress } = useStore();
  const levelInfo = useMemo(() => getLevelInfo(profile.xp), [profile.xp]);

  const featuredAdventure = ADVENTURES[Math.floor(Math.random() * ADVENTURES.length)];
  const activeQuests = DAILY_QUESTS.slice(0, 3);

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent={profile.avatar.color} />
      <div className="relative z-10">
        <TopBar showCurrencies />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-4">
          {/* Hero card */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <LevelBadge level={levelInfo.level} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="text-lg font-black text-white truncate">{profile.username}</div>
                <div className="text-xs text-white/50">{levelInfo.title}</div>
              </div>
              <Pill icon="Flame" accent="text-ember-300 border-ember-500/30">
                {walkingStreak} day{walkingStreak !== 1 ? 's' : ''}
              </Pill>
            </div>
            <XpBar />
            <div className="text-right mt-1">
              <span className="text-xs text-white/40">{profile.xp.toLocaleString()} total XP</span>
            </div>
          </GlassCard>

          {/* Daily reward banner */}
          {!dailyReward.claimedToday && (
            <GlassCard className="p-4 flex items-center gap-3 cursor-pointer hover:bg-white/[0.1] transition-all" onClick={() => setScreen('daily-rewards')}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-ember-500 flex items-center justify-center text-2xl">
                🎁
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-white">Daily Reward Ready!</div>
                <div className="text-xs text-white/50">Tap to claim your daily login bonus</div>
              </div>
              <Icon name="ChevronRight" size={20} className="text-white/30" />
            </GlassCard>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2">
            <StatChip icon="Footprints" label="Distance" value={`${(stats.totalDistance / 1000).toFixed(1)} km`} color="text-nova-300" />
            <StatChip icon="Flag" label="Adventures" value={stats.totalAdventures} color="text-cyan-300" />
            <StatChip icon="Swords" label="Challenges" value={stats.totalChallenges} color="text-ember-300" />
            <StatChip icon="Gem" label="Treasures" value={stats.treasuresFound} color="text-gold-300" />
          </div>

          {/* Featured adventure */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-white/60">Featured Adventure</h3>
              <button onClick={() => setScreen('adventures')} className="text-xs font-bold text-nova-300">See all</button>
            </div>
            <GlassCard className="p-4 cursor-pointer hover:bg-white/[0.1] transition-all" onClick={() => { setScreen('adventure-detail'); }}>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-plasma-400 to-nova-500 flex items-center justify-center text-3xl">
                  {featuredAdventure.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-black text-white truncate">{featuredAdventure.name}</div>
                  <div className="text-xs text-white/50">{featuredAdventure.difficulty} · {featuredAdventure.distanceKm} km</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Pill icon="Zap" accent="text-nova-300 border-nova-500/30">+{featuredAdventure.xpReward} XP</Pill>
                    <Pill icon="Coins" accent="text-gold-300 border-gold-500/30">+{featuredAdventure.coinReward}</Pill>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => setScreen('quests')} className="glass rounded-2xl p-3 flex flex-col items-center gap-1.5 hover:bg-white/10 transition-all active:scale-95">
              <Icon name="ScrollText" size={22} className="text-nova-300" />
              <span className="text-[10px] font-bold text-white/60">Quests</span>
            </button>
            <button onClick={() => setScreen('achievements')} className="glass rounded-2xl p-3 flex flex-col items-center gap-1.5 hover:bg-white/10 transition-all active:scale-95">
              <Icon name="Trophy" size={22} className="text-gold-300" />
              <span className="text-[10px] font-bold text-white/60">Awards</span>
            </button>
            <button onClick={() => setScreen('community')} className="glass rounded-2xl p-3 flex flex-col items-center gap-1.5 hover:bg-white/10 transition-all active:scale-95">
              <Icon name="Users" size={22} className="text-plasma-300" />
              <span className="text-[10px] font-bold text-white/60">Social</span>
            </button>
          </div>

          {/* Active quests preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-white/60">Daily Quests</h3>
              <button onClick={() => setScreen('quests')} className="text-xs font-bold text-nova-300">View all</button>
            </div>
            <div className="flex flex-col gap-2">
              {activeQuests.map((q) => {
                const qp = questProgress.find((p) => p.questId === q.id);
                const progress = qp?.progress ?? 0;
                const pct = Math.min(100, (progress / q.target) * 100);
                return (
                  <GlassCard key={q.id} className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl glass flex items-center justify-center flex-shrink-0">
                        <Icon name={q.icon} size={16} className="text-nova-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white truncate">{q.title}</div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 mt-1.5 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-nova-400 to-cyan-300 transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <div className="text-xs text-white/40 flex-shrink-0">{Math.min(progress, q.target)}/{q.target}</div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
