import { Icon, GlassCard, SectionTitle, ProgressBar, AvatarDisplay } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { getLevelProgress, BADGES } from '../data';
import { PROFILE_THEMES, STICKERS, COLLECTIBLE_BADGES, TRAILS, PETS } from '../cosmetics';

export function Profile(): React.ReactElement {
  const { profile, setScreen, ownedItems } = useStore();

  const levelProgress = getLevelProgress(profile.xp);
  const equippedTheme = PROFILE_THEMES.find((t) => t.id === profile.equippedTheme) ?? null;
  const equippedTrail = TRAILS.find((t) => t.id === profile.equippedTrail) ?? null;
  const equippedPet = PETS.find((p) => p.id === profile.equippedPet) ?? null;
  const equippedStickers = STICKERS.filter((s) => profile.equippedStickers.includes(s.id));
  const equippedCollectibleBadges = COLLECTIBLE_BADGES.filter((b) =>
    profile.equippedBadges.includes(b.id),
  );
  const equippedDataBadges = BADGES.filter((b) => profile.equippedBadges.includes(b.id));

  const stats = [
    { icon: 'Footprints', label: 'Distance', value: `${profile.distanceKm.toFixed(1)} km`, accent: 'text-nova-300' },
    { icon: 'Compass', label: 'Adventures', value: profile.adventuresCompleted, accent: 'text-cyan-300' },
    { icon: 'Flame', label: 'Streak', value: `${profile.streak} days`, accent: 'text-ember-300' },
    { icon: 'Package', label: 'Owned', value: ownedItems.length, accent: 'text-plasma-300' },
  ];

  const quickLinks: { label: string; icon: string; screen: 'inventory' | 'shop' | 'seasonal' | 'rewards' | 'settings' }[] = [
    { label: 'Inventory', icon: 'Package', screen: 'inventory' },
    { label: 'Shop', icon: 'ShoppingBag', screen: 'shop' },
    { label: 'Seasonal', icon: 'CalendarStar', screen: 'seasonal' },
    { label: 'Achievements', icon: 'Award', screen: 'rewards' },
    { label: 'Settings', icon: 'Settings', screen: 'settings' },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg variant="cyber" accent="#40f5cb" />

      <div className="relative z-10">
        <TopBar showBack title="Profile" />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-5">
          {/* Profile header card */}
          <GlassCard className="overflow-hidden">
            {/* Theme background */}
            {equippedTheme && (
              <div className={`h-24 bg-gradient-to-r ${equippedTheme.bgGradient} relative`}>
                <div className="absolute inset-0 bg-grid opacity-20" />
                <div className={`absolute inset-0 ${equippedTheme.effect} opacity-30`} />
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-ink-950/40 text-white backdrop-blur-sm">
                    <span>{equippedTheme.emoji}</span>
                    {equippedTheme.name} Theme
                  </span>
                </div>
              </div>
            )}
            <div className={`p-5 ${equippedTheme ? '-mt-10' : ''}`}>
              <div className="flex items-end gap-3">
                <div className={equippedTheme ? 'ring-4 ring-ink-950 rounded-full' : ''}>
                  <AvatarDisplay
                    emoji={profile.avatar.emoji}
                    color={profile.avatar.color}
                    size={72}
                    ring={!equippedTheme}
                  />
                </div>
                <div className="flex-1 pb-1">
                  <h2 className="text-xl font-black text-white">{profile.username}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-bold text-nova-300">
                      Lv {levelProgress.info.level} · {levelProgress.info.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Level progress */}
              <div className="mt-4">
                <ProgressBar
                  value={levelProgress.current}
                  max={levelProgress.needed}
                  accent="from-nova-400 to-cyan-300"
                />
                <div className="mt-1.5 flex items-center justify-between text-xs text-white/50">
                  <span>
                    {levelProgress.current.toLocaleString()} / {levelProgress.needed.toLocaleString()} XP
                  </span>
                  <span className="font-bold text-nova-300">{Math.round(levelProgress.pct * 100)}%</span>
                </div>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                {stats.map((s) => (
                  <div key={s.label} className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl glass flex items-center justify-center ${s.accent} flex-shrink-0`}>
                      <Icon name={s.icon} size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">{s.label}</div>
                      <div className="text-sm font-bold text-white">{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Equipped cosmetics */}
          <div>
            <SectionTitle
              icon="Sparkles"
              accent="text-plasma-300"
              action={
                <button
                  onClick={() => setScreen('customise')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-nova-300 hover:text-nova-200 transition-colors"
                >
                  Edit
                  <Icon name="ChevronRight" size={12} />
                </button>
              }
            >
              Equipped Cosmetics
            </SectionTitle>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {/* Trail */}
              <GlassCard className="p-3 flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-2xl">
                  {equippedTrail ? <span>{equippedTrail.emoji}</span> : <Icon name="Sparkles" size={20} className="text-white/30" />}
                </div>
                <div className="text-xs font-bold text-white">{equippedTrail ? equippedTrail.name : 'No Trail'}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Trail</div>
              </GlassCard>
              {/* Pet */}
              <GlassCard className="p-3 flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-2xl">
                  {equippedPet ? <span>{equippedPet.emoji}</span> : <Icon name="Cat" size={20} className="text-white/30" />}
                </div>
                <div className="text-xs font-bold text-white">{equippedPet ? equippedPet.name : 'No Pet'}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Pet</div>
              </GlassCard>
              {/* Theme */}
              <GlassCard className="p-3 flex flex-col items-center gap-2 text-center">
                <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center text-2xl">
                  {equippedTheme ? <span>{equippedTheme.emoji}</span> : <Icon name="Palette" size={20} className="text-white/30" />}
                </div>
                <div className="text-xs font-bold text-white">{equippedTheme ? equippedTheme.name : 'No Theme'}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-wider">Theme</div>
              </GlassCard>
            </div>
          </div>

          {/* Stickers */}
          {equippedStickers.length > 0 && (
            <div>
              <SectionTitle icon="Sticker" accent="text-gold-300">
                Stickers
              </SectionTitle>
              <div className="mt-3 flex flex-wrap gap-2">
                {equippedStickers.map((s) => (
                  <div
                    key={s.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl glass border border-white/10`}
                  >
                    <span className="text-lg">{s.emoji}</span>
                    <span className="text-xs font-bold text-white">{s.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Badges */}
          {(equippedCollectibleBadges.length > 0 || equippedDataBadges.length > 0) && (
            <div>
              <SectionTitle icon="Shield" accent="text-rose-300">
                Badges
              </SectionTitle>
              <div className="mt-3 flex flex-wrap gap-2">
                {equippedCollectibleBadges.map((b) => (
                  <div
                    key={b.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r ${b.accent}`}
                  >
                    <span className="text-lg">{b.emoji}</span>
                    <span className="text-xs font-bold text-ink-950">{b.name}</span>
                  </div>
                ))}
                {equippedDataBadges.map((b) => (
                  <div
                    key={b.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r ${b.color}`}
                  >
                    <Icon name={b.icon} size={16} className="text-ink-950" />
                    <span className="text-xs font-bold text-ink-950">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick links */}
          <div>
            <SectionTitle icon="Grid" accent="text-nova-300">
              Quick Links
            </SectionTitle>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {quickLinks.map((link) => (
                <GlassCard
                  key={link.label}
                  onClick={() => setScreen(link.screen)}
                  className="p-3 flex flex-col items-center gap-2 text-center cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-nova-300">
                    <Icon name={link.icon} size={18} />
                  </div>
                  <div className="text-xs font-bold text-white">{link.label}</div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
