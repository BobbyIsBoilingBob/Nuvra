import { GlassCard, Icon, LevelBadge, XpBar, Pill, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { useStore } from '../store';
import { CURATED_ADVENTURES, DAILY_REWARDS, getLevelInfo } from '../data';

export function Home() {
  const { profile, setScreen, setSelectedAdventure, setSelectedAdventureObj, adventureHistory } = useStore();
  const info = getLevelInfo(profile.xp);
  const featured = CURATED_ADVENTURES[0];
  const today = new Date().toISOString().split('T')[0];
  const canClaimDaily = profile.lastDailyRewardDate !== today;
  const nextRewardDay = (profile.lastDailyRewardDay ?? 0) + 1;
  const nextReward = DAILY_REWARDS.find(r => r.day === nextRewardDay) ?? DAILY_REWARDS[0];
  const recentHistory = adventureHistory.slice(0, 3);

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg />
      <div className="relative z-10">
        <div className="px-4 py-3 flex items-center justify-between glass-strong border-b border-white/5 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <LevelBadge xp={profile.xp} />
            <div>
              <div className="text-sm font-bold text-white">{profile.username}</div>
              <div className="text-[10px] text-white/40">Level {info.level} Explorer</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 glass rounded-full px-2.5 py-1">
              <Icon name="Coins" size={12} className="text-gold-400" />
              <span className="text-xs font-bold text-gold-300">{profile.coins.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 glass rounded-full px-2.5 py-1">
              <Icon name="Gem" size={12} className="text-plasma-400" />
              <span className="text-xs font-bold text-plasma-300">{profile.gems}</span>
            </div>
          </div>
        </div>

        <div className="px-4 max-w-md mx-auto flex flex-col gap-4 pt-4">
          <GlassCard className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-white/60">Experience</span>
              <span className="text-[10px] text-white/40">Next: LV {info.level + 1}</span>
            </div>
            <XpBar xp={profile.xp} showText={false} />
            <div className="flex justify-between mt-1.5 text-[10px] text-white/40">
              <span>{info.xpIntoLevel} XP</span>
              <span>{info.xpNeeded} XP</span>
            </div>
          </GlassCard>

          {canClaimDaily && (
            <GlassCard className="p-4 cursor-pointer active:scale-[0.98] transition-transform" onClick={() => setScreen('daily-rewards')}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-ember-500 flex items-center justify-center animate-pulse-glow">
                  <Icon name="Gift" size={24} className="text-ink-950" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold text-white">Daily Reward Ready!</div>
                  <div className="text-xs text-white/50">Day {nextReward.day}: +{nextReward.coins} coins, +{nextReward.xp} XP</div>
                </div>
                <Icon name="ChevronRight" size={20} className="text-white/30" />
              </div>
            </GlassCard>
          )}

          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: 'Route', label: 'Distance', value: `${profile.totalDistance.toFixed(1)} km`, color: 'text-zeviqo-300' },
              { icon: 'Compass', label: 'Adventures', value: profile.totalAdventures, color: 'text-ember-300' },
              { icon: 'Flame', label: 'Streak', value: `${profile.walkingStreak}d`, color: 'text-gold-300' }
            ].map(s => (
              <GlassCard key={s.label} className="p-3 flex flex-col items-center gap-1">
                <Icon name={s.icon} size={18} className={s.color} />
                <div className="text-base font-bold text-white">{s.value}</div>
                <div className="text-[9px] text-white/40 uppercase font-bold">{s.label}</div>
              </GlassCard>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-display font-bold text-white">Featured Adventure</h3>
              <button onClick={() => setScreen('adventures')} className="text-xs text-zeviqo-400 font-bold">See all</button>
            </div>
            <GlassCard className="p-4 cursor-pointer active:scale-[0.98] transition-transform" onClick={() => { setSelectedAdventure(featured.id); setSelectedAdventureObj(featured); setScreen('adventure-detail'); }}>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-zeviqo-400/20 to-plasma-500/20 flex items-center justify-center text-3xl">{featured.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{featured.title}</div>
                  <div className="text-xs text-white/40 truncate">{featured.theme}</div>
                  <div className="flex gap-1.5 mt-1.5">
                    <Pill icon="MapPin" accent="text-cyan-300 border-cyan-500/30">{featured.distance} km</Pill>
                    <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/30">+{featured.xp} XP</Pill>
                  </div>
                </div>
                <Icon name="ChevronRight" size={20} className="text-white/30" />
              </div>
            </GlassCard>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="md" fullWidth icon="Compass" onClick={() => setScreen('adventures')}>Adventures</Button>
            <Button variant="secondary" size="md" fullWidth icon="Target" onClick={() => setScreen('quests')}>Quests</Button>
            <Button variant="secondary" size="md" fullWidth icon="Trophy" onClick={() => setScreen('achievements')}>Achievements</Button>
            <Button variant="secondary" size="md" fullWidth icon="History" onClick={() => setScreen('history')}>History</Button>
          </div>

          {recentHistory.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-display font-bold text-white">Recent Adventures</h3>
                <button onClick={() => setScreen('history')} className="text-xs text-zeviqo-400 font-bold">See all</button>
              </div>
              <div className="flex flex-col gap-2">
                {recentHistory.map(h => (
                  <GlassCard key={h.id} className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-plasma-400/20 to-zeviqo-500/20 flex items-center justify-center text-xl">{h.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{h.adventureName}</div>
                      <div className="text-[10px] text-white/40">{h.distance} km · +{h.xpEarned} XP</div>
                    </div>
                    {h.isFavorite && <Icon name="Heart" size={14} className="text-rose-400 fill-current" />}
                  </GlassCard>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
