import { GlassCard, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';

export function Settings(): React.ReactElement {
  const { profile, setProfile, resetProgress } = useStore();
  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#3dd4ff" />
      <div className="relative z-10">
        <TopBar showBack title="Settings" showCurrencies={false} />
        <div className="px-4 max-w-md mx-auto flex flex-col gap-4">
          <GlassCard className="p-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-white/60 mb-3">Profile</h3>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Username</label>
              <input type="text" value={profile.username} onChange={e => setProfile({ username: e.target.value.slice(0, 20) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-bold outline-none focus:border-zeviqo-400/50" maxLength={20} />
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-white/60 mb-3">About Zeviqo</h3>
            <div className="flex flex-col gap-2 text-xs text-white/50">
              <div className="flex justify-between"><span>Version</span><span className="text-white/70">12.0.0</span></div>
              <div className="flex justify-between"><span>Player ID</span><span className="text-white/70 font-mono text-[10px]">{profile.playerId}</span></div>
              <div className="flex justify-between"><span>Member since</span><span className="text-white/70">{new Date(profile.createdAt).toLocaleDateString()}</span></div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-rose-300 mb-3">Danger Zone</h3>
            <Button variant="danger" size="sm" icon="Trash2" onClick={() => { if (confirm('Are you sure? This will reset all your progress.')) resetProgress(); }}>Reset All Progress</Button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
