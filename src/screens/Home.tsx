import {
  Icon,
  GlassCard,
  ProgressBar,
  Pill,
  SectionTitle,
  AvatarDisplay,
  Stat,
} from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { useStore } from '../store';
import {
  getLevelProgress,
  DAILY_ADVENTURE_SEED,
  RECOMMENDATION_TEMPLATES,
  ADVENTURES,
  type Adventure,
} from '../data';
import { DAILY_REWARDS, SEASONAL_EVENTS } from '../cosmetics';

export function Home(): React.ReactElement {
  const { profile, setScreen, setSelectedAdventure, claimDailyReward, canClaimDaily, missions } =
    useStore();

  const levelInfo = getLevelProgress(profile.xp);
  const activeEvent = SEASONAL_EVENTS.find((e) => e.status === 'active') ?? null;
  const recommendation =
    RECOMMENDATION_TEMPLATES.find((r) => r.condition(profile)) ?? RECOMMENDATION_TEMPLATES[0];
  const dailyMissions = missions.slice(0, 3);
  const featuredAdventures: Adventure[] = [DAILY_ADVENTURE_SEED, ADVENTURES[0]];

  function openAdventure(a: Adventure): void {
    setSelectedAdventure(a);
    setScreen('adventure-detail');
  }

  const streakPill = (
    <Pill icon="Flame" accent="text-ember-300 border-ember-500/30">
      {profile.dailyStreak} day streak
    </Pill>
  );

  const quickActions = [
    { id: 'ai', label: 'AI Adventure', icon: 'Sparkles', screen: 'ai-generator' as const, accent: 'from-plasma-400 to-nova-500' },
    { id: 'challenges', label: 'Challenges', icon: 'Swords', screen: 'challenges' as const, accent: 'from-ember-400 to-rose-500' },
    { id: 'inventory', label: 'Inventory', icon: 'Backpack', screen: 'inventory' as const, accent: 'from-gold-300 to-ember-500' },
    { id: 'community', label: 'Community', icon: 'Users', screen: 'community' as const, accent: 'from-cyan-400 to-nova-500' },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg variant="space" accent="#40f5cb" />

      <div className="relative z-10 px-4 pt-6 safe-top">
        <div className="max-w-md mx-auto flex flex-col gap-5">
          {/* Profile Header */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-4 mb-4">
              <AvatarDisplay
                emoji={profile.avatar.emoji}
                color={profile.avatar.color}
                size={56}
                ring
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-extrabold text-white truncate">{profile.username}</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-bold text-nova-300">
                    Lv {profile.level} · {levelInfo.info.title}
                  </span>
                  <span className="text-lg">{levelInfo.info.emoji}</span>
                </div>
              </div>
            </div>
            {/* Level Progress */}
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-white/50 font-semibold">Level Progress</span>
              <span className="text-white/70 font-bold">
                {levelInfo.current} / {levelInfo.needed} XP
              </span>
            </div>
            <ProgressBar
              value={levelInfo.current}
              max={levelInfo.needed}
              accent="from-nova-400 to-cyan-300"
              height={8}
            />
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              <Stat icon="Flame" label="Streak" value={`${profile.streak} days`} accent="text-ember-400" />
              <Stat icon="Footprints" label="Distance" value={`${profile.distanceKm.toFixed(1)} km`} accent="text-cyan-400" />
              <Stat icon="Compass" label="Adventures" value={profile.adventuresCompleted} accent="text-nova-300" />
            </div>
          </GlassCard>

          {/* Daily Reward Calendar */}
          <div>
            <SectionTitle icon="Gift" accent="text-gold-300" action={streakPill}>
              Daily Rewards
            </SectionTitle>
            <GlassCard className="p-4 mt-3">
              <div className="grid grid-cols-7 gap-1.5">
                {DAILY_REWARDS.map((reward) => {
                  const claimed = reward.day < profile.dailyStreak;
                  const isToday = reward.day === profile.dailyStreak + 1 && canClaimDaily;
                  return (
                    <div
                      key={reward.day}
                      className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
                        isToday
                          ? 'glass-strong ring-2 ring-nova-400'
                          : claimed
                            ? 'opacity-40'
                            : 'glass'
                      }`}
                    >
                      <span className="text-[9px] font-bold text-white/40">D{reward.day}</span>
                      <span className="text-lg">{reward.emoji}</span>
                      <span className="text-[8px] font-semibold text-white/60 text-center leading-tight">
                        {reward.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={() => canClaimDaily && claimDailyReward()}
                disabled={!canClaimDaily}
                className={`mt-3 w-full py-2.5 rounded-xl text-sm font-bold transition-all ${
                  canClaimDaily
                    ? 'bg-gradient-to-r from-gold-300 to-ember-500 text-ink-950 active:scale-95'
                    : 'glass text-white/40 cursor-not-allowed'
                }`}
              >
                {canClaimDaily ? "Claim Today's Reward" : 'Already Claimed'}
              </button>
            </GlassCard>
          </div>

          {/* Seasonal Event Banner */}
          {activeEvent && (
            <GlassCard className="p-0 overflow-hidden" onClick={() => setScreen('seasonal')}>
              <div className={`bg-gradient-to-r ${activeEvent.bgGradient} p-4 relative`}>
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{activeEvent.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-nova-300">
                        Live Event
                      </span>
                      <span className="text-[10px] font-bold text-white/50">
                        {activeEvent.daysLeft} days left
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-white truncate">
                      {activeEvent.name}
                    </h3>
                    <p className="text-xs text-white/60 truncate">{activeEvent.desc}</p>
                  </div>
                  <Icon name="ChevronRight" size={20} className="text-white/50" />
                </div>
              </div>
            </GlassCard>
          )}

          {/* Daily Missions */}
          <div>
            <SectionTitle icon="Target" accent="text-ember-400">Daily Missions</SectionTitle>
            <div className="mt-3 flex flex-col gap-2">
              {dailyMissions.map((m) => (
                <GlassCard key={m.id} className="p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-nova-300 flex-shrink-0">
                    <Icon name={m.icon} size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white">{m.title}</div>
                    <div className="text-xs text-white/50">{m.detail}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-bold text-nova-300">
                      {m.current}/{m.target} {m.unit}
                    </div>
                    <div className="text-[10px] text-white/40">+{m.xp} XP</div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <GlassCard className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nova-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
              <Icon name={recommendation.icon} size={20} className="text-ink-950" />
            </div>
            <p className="text-sm font-semibold text-white/80 flex-1">{recommendation.text}</p>
          </GlassCard>

          {/* Quick Actions */}
          <div>
            <SectionTitle icon="Zap" accent="text-nova-300">Quick Actions</SectionTitle>
            <div className="grid grid-cols-2 gap-3 mt-3">
              {quickActions.map((qa) => (
                <GlassCard
                  key={qa.id}
                  className="p-4 flex flex-col items-center gap-2"
                  onClick={() => setScreen(qa.screen)}
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${qa.accent} flex items-center justify-center`}>
                    <Icon name={qa.icon} size={24} className="text-ink-950" />
                  </div>
                  <span className="text-xs font-bold text-white">{qa.label}</span>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Featured Adventures */}
          <div>
            <SectionTitle icon="Star" accent="text-gold-300" action={
              <button
                onClick={() => setScreen('adventures')}
                className="text-xs font-bold text-nova-300 hover:text-nova-200 transition-colors"
              >
                View All
              </button>
            }>
              Featured Adventures
            </SectionTitle>
            <div className="mt-3 flex flex-col gap-3">
              {featuredAdventures.map((adv) => (
                <GlassCard key={adv.id} className="p-0 overflow-hidden" onClick={() => openAdventure(adv)}>
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={adv.image}
                      alt={adv.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
                    {adv.isDaily && (
                      <div className="absolute top-2 left-2">
                        <Pill icon="Sun" accent="text-gold-300 border-gold-500/40 bg-ink-950/60">
                          Daily · 2x
                        </Pill>
                      </div>
                    )}
                    <div className="absolute bottom-2 left-3 right-3">
                      <h3 className="text-base font-extrabold text-white truncate">{adv.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-white/60">{adv.distanceKm} km</span>
                        <span className="text-xs text-white/30">·</span>
                        <span className="text-xs text-white/60">{adv.durationMin} min</span>
                        <span className="text-xs text-white/30">·</span>
                        <span className="text-xs font-bold text-nova-300">+{adv.xpReward} XP</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
