import { useStore } from '../store';
import { AdventureBg } from '../components/AdventureBg';
import { Icon, ProgressBar, GlassCard, AnimatedCounter } from '../components/ui';
import { getLevelProgress } from '../data';
import type { Screen } from '../data';

export function HomeScreen() {
  const { profile, totalXp, go, missions, collectMission, dailyAdventure, weeklyAdventure } = useStore();
  const { info, current, needed, pct } = getLevelProgress(totalXp);
  const quickActions: { icon: string; label: string; screen: Screen; accent: string }[] = [
    { icon: 'Sparkles', label: 'AI Adventure', screen: 'ai-generator', accent: 'from-plasma-400 to-nova-500' },
    { icon: 'Compass', label: 'Browse', screen: 'adventures', accent: 'from-nova-300 to-nova-500' },
    { icon: 'Swords', label: 'Challenges', screen: 'challenges', accent: 'from-ember-400 to-ember-600' },
    { icon: 'Trophy', label: 'Rewards', screen: 'rewards', accent: 'from-gold-300 to-gold-500' },
  ];

  return (
    <div className="relative min-h-screen pb-28 overflow-hidden">
      <AdventureBg />
      <div className="relative z-10 mx-auto max-w-md px-5 pt-12">
        <div className="flex items-center gap-3 animate-rise">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-nova-300 to-ember-500 flex items-center justify-center text-xl shadow-glow">{profile.avatar.emoji}</div>
          <div className="flex-1"><p className="text-xs text-slate-400">Welcome back</p><h1 className="font-display text-lg font-bold text-white">{profile.username || 'Explorer'}</h1></div>
          <div className="glass rounded-2xl px-3 py-2 flex items-center gap-1.5"><Icon name="Flame" size={16} className="text-ember-400" /><span className="font-mono text-sm font-bold text-white">{profile.streak}</span></div>
        </div>

        {/* XP card */}
        <GlassCard className="mt-5 p-5 animate-rise" glow>
          <div className="flex items-center justify-between mb-3">
            <div><p className="text-xs text-slate-400">Level {info.level}</p><p className="font-display text-base font-bold text-white">{info.title}</p></div>
            <div className="text-right"><p className="font-mono text-sm font-bold text-nova-300">{current}/{needed}</p><p className="text-[10px] text-slate-400">XP</p></div>
          </div>
          <ProgressBar value={pct} height="h-3" barClass="from-nova-300 via-nova-400 to-ember-400" />
          <div className="mt-4 grid grid-cols-3 gap-3">
            <MiniStat icon="Coins" value={<AnimatedCounter value={profile.coins} />} accent="text-gold-300" />
            <MiniStat icon="Footprints" value={`${profile.distanceKm}km`} accent="text-nova-300" />
            <MiniStat icon="Flag" value={profile.adventuresCompleted} accent="text-ember-300" />
          </div>
        </GlassCard>

        {/* Quick actions */}
        <div className="mt-5 grid grid-cols-4 gap-2.5 stagger">
          {quickActions.map((a) => (<button key={a.label} onClick={() => go(a.screen)} className="glass rounded-2xl p-3 flex flex-col items-center gap-1.5 hover:border-white/20 active:scale-95 transition-all"><div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.accent} flex items-center justify-center shadow-glow`}><Icon name={a.icon} size={20} className="text-ink-950" /></div><span className="text-[10px] font-semibold text-slate-200">{a.label}</span></button>))}
        </div>

        {/* Daily adventure */}
        <div className="mt-6 animate-rise" onClick={() => go('adventures')}>
          <div className="flex items-center gap-2 mb-2"><Icon name="Star" size={16} className="text-gold-300" /><h2 className="section-title">Daily Adventure</h2><span className="chip bg-gold-400/15 text-gold-300 !px-2 !py-0.5 !text-[10px]">x{dailyAdventure.bonusMultiplier} bonus</span></div>
          <div className="relative rounded-3xl overflow-hidden glass-strong cursor-pointer hover:border-white/25 transition-all group">
            <div className="relative h-32 overflow-hidden"><img src={dailyAdventure.image} alt={dailyAdventure.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" /><div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent" /><div className="absolute bottom-2 inset-x-3"><p className="font-display text-lg font-bold text-white">{dailyAdventure.name}</p><div className="flex items-center gap-2 mt-1 text-[11px] text-slate-300"><span className="flex items-center gap-1"><Icon name="Footprints" size={11} /> {dailyAdventure.distanceKm} km</span><span className="flex items-center gap-1"><Icon name="Clock" size={11} /> {dailyAdventure.durationMin} min</span></div></div></div>
          </div>
        </div>

        {/* Weekly expedition */}
        <div className="mt-4 animate-rise" onClick={() => go('adventures')}>
          <div className="relative rounded-3xl overflow-hidden glass-strong cursor-pointer hover:border-white/25 transition-all">
            <div className="relative h-28 overflow-hidden"><img src={weeklyAdventure.image} alt={weeklyAdventure.name} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/60 to-transparent" /><div className="absolute inset-0 flex items-center px-4"><div><div className="flex items-center gap-2 mb-1"><span className="chip bg-plasma-500/20 backdrop-blur-md border border-plasma-500/40 text-plasma-300 !text-[10px]"><Icon name="Trophy" size={11} /> Weekly</span><span className="chip bg-gold-400/15 text-gold-300 !px-2 !py-0.5 !text-[10px]">x{weeklyAdventure.bonusMultiplier} bonus</span></div><p className="font-display text-base font-bold text-white">{weeklyAdventure.name}</p><p className="text-[11px] text-slate-300">{weeklyAdventure.distanceKm} km · {weeklyAdventure.durationMin} min · {weeklyAdventure.difficulty}</p></div></div></div>
          </div>
        </div>

        {/* Daily missions */}
        <div className="mt-6">
          <h2 className="section-title mb-3">Daily Missions</h2>
          <div className="flex flex-col gap-3 stagger">
            {missions.map((m) => (<div key={m.id} className="glass rounded-2xl p-3.5 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0"><Icon name={m.icon} size={18} className="text-nova-300" /></div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-white">{m.title}</p><div className="mt-1.5 flex items-center gap-2"><ProgressBar value={m.current / m.target} height="h-1.5" barClass="from-nova-300 to-nova-500" /><span className="text-[10px] font-mono text-slate-400 shrink-0">{m.current}/{m.target}</span></div></div>{m.done ? <Icon name="CheckCircle" size={20} className="text-nova-400 shrink-0" /> : <button onClick={() => collectMission(m.id)} className="glass rounded-xl px-3 py-2 text-xs font-semibold text-nova-300 active:scale-95 shrink-0">Claim</button>}</div>))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ icon, value, accent }: { icon: string; value: React.ReactNode; accent: string }) {
  return (<div className="flex items-center gap-2"><Icon name={icon} size={16} className={accent} /><span className="font-display text-sm font-bold text-white">{value}</span></div>);
}
