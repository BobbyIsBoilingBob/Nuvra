import { GlassCard, Icon, XpBar, Pill, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { getLevelInfo } from '../data';

export function Profile() {
  const { profile, signOut } = useAuth();
  const { setScreen } = useStore();
  if (!profile) return null;
  const info = getLevelInfo(profile.xp);

  const stats = [
    { icon: 'Route', label: 'Total Distance', value: `${profile.distance_walked.toFixed(2)} km`, color: 'text-zeviqo-300' },
    { icon: 'Footprints', label: 'Total Steps', value: profile.steps.toLocaleString(), color: 'text-cyan-300' },
    { icon: 'Compass', label: 'Adventures', value: profile.completed_adventures, color: 'text-ember-300' },
    { icon: 'Trophy', label: 'Challenges', value: profile.completed_challenges, color: 'text-gold-300' },
    { icon: 'Gem', label: 'Treasures', value: profile.treasure_collected, color: 'text-plasma-300' },
    { icon: 'Flame', label: 'Walking Streak', value: `${profile.walking_streak} days`, color: 'text-ember-300' },
    { icon: 'Star', label: 'Level', value: info.level, color: 'text-zeviqo-300' },
    { icon: 'Zap', label: 'Total XP', value: profile.xp.toLocaleString(), color: 'text-zeviqo-300' },
    { icon: 'Coins', label: 'Coins', value: profile.coins.toLocaleString(), color: 'text-gold-300' },
    { icon: 'Calendar', label: 'Member Since', value: new Date(profile.created_at).toLocaleDateString(), color: 'text-white' }
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#00c4ff" />
      <div className="relative z-10">
        <TopBar title="Profile" />
        <div className="px-4 max-w-md mx-auto flex flex-col gap-4 pt-4">
          <GlassCard className="p-5 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-zeviqo-400/20 to-plasma-500/20 flex items-center justify-center text-5xl mb-3">{profile.avatar_emoji}</div>
            <h2 className="text-xl font-display font-bold text-white">{profile.username}</h2>
            <div className="flex gap-1.5 mt-2">
              <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/30">Level {info.level}</Pill>
            </div>
            <div className="w-full mt-4"><XpBar xp={profile.xp} /></div>
          </GlassCard>
          <div>
            <h3 className="text-xs font-bold text-white/40 uppercase mb-2">Statistics</h3>
            <div className="grid grid-cols-2 gap-2">
              {stats.map(s => (
                <GlassCard key={s.label} className="p-3 flex items-center gap-2">
                  <Icon name={s.icon} size={18} className={s.color} />
                  <div className="min-w-0">
                    <div className="text-[9px] font-bold uppercase text-white/40 truncate">{s.label}</div>
                    <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="md" icon="Trophy" onClick={() => setScreen('achievements')}>Achievements</Button>
            <Button variant="secondary" size="md" icon="History" onClick={() => setScreen('history')}>History</Button>
            <Button variant="secondary" size="md" icon="ShoppingBag" onClick={() => setScreen('shop')}>Shop</Button>
            <Button variant="secondary" size="md" icon="Settings" onClick={() => setScreen('settings')}>Settings</Button>
          </div>
          <Button variant="danger" size="md" fullWidth icon="LogOut" onClick={() => signOut()}>Log Out</Button>
        </div>
      </div>
    </div>
  );
}
