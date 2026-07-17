import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar, BottomNav } from '../components/BottomNav';
import { GlassCard, Icon, AvatarDisplay, ProgressBar, Pill, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { getLevelProgress } from '../data';

export function Profile() {
  const { setScreen, history, completedChallenges } = useStore();
  const { profile, signOut } = useAuth();
  const levelInfo = getLevelProgress(profile?.xp ?? 0);

  const navItems: { screen: Parameters<typeof setScreen>[0]; icon: string; label: string }[] = [
    { screen: 'achievements', icon: 'Award', label: 'Achievements' },
    { screen: 'history', icon: 'History', label: 'History' },
    { screen: 'inventory', icon: 'Package', label: 'Inventory' },
    { screen: 'customise', icon: 'Palette', label: 'Customise' },
    { screen: 'rewards', icon: 'Trophy', label: 'Rewards' },
    { screen: 'seasonal', icon: 'Sparkles', label: 'Seasonal' },
  ];

  const stats: { icon: string; label: string; value: string | number; color: string }[] = [
    { icon: 'Route', label: 'Distance', value: `${(profile?.distance_walked ?? 0).toFixed(1)} km`, color: 'text-zeviqo-400' },
    { icon: 'Compass', label: 'Adventures', value: profile?.completed_adventures ?? 0, color: 'text-gold-400' },
    { icon: 'Swords', label: 'Challenges', value: completedChallenges.length, color: 'text-ember-400' },
    { icon: 'Gem', label: 'Treasures', value: profile?.treasure_collected ?? 0, color: 'text-zeviqo-300' },
    { icon: 'Flame', label: 'Streak', value: profile?.walking_streak ?? 0, color: 'text-ember-400' },
    { icon: 'Footprints', label: 'Steps', value: (profile?.steps ?? 0).toLocaleString(), color: 'text-zeviqo-400' },
  ];

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg />
      <TopBar title="Profile" showCurrencies />
      <div className="relative z-10 px-4 pt-3 space-y-4">
        <GlassCard className="p-5 text-center">
          <div className="flex justify-center mb-3">
            <AvatarDisplay
              emoji={profile?.avatar_emoji ?? '🧭'}
              color={profile?.avatar_color ?? '#00c4ff'}
              size={80}
              ring
            />
          </div>
          <h2 className="text-lg font-display font-bold text-white">{profile?.username ?? 'Explorer'}</h2>
          <p className="text-xs text-white/40 mb-3">{levelInfo.info.emoji} Level {levelInfo.info.level} · {levelInfo.info.title}</p>
          <div className="flex items-center gap-2 mb-2">
            <ProgressBar value={levelInfo.current} max={levelInfo.needed} className="flex-1" />
            <span className="text-[10px] text-white/40 font-bold whitespace-nowrap">{levelInfo.current}/{levelInfo.needed}</span>
          </div>
          <div className="flex justify-center gap-2 mt-3">
            <Pill icon="Coins" accent="text-gold-400 border-gold-500/30">{profile?.coins ?? 0}</Pill>
            <Pill icon="Gem" accent="text-zeviqo-300 border-zeviqo-500/30">{profile?.gems ?? 0}</Pill>
            <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/30">{profile?.xp ?? 0} XP</Pill>
          </div>
        </GlassCard>

        <div className="grid grid-cols-3 gap-2">
          {stats.map(s => (
            <GlassCard key={s.label} className="p-3 text-center">
              <Icon name={s.icon} size={18} className={`${s.color} mx-auto mb-1`} />
              <p className="text-sm font-bold text-white">{s.value}</p>
              <p className="text-[9px] text-white/40">{s.label}</p>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {navItems.map(item => (
            <GlassCard key={item.label} className="p-3 text-center" onClick={() => setScreen(item.screen)}>
              <Icon name={item.icon} size={18} className="text-zeviqo-400 mx-auto mb-1" />
              <p className="text-[10px] font-bold text-white">{item.label}</p>
            </GlassCard>
          ))}
        </div>

        {history.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-white mb-2">Recent Activity</h3>
            <div className="space-y-2">
              {history.slice(0, 3).map(h => (
                <GlassCard key={h.id} className="p-3 flex items-center gap-3">
                  <div className="text-2xl">{h.emoji}</div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">{h.adventure_name}</p>
                    <p className="text-[10px] text-white/40">{h.distance.toFixed(2)} km · +{h.xp_earned} XP</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="secondary" fullWidth icon="Settings" onClick={() => setScreen('settings')}>Settings</Button>
          <Button variant="danger" fullWidth icon="LogOut" onClick={() => signOut()}>Sign Out</Button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
