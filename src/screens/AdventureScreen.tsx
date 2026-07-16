import { useState } from 'react';
import { useStore } from '../store';
import { AdventureBg } from '../components/AdventureBg';
import { Icon, ProgressBar, StatPill } from '../components/ui';
import { ADVENTURE_CHECKPOINTS, type Checkpoint } from '../data';

const KIND_ICON: Record<Checkpoint['kind'], string> = {
  start: 'Flag',
  challenge: 'Swords',
  treasure: 'Gem',
  finish: 'Trophy',
};

const KIND_COLOR: Record<Checkpoint['kind'], string> = {
  start: 'from-nova-300 to-nova-500',
  challenge: 'from-ember-400 to-ember-600',
  treasure: 'from-gold-300 to-gold-500',
  finish: 'from-plasma-400 to-nova-500',
};

export function AdventureScreen() {
  const { profile, go, grantReward } = useStore();
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>(ADVENTURE_CHECKPOINTS);
  const [active, setActive] = useState(2); // index of next incomplete

  const completedCount = checkpoints.filter((c) => c.done).length;
  const progress = completedCount / checkpoints.length;

  const completeNext = () => {
    const cp = checkpoints[active];
    if (!cp || cp.done) return;
    setCheckpoints((prev) => prev.map((c) => (c.id === cp.id ? { ...c, done: true } : c)));
    grantReward({ title: `${cp.label} cleared!`, xp: 60, coins: cp.reward, icon: KIND_ICON[cp.kind] });
    setActive((a) => Math.min(a + 1, checkpoints.length - 1));
  };

  return (
    <div className="relative min-h-screen pb-28 overflow-hidden">
      <AdventureBg variant="map" />

      {/* HUD top */}
      <div className="relative z-10 px-5 pt-12">
        <div className="flex items-center justify-between">
          <button onClick={() => go('home')} className="glass rounded-2xl w-10 h-10 flex items-center justify-center text-slate-200">
            <Icon name="ArrowLeft" size={18} />
          </button>
          <div className="flex items-center gap-2">
            <StatPill icon="Footprints" value={`Lv.${profile.level}`} />
            <StatPill icon="Coins" value={profile.coins.toLocaleString()} />
          </div>
        </div>
      </div>

      {/* Map area */}
      <div className="relative z-10 mt-5 mx-5">
        <div className="relative h-[340px] rounded-3xl glass-strong overflow-hidden">
          <MapCanvas checkpoints={checkpoints} active={active} />

          {/* objective banner */}
          <div className="absolute top-4 inset-x-4">
            <div className="glass-strong rounded-2xl px-4 py-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ember-400 to-gold-500 flex items-center justify-center shrink-0">
                <Icon name="Target" size={18} className="text-ink-950" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-nova-300 font-semibold">CURRENT OBJECTIVE</p>
                <p className="text-sm font-bold text-white truncate">
                  {checkpoints[active] ? checkpoints[active].label : 'Adventure complete!'}
                </p>
              </div>
              {checkpoints[active] && !checkpoints[active].done && (
                <span className="chip bg-ember-400/15 border border-ember-400/30 text-ember-300">+{checkpoints[active].reward}</span>
              )}
            </div>
          </div>

          {/* progress footer */}
          <div className="absolute bottom-4 inset-x-4">
            <div className="glass-strong rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-300 font-semibold">Route Progress</span>
                <span className="font-mono text-nova-300 font-bold">{Math.round(progress * 100)}%</span>
              </div>
              <ProgressBar value={progress} height="h-2" barClass="from-nova-300 via-nova-400 to-ember-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Checkpoint list */}
      <div className="relative z-10 mt-5 mx-5">
        <h2 className="section-title mb-3">Checkpoints</h2>
        <div className="flex flex-col gap-2.5 stagger">
          {checkpoints.map((cp, i) => (
            <div
              key={cp.id}
              className={`glass rounded-2xl p-3.5 flex items-center gap-3 ${i === active && !cp.done ? 'border-nova-400/50 shadow-glow' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${KIND_COLOR[cp.kind]} flex items-center justify-center shrink-0 ${cp.done ? 'opacity-100' : 'opacity-60'}`}>
                <Icon name={cp.done ? 'Check' : KIND_ICON[cp.kind]} size={18} className="text-ink-950" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${cp.done ? 'text-slate-400 line-through' : 'text-white'}`}>{cp.label}</p>
                <p className="text-[11px] text-slate-500 capitalize">{cp.kind}</p>
              </div>
              {cp.reward > 0 && (
                <span className={`chip ${cp.done ? 'bg-nova-400/10 text-nova-400' : 'bg-gold-400/15 text-gold-300'}`}>
                  <Icon name="Coins" size={12} /> {cp.reward}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Action button */}
      <div className="relative z-10 mt-6 mx-5">
        <button onClick={completeNext} disabled={completedCount === checkpoints.length} className="btn-glow w-full py-4 disabled:opacity-40 disabled:shadow-none">
          {completedCount === checkpoints.length ? (
            <>Adventure Complete! <Icon name="Trophy" size={18} /></>
          ) : (
            <>Complete Checkpoint <Icon name="ArrowRight" size={18} /></>
          )}
        </button>
      </div>
    </div>
  );
}

function MapCanvas({ checkpoints, active }: { checkpoints: Checkpoint[]; active: number }) {
  const positions = [
    { x: 12, y: 70 },
    { x: 32, y: 40 },
    { x: 52, y: 62 },
    { x: 72, y: 30 },
    { x: 88, y: 55 },
  ];
  return (
    <div className="absolute inset-0">
      {/* terrain blobs */}
      <div className="absolute top-6 left-8 w-32 h-32 rounded-full bg-nova-500/15 blur-2xl" />
      <div className="absolute bottom-10 right-6 w-40 h-40 rounded-full bg-ember-500/12 blur-2xl" />
      <div className="absolute top-1/2 left-1/2 w-28 h-28 rounded-full bg-plasma-500/10 blur-2xl" />

      {/* route path */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="adv-route" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#40f5cb" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
        </defs>
        <path
          d="M12,70 Q22,50 32,40 T52,62 Q62,46 72,30 T88,55"
          stroke="url(#adv-route)"
          strokeWidth="1.2"
          fill="none"
          strokeDasharray="2 2"
          strokeLinecap="round"
        />
      </svg>

      {/* checkpoint pins */}
      {checkpoints.map((cp, i) => {
        const pos = positions[i];
        if (!pos) return null;
        const isActive = i === active && !cp.done;
        return (
          <div
            key={cp.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            {isActive && <span className="absolute inset-0 -m-3 rounded-full bg-nova-400/30 animate-pulse-glow" />}
            <div className={`relative w-9 h-9 rounded-full bg-gradient-to-br ${KIND_COLOR[cp.kind]} flex items-center justify-center shadow-lg ${cp.done ? '' : 'ring-2 ring-white/20'}`}>
              <Icon name={cp.done ? 'Check' : KIND_ICON[cp.kind]} size={16} className="text-ink-950" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
