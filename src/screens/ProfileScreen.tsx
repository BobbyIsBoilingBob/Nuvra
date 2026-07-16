import { useStore } from '../store';
import { AdventureBg } from '../components/AdventureBg';
import { Icon, ProgressBar, GlassCard, AvatarBadge, SectionHeader } from '../components/ui';
import { getLevelProgress, BADGES, ACHIEVEMENTS, ADVENTURE_STYLES } from '../data';

export function ProfileScreen() {
  const { profile, totalXp, go, missions, achievementsUnlocked } = useStore();
  const { info, current, needed, pct } = getLevelProgress(totalXp);
  const styleMeta = ADVENTURE_STYLES.find((s) => s.id === profile.style);
  const unlockedAch = ACHIEVEMENTS.filter((a) => a.unlocked || achievementsUnlocked.includes(a.id));
  const completedMissions = missions.filter((m) => m.done).length;

  return (
    <div className="relative min-h-screen pb-28 overflow-hidden">
      <AdventureBg variant="aurora" />
      <div className="relative z-10 mx-auto max-w-md px-5 pt-12">
        <div className="flex items-center gap-3 animate-rise">
          <button onClick={() => go('home')} className="glass rounded-2xl w-10 h-10 flex items-center justify-center text-slate-200"><Icon name="ArrowLeft" size={18} /></button>
          <h1 className="font-display text-2xl font-extrabold text-white">Profile</h1>
          <button className="glass rounded-2xl w-10 h-10 flex items-center justify-center text-slate-300 ml-auto"><Icon name="Settings" size={18} /></button>
        </div>

        <GlassCard className="mt-5 p-5 animate-rise" glow>
          <div className="flex items-center gap-4">
            <AvatarBadge emoji={profile.avatar.emoji} color={profile.avatar.color} size="lg" />
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl font-bold text-white truncate">{profile.username || 'Explorer'}</h2>
              <p className="text-xs text-slate-400">{info.title}</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="chip bg-nova-400/15 text-nova-300 !px-2 !py-0.5 !text-[10px]"><Icon name="Zap" size={10} /> Lv.{info.level}</span>
                {styleMeta && <span className="chip bg-white/5 text-slate-300 !px-2 !py-0.5 !text-[10px]"><Icon name={styleMeta.icon} size={10} /> {styleMeta.label}</span>}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1.5"><span className="text-slate-400">XP Progress</span><span className="font-mono text-nova-300">{current} / {needed}</span></div>
            <ProgressBar value={pct} height="h-3" barClass="from-nova-300 via-nova-400 to-ember-400" />
            <p className="mt-1.5 text-[11px] text-slate-400">{needed - current} XP to reach Lv.{info.level + 1}</p>
          </div>
        </GlassCard>

        <div className="mt-4 grid grid-cols-2 gap-3 stagger">
          <StatTile icon="Flame" label="Streak" value={`${profile.streak} days`} accent="text-ember-400" />
          <StatTile icon="Footprints" label="Total Distance" value={`${profile.distanceKm} km`} accent="text-nova-300" />
          <StatTile icon="Flag" label="Adventures" value={profile.adventuresCompleted} accent="text-cyan-300" />
          <StatTile icon="Coins" label="Coins" value={profile.coins.toLocaleString()} accent="text-gold-300" />
          <StatTile icon="Check" label="Missions Done" value={`${completedMissions}/${missions.length}`} accent="text-nova-300" />
          <StatTile icon="Award" label="Achievements" value={`${unlockedAch.length}/${ACHIEVEMENTS.length}`} accent="text-plasma-300" />
        </div>

        {/* Phase 7: Challenge stats */}
        <div className="mt-3 grid grid-cols-3 gap-3">
          <StatTile icon="Swords" label="Challenges" value={profile.challengesCompleted} accent="text-plasma-300" />
          <StatTile icon="Flame" label="Best Combo" value={`${profile.bestCombo}x`} accent="text-ember-400" />
          <StatTile icon="TrendingUp" label="Skill Rating" value={`${Math.round(profile.difficultyRating * 100)}%`} accent="text-nova-300" />
        </div>

        <div className="mt-6">
          <SectionHeader title="Badges" />
          <div className="grid grid-cols-4 gap-3 stagger">
            {BADGES.map((b) => (<div key={b.id} className="glass rounded-2xl p-3 flex flex-col items-center gap-1.5"><div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center shadow-glow`}><Icon name={b.icon} size={22} className="text-ink-950" /></div><span className="text-[10px] font-semibold text-slate-200 text-center leading-tight">{b.label}</span></div>))}
          </div>
        </div>

        <div className="mt-6">
          <SectionHeader title="Recent Achievements" action="View All" onAction={() => go('rewards')} />
          <div className="flex flex-col gap-3 stagger">
            {unlockedAch.slice(0, 3).map((a) => (<div key={a.id} className="glass rounded-2xl p-3.5 flex items-center gap-3"><div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-nova-300 to-ember-500 flex items-center justify-center shrink-0 shadow-glow"><Icon name={a.icon} size={20} className="text-ink-950" /></div><div className="flex-1 min-w-0"><p className="font-semibold text-sm text-white">{a.title}</p><p className="text-xs text-slate-400 truncate">{a.description}</p></div>{a.date && <span className="text-[10px] text-nova-400 font-semibold">{a.date}</span>}</div>))}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 stagger">
          <button onClick={() => go('rewards')} className="glass rounded-2xl p-4 flex items-center gap-3 hover:border-white/20 active:scale-95 transition-all"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nova-400 to-plasma-500 flex items-center justify-center"><Icon name="Trophy" size={20} className="text-ink-950" /></div><span className="font-semibold text-sm text-white">Rewards</span></button>
          <button onClick={() => go('community')} className="glass rounded-2xl p-4 flex items-center gap-3 hover:border-white/20 active:scale-95 transition-all"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-300 to-ember-500 flex items-center justify-center"><Icon name="Users" size={20} className="text-ink-950" /></div><span className="font-semibold text-sm text-white">Community</span></button>
        </div>

        <button onClick={() => go('landing')} className="mt-6 w-full glass rounded-2xl py-3 font-semibold text-slate-400 active:scale-95 flex items-center justify-center gap-2"><Icon name="LogOut" size={16} /> Sign Out</button>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value, accent }: { icon: string; label: string; value: React.ReactNode; accent: string }) {
  return (<div className="glass rounded-2xl p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0"><Icon name={icon} size={20} className={accent} /></div><div><p className="font-display text-base font-bold text-white">{value}</p><p className="text-[10px] text-slate-400">{label}</p></div></div>);
}
