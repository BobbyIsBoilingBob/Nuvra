import { useStore } from '../store';
import { AdventureBg } from '../components/AdventureBg';
import { Icon, ProgressBar, GlassCard, SectionHeader } from '../components/ui';
import { LEVELS, getLevelProgress, ACHIEVEMENTS, BADGES, type Achievement } from '../data';

const TIER_STYLES: Record<Achievement['tier'], { label: string; color: string }> = {
  bronze: { label: 'Bronze', color: 'from-ember-600 to-ember-700' },
  silver: { label: 'Silver', color: 'from-slate-300 to-slate-500' },
  gold: { label: 'Gold', color: 'from-gold-300 to-gold-500' },
  legendary: { label: 'Legendary', color: 'from-plasma-400 to-ember-500' },
};

export function RewardsScreen() {
  const { profile, totalXp, go } = useStore();
  const { info, current, needed, pct } = getLevelProgress(totalXp);
  const unlockedAch = ACHIEVEMENTS.filter((a) => a.unlocked);
  const lockedAch = ACHIEVEMENTS.filter((a) => !a.unlocked);

  return (
    <div className="relative min-h-screen pb-28 overflow-hidden">
      <AdventureBg />
      <div className="relative z-10 mx-auto max-w-md px-5 pt-12">
        <div className="flex items-center gap-3 animate-rise">
          <button onClick={() => go('home')} className="glass rounded-2xl w-10 h-10 flex items-center justify-center text-slate-200"><Icon name="ArrowLeft" size={18} /></button>
          <div><h1 className="font-display text-2xl font-extrabold text-white">Rewards</h1><p className="text-xs text-slate-400">Your progress & achievements</p></div>
        </div>

        <GlassCard className="mt-5 p-5 animate-rise" glow>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-nova-300 via-nova-400 to-ember-500 flex items-center justify-center shadow-glow"><span className="font-display text-2xl font-extrabold text-ink-950">{info.level}</span></div>
            <div className="flex-1"><p className="text-xs text-slate-400">Current Level</p><p className="font-display text-lg font-bold text-white">{info.title}</p><p className="text-xs text-slate-400 mt-0.5">{needed - current} XP to Lv.{info.level + 1}</p></div>
          </div>
          <div className="mt-4"><ProgressBar value={pct} height="h-3" barClass="from-nova-300 via-nova-400 to-ember-400" /></div>
          <p className="mt-2 text-right font-mono text-xs text-nova-300">{current} / {needed} XP</p>
        </GlassCard>

        <div className="mt-4 grid grid-cols-3 gap-3 stagger">
          <StatBox icon="Coins" label="Coins" value={profile.coins.toLocaleString()} accent="text-gold-300" />
          <StatBox icon="Footprints" label="Distance" value={`${profile.distanceKm} km`} accent="text-nova-300" />
          <StatBox icon="Flag" label="Adventures" value={profile.adventuresCompleted} accent="text-ember-300" />
        </div>

        {/* Phase 7: Challenge stats */}
        <div className="mt-3 grid grid-cols-3 gap-3">
          <StatBox icon="Swords" label="Challenges" value={profile.challengesCompleted} accent="text-plasma-300" />
          <StatBox icon="Flame" label="Best Combo" value={`${profile.bestCombo}x`} accent="text-ember-400" />
          <StatBox icon="HelpCircle" label="Mysteries" value={profile.challengesCompleted > 10 ? 3 : 1} accent="text-plasma-400" />
        </div>

        <div className="mt-6">
          <SectionHeader title="Level Ladder" />
          <div className="flex flex-col gap-2 stagger">
            {LEVELS.map((l) => {
              const isCurrent = l.level === info.level;
              const isPast = l.level < info.level;
              return (
                <div key={l.level} className={`glass rounded-2xl p-3 flex items-center gap-3 transition-all ${isCurrent ? 'border-nova-400/50 shadow-glow' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isPast ? 'bg-nova-400/20' : isCurrent ? 'bg-gradient-to-br from-nova-300 to-ember-500 shadow-glow' : 'bg-white/5'}`}><span className={`font-display text-sm font-bold ${isPast ? 'text-nova-300' : isCurrent ? 'text-ink-950' : 'text-slate-500'}`}>{l.level}</span></div>
                  <div className="flex-1 min-w-0"><p className={`text-sm font-semibold ${isCurrent ? 'text-white' : isPast ? 'text-slate-300' : 'text-slate-500'}`}>{l.title}</p><p className="text-[10px] text-slate-500 font-mono">{l.minXp}–{l.maxXp} XP</p></div>
                  {isPast && <Icon name="Check" size={16} className="text-nova-400" />}
                  {isCurrent && <span className="chip bg-nova-400/15 text-nova-300 !px-2 !py-0.5 !text-[10px]">Current</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <SectionHeader title="Badges" />
          <div className="grid grid-cols-4 gap-3 stagger">
            {BADGES.map((b) => (<div key={b.id} className="glass rounded-2xl p-3 flex flex-col items-center gap-1.5"><div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center shadow-glow`}><Icon name={b.icon} size={22} className="text-ink-950" /></div><span className="text-[10px] font-semibold text-slate-200 text-center leading-tight">{b.label}</span></div>))}
          </div>
        </div>

        <div className="mt-6">
          <SectionHeader title="Achievements" action={`${unlockedAch.length}/${ACHIEVEMENTS.length}`} />
          <div className="flex flex-col gap-3 stagger">
            {[...unlockedAch, ...lockedAch].map((a) => {
              const tier = TIER_STYLES[a.tier];
              return (
                <div key={a.id} className={`glass rounded-2xl p-4 flex items-center gap-3 transition-all ${a.unlocked ? '' : 'opacity-60'}`}>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${a.unlocked ? tier.color : 'from-ink-700 to-ink-600'} flex items-center justify-center shrink-0 ${a.unlocked ? 'shadow-glow' : ''}`}><Icon name={a.unlocked ? a.icon : 'Lock'} size={22} className={a.unlocked ? 'text-ink-950' : 'text-slate-500'} /></div>
                  <div className="flex-1 min-w-0"><div className="flex items-center gap-2"><p className="font-semibold text-sm text-white">{a.title}</p><span className={`chip !px-2 !py-0.5 !text-[9px] ${a.unlocked ? 'bg-white/10 text-slate-300' : 'bg-white/5 text-slate-500'}`}>{tier.label}</span></div><p className="text-xs text-slate-400 mt-0.5">{a.description}</p>{a.unlocked && a.date && <p className="text-[10px] text-nova-400 mt-1">Unlocked {a.date}</p>}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, accent }: { icon: string; label: string; value: React.ReactNode; accent: string }) {
  return (<div className="glass rounded-2xl p-3 text-center"><Icon name={icon} size={20} className={`mx-auto ${accent}`} /><p className="mt-1.5 font-display text-base font-bold text-white">{value}</p><p className="text-[10px] text-slate-400">{label}</p></div>);
}
