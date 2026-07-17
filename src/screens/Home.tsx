import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { GlassCard, Icon, ProgressBar, Pill } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { BottomNav } from '../components/BottomNav';
import { getAdventures, getLevelProgress, DIFFICULTY_LABELS, ADVENTURE_TYPES, DAILY_REWARDS } from '../data';

export function Home() {
  const { profile } = useAuth();
  const { setScreen, setSelectedAdventure, history, dailyRewardStreak } = useStore();
  const adventures = getAdventures();
  const featured = adventures.slice(0, 3);
  const levelInfo = getLevelProgress(profile?.xp ?? 0);
  const today = new Date().toISOString().split('T')[0];
  const claimedToday = useStore(s => s.lastDailyRewardDate === today);

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg />
      <div className="relative z-10 px-4 pt-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-white/40">Welcome back,</p>
            <h1 className="text-xl font-display font-bold text-white">{profile?.username ?? 'Explorer'}</h1>
          </div>
          <button onClick={() => setScreen('settings')} className="w-10 h-10 rounded-xl glass flex items-center justify-center active:scale-90 transition-transform">
            <Icon name="Settings" size={18} className="text-white/60" />
          </button>
        </div>

        {/* Level card */}
        <GlassCard className="p-4 animate-slide-up" onClick={() => setScreen('profile')}>
          <div className="flex items-center gap-3 mb-3">
            <div className="text-3xl">{levelInfo.info.emoji}</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">Level {levelInfo.info.level} · {levelInfo.info.title}</p>
              <p className="text-[10px] text-white/40">{levelInfo.current} / {levelInfo.needed} XP</p>
            </div>
            <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/30">{profile?.xp ?? 0} XP</Pill>
          </div>
          <ProgressBar value={levelInfo.current} max={levelInfo.needed} />
        </GlassCard>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <GlassCard className="p-3 text-center">
            <Icon name="Route" size={18} className="text-zeviqo-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-white">{(profile?.distance_walked ?? 0).toFixed(1)}</p>
            <p className="text-[9px] text-white/40">km walked</p>
          </GlassCard>
          <GlassCard className="p-3 text-center">
            <Icon name="Compass" size={18} className="text-gold-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-white">{profile?.completed_adventures ?? 0}</p>
            <p className="text-[9px] text-white/40">adventures</p>
          </GlassCard>
          <GlassCard className="p-3 text-center">
            <Icon name="Flame" size={18} className="text-ember-400 mx-auto mb-1" />
            <p className="text-sm font-bold text-white">{profile?.walking_streak ?? 0}</p>
            <p className="text-[9px] text-white/40">day streak</p>
          </GlassCard>
        </div>

        {/* Daily reward */}
        <GlassCard className="p-4 animate-slide-up" onClick={() => setScreen('daily-rewards')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Gift" size={20} className="text-gold-400" />
              <div>
                <p className="text-sm font-bold text-white">Daily Reward</p>
                <p className="text-[10px] text-white/40">{claimedToday ? 'Claimed today' : `${dailyRewardStreak}-day streak`}</p>
              </div>
            </div>
            <Pill icon="CalendarClock" accent="text-gold-300 border-gold-500/30">Day {Math.min(dailyRewardStreak + 1, 7)}</Pill>
          </div>
        </GlassCard>

        {/* Featured adventures */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-white">Featured Adventures</h2>
            <button onClick={() => setScreen('adventures')} className="text-xs text-zeviqo-300 font-semibold">See all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {featured.map(adv => {
              const typeInfo = ADVENTURE_TYPES.find(t => t.type === adv.type);
              return (
                <div key={adv.id} onClick={() => { setSelectedAdventure(adv.id); setScreen('adventure-detail'); }} className="flex-shrink-0 w-44 glass rounded-2xl overflow-hidden active:scale-95 transition-transform cursor-pointer">
                  <div className="h-20 bg-gradient-to-br from-zeviqo-500/30 to-nova-500/30 flex items-center justify-center text-3xl">{adv.emoji}</div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-white truncate">{adv.title}</p>
                    <p className="text-[10px] text-white/40">{adv.distance} km · {adv.duration} min</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent history */}
        {history.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-bold text-white">Recent Adventures</h2>
              <button onClick={() => setScreen('history')} className="text-xs text-zeviqo-300 font-semibold">History</button>
            </div>
            <div className="space-y-2">
              {history.slice(0, 3).map(h => (
                <GlassCard key={h.id} className="p-3 flex items-center gap-3">
                  <div className="text-2xl">{h.emoji}</div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">{h.adventureName}</p>
                    <p className="text-[10px] text-white/40">{h.distance.toFixed(2)} km · +{h.xpEarned} XP</p>
                  </div>
                  <Pill accent="text-zeviqo-300 border-zeviqo-500/30">{DIFFICULTY_LABELS[h.difficulty as keyof typeof DIFFICULTY_LABELS] ?? h.difficulty}</Pill>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <GlassCard className="p-3 flex items-center gap-2" onClick={() => setScreen('quests')}>
            <Icon name="Target" size={18} className="text-zeviqo-400" />
            <span className="text-xs font-bold text-white">Quests</span>
          </GlassCard>
          <GlassCard className="p-3 flex items-center gap-2" onClick={() => setScreen('shop')}>
            <Icon name="ShoppingBag" size={18} className="text-gold-400" />
            <span className="text-xs font-bold text-white">Shop</span>
          </GlassCard>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
