import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Pill, Button, ProgressBar, ZeviqoLogo, AvatarDisplay } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { BottomNav } from '../components/BottomNav';
import { getLevelProgress, DIFFICULTY_LABELS } from '../data';

export function Profile() {
  const { profile, signOut } = useAuth();
  const { history, setScreen } = useStore();
  if (!profile) return null;
  const levelInfo = getLevelProgress(profile.xp);

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg />
      <TopBar title="Profile" showCurrencies />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        {/* Profile header */}
        <GlassCard className="p-4 animate-slide-up text-center">
          <AvatarDisplay emoji={profile.avatar_emoji} color={profile.avatar_color} size={72} ring />
          <h2 className="text-lg font-display font-bold text-white mt-3">{profile.username}</h2>
          <p className="text-xs text-white/40">Level {levelInfo.info.level} · {levelInfo.info.title}</p>
          <div className="mt-3"><ProgressBar value={levelInfo.current} max={levelInfo.needed} /></div>
          <p className="text-[10px] text-white/40 mt-1">{levelInfo.current} / {levelInfo.needed} XP to next level</p>
        </GlassCard>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon="Route" label="Distance" value={`${profile.distance_walked.toFixed(1)} km`} color="text-zeviqo-400" />
          <StatCard icon="Compass" label="Adventures" value={`${profile.completed_adventures}`} color="text-gold-400" />
          <StatCard icon="Footprints" label="Steps" value={`${profile.steps.toLocaleString()}`} color="text-emerald-400" />
          <StatCard icon="Gem" label="Treasures" value={`${profile.treasure_collected}`} color="text-nova-300" />
          <StatCard icon="Flame" label="Streak" value={`${profile.walking_streak} days`} color="text-ember-400" />
          <StatCard icon="Trophy" label="Challenges" value={`${profile.completed_challenges}`} color="text-gold-300" />
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-3">
          <GlassCard className="p-3 flex items-center gap-2" onClick={() => setScreen('achievements')}><Icon name="Trophy" size={18} className="text-gold-400" /><span className="text-xs font-bold text-white">Achievements</span></GlassCard>
          <GlassCard className="p-3 flex items-center gap-2" onClick={() => setScreen('history')}><Icon name="History" size={18} className="text-zeviqo-400" /><span className="text-xs font-bold text-white">History</span></GlassCard>
          <GlassCard className="p-3 flex items-center gap-2" onClick={() => setScreen('inventory')}><Icon name="Package" size={18} className="text-nova-300" /><span className="text-xs font-bold text-white">Inventory</span></GlassCard>
          <GlassCard className="p-3 flex items-center gap-2" onClick={() => setScreen('customise')}><Icon name="Palette" size={18} className="text-ember-400" /><span className="text-xs font-bold text-white">Customise</span></GlassCard>
          <GlassCard className="p-3 flex items-center gap-2" onClick={() => setScreen('rewards')}><Icon name="Gift" size={18} className="text-gold-400" /><span className="text-xs font-bold text-white">Rewards</span></GlassCard>
          <GlassCard className="p-3 flex items-center gap-2" onClick={() => setScreen('seasonal')}><Icon name="Sparkles" size={18} className="text-nova-300" /><span className="text-xs font-bold text-white">Seasonal</span></GlassCard>
        </div>

        {/* Recent history */}
        {history.length > 0 && (
          <GlassCard className="p-4">
            <h3 className="text-sm font-bold text-white mb-2">Recent Activity</h3>
            <div className="space-y-2">
              {history.slice(0, 5).map(h => (
                <div key={h.id} className="flex items-center gap-2">
                  <span className="text-lg">{h.emoji}</span>
                  <div className="flex-1"><p className="text-xs font-bold text-white">{h.adventureName}</p><p className="text-[10px] text-white/40">{h.distance.toFixed(2)} km · +{h.xpEarned} XP</p></div>
                  <Pill accent="text-white/50 border-white/10">{DIFFICULTY_LABELS[h.difficulty as keyof typeof DIFFICULTY_LABELS] ?? h.difficulty}</Pill>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        <Button fullWidth variant="danger" icon="LogOut" onClick={() => signOut()}>Sign Out</Button>
        <div className="text-center"><ZeviqoLogo size="sm" /></div>
      </div>
      <BottomNav />
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return <GlassCard className="p-3"><div className="flex items-center gap-2 mb-1"><Icon name={icon} size={14} className={color} /><span className="text-[10px] text-white/40">{label}</span></div><p className="text-sm font-bold text-white">{value}</p></GlassCard>;
}
