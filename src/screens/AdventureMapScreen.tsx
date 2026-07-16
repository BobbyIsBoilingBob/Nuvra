import { useEffect, useRef, useState } from 'react';
import { useStore } from '../store';
import { AdventureBg } from '../components/AdventureBg';
import { Icon, ProgressBar, StatPill, ComboMeter } from '../components/ui';
import {
  ADVENTURE_TYPE_META, ZONE_META, getLevelInfo, CHALLENGES, TREASURE_RARITY_MAP,
  DECISION_ROUTES,
  type MapPoint,
} from '../data';

export function AdventureMapScreen() {
  const {
    activeAdventure: adv, playerPos, setPlayerPos, playerMoving, setPlayerMoving,
    zoom, setZoom, hudVisible, toggleHud, mapRotation, setMapRotation,
    exitAdventure, collectCoin, openTreasure, reachCheckpoint, completeAdventure,
    sessionXp, sessionCoins, totalXp,
    combo, skipChallenge,
    activeChallenges, completeChallenge,
    activeMystery, triggerMystery, dismissMystery, mysteryEventCount,
    accessibility,
    decisionActive, selectedRoute, triggerDecision, selectDecisionRoute, dismissDecision,
  } = useStore();

  const [showChallengePanel, setShowChallengePanel] = useState(false);
  const [decisionTriggered, setDecisionTriggered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef<MapPoint | null>(null);
  const mysteryTimerRef = useRef<number | null>(null);

  if (!adv) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <AdventureBg />
        <div className="relative z-10 text-center">
          <p className="text-slate-400">No active adventure</p>
          <button onClick={exitAdventure} className="btn-glow mt-4 px-6 py-3">Back</button>
        </div>
      </div>
    );
  }

  const typeMeta = ADVENTURE_TYPE_META[adv.type];
  const levelInfo = getLevelInfo(totalXp);
  const cpDone = adv.checkpoints.filter((c) => c.done).length;
  const cpTotal = adv.checkpoints.length;
  const progress = cpTotal > 0 ? cpDone / cpTotal : 0;
  const collectedCoins = adv.coins.filter((c) => c.collected).length;
  const openedTreasures = adv.treasures.filter((t) => t.opened).length;
  const completedChallenges = activeChallenges.filter((c) => c.status === 'completed').length;
  const allDone = cpDone >= cpTotal;
  const distRemaining = Math.max(0, Math.round((1 - progress) * adv.distanceKm * 10) / 10);

  // Auto-walk along route path
  useEffect(() => {
    if (!adv) return;
    const pathIdx = findNearestPathIndex(playerPos, adv.routePath);
    if (pathIdx >= adv.routePath.length - 1) return;
    targetRef.current = adv.routePath[pathIdx + 1];

    const animate = () => {
      const target = targetRef.current;
      if (!target) return;
      const dx = target.x - playerPos.x;
      const dy = target.y - playerPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.8) {
        const newIdx = findNearestPathIndex(target, adv.routePath);
        if (newIdx < adv.routePath.length - 1) {
          targetRef.current = adv.routePath[newIdx + 1];
        } else {
          setPlayerMoving(false);
          targetRef.current = null;
          return;
        }
      } else {
        const speed = 0.4;
        setPlayerPos({ x: playerPos.x + (dx / dist) * speed, y: playerPos.y + (dy / dist) * speed });
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adv, playerPos.x, playerPos.y]);

  // Check proximity to entities
  useEffect(() => {
    if (!adv) return;
    const px = playerPos.x, py = playerPos.y;
    for (const coin of adv.coins) { if (!coin.collected && dist(px, py, coin.x, coin.y) < 4) collectCoin(coin.id); }
    for (const t of adv.treasures) { if (!t.opened && dist(px, py, t.x, t.y) < 5) openTreasure(t.id); }
    for (const cp of adv.checkpoints) { if (!cp.done && dist(px, py, cp.x, cp.y) < 5) reachCheckpoint(cp.id); }
    // Phase 7: Trigger mystery events randomly when entering zones
    for (const z of adv.zones) {
      if (z.type === 'mystery' && dist(px, py, z.x, z.y) < z.radius && !activeMystery) {
        triggerMystery();
      }
      // Phase 7: Trigger decision challenge at decision zones
      if (z.type === 'decision' && dist(px, py, z.x, z.y) < z.radius && !decisionTriggered) {
        setDecisionTriggered(true);
        triggerDecision();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerPos.x, playerPos.y]);

  // Phase 7: Auto-complete challenges when checkpoints reached
  useEffect(() => {
    if (cpDone > 0) {
      const pendingChallenges = activeChallenges.filter((c) => c.status === 'pending');
      if (pendingChallenges.length > 0 && completedChallenges < cpDone) {
        const next = pendingChallenges[0];
        completeChallenge(next.challengeId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpDone]);

  // Phase 7: Random mystery events while moving
  useEffect(() => {
    if (playerMoving && !accessibility.relaxedMode && !accessibility.reducedChallengeFrequency) {
      mysteryTimerRef.current = window.setInterval(() => {
        if (Math.random() < 0.15 && !activeMystery) triggerMystery();
      }, 8000);
    }
    return () => { if (mysteryTimerRef.current) clearInterval(mysteryTimerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerMoving, activeMystery, accessibility.relaxedMode, accessibility.reducedChallengeFrequency]);

  const pathD = adv.routePath.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="fixed inset-0 overflow-hidden bg-ink-950 select-none" ref={containerRef}>
      {/* Map background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-ink-800 via-ink-900 to-ink-950" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-nova-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-ember-500/10 blur-3xl" />
      </div>

      {/* Map content with zoom + rotation */}
      <div className="absolute inset-0 transition-transform duration-300" style={{ transform: `scale(${zoom}) rotate(${mapRotation}deg)` }}>
        {/* Route path SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="routeGrad" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#40f5cb" /><stop offset="50%" stopColor="#1fe3b0" /><stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
          </defs>
          <path d={pathD} stroke="url(#routeGrad)" strokeWidth="0.8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="2 1.5" className="animate-dash" opacity="0.7" />
          <path d={pathD} stroke="url(#routeGrad)" strokeWidth="0.4" fill="none" strokeLinecap="round" opacity="0.3" />
        </svg>

        {/* Phase 7: Challenge zones */}
        {adv.zones.map((z) => {
          const meta = ZONE_META[z.type];
          return (
            <div key={z.id} className="absolute" style={{ left: `${z.x}%`, top: `${z.y}%`, transform: 'translate(-50%,-50%)' }}>
              {!accessibility.disableChallengeAnimations && <div className="rounded-full border-2 animate-ring-expand absolute inset-0" style={{ width: `${z.radius * 2}%`, height: `${z.radius * 2}%`, borderColor: z.color, opacity: 0.4 }} />}
              <div className="rounded-full flex items-center justify-center" style={{ width: `${z.radius * 2}vmin`, height: `${z.radius * 2}vmin`, maxWidth: '80px', maxHeight: '80px', background: `${z.color}20`, border: `1px solid ${z.color}50` }}>
                <span style={{ color: z.color }}><Icon name={meta.icon} size={20} /></span>
              </div>
            </div>
          );
        })}

        {/* Coins */}
        {adv.coins.map((c) => !c.collected && (
          <div key={c.id} className="absolute" style={{ left: `${c.x}%`, top: `${c.y}%`, transform: 'translate(-50%,-50%)' }}>
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 flex items-center justify-center animate-spin-coin shadow-glow-gold"><Icon name="Coins" size={11} className="text-ink-950" /></div>
          </div>
        ))}

        {/* Phase 7: Treasures with rarity colors */}
        {adv.treasures.map((t) => {
          const r = TREASURE_RARITY_MAP[t.rarity];
          return (
            <div key={t.id} className="absolute" style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%,-50%)' }}>
              {t.opened ? (
                <div className="w-7 h-7 rounded-xl bg-ink-800/60 border border-white/10 flex items-center justify-center opacity-50"><Icon name="Check" size={14} className="text-nova-400" /></div>
              ) : (
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${r.accent} flex items-center justify-center ${r.animation} ${r.glowClass}`}><Icon name="Gem" size={16} className="text-ink-950" /></div>
              )}
            </div>
          );
        })}

        {/* Checkpoints */}
        {adv.checkpoints.map((cp) => {
          const kindIcon = cp.kind === 'start' ? 'Flag' : cp.kind === 'finish' ? 'Trophy' : cp.kind === 'treasure' ? 'Gem' : 'MapPin';
          const kindColor = cp.kind === 'start' ? 'from-nova-300 to-nova-500' : cp.kind === 'finish' ? 'from-plasma-400 to-nova-500' : cp.kind === 'treasure' ? 'from-gold-300 to-gold-500' : 'from-ember-400 to-ember-600';
          return (
            <div key={cp.id} className="absolute" style={{ left: `${cp.x}%`, top: `${cp.y}%`, transform: 'translate(-50%,-50%)' }}>
              {cp.done && !accessibility.disableChallengeAnimations && <div className="absolute inset-0 rounded-full border-2 border-nova-400/40 animate-ring-expand" />}
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${kindColor} flex items-center justify-center shadow-glow ${cp.done ? 'opacity-50' : ''}`}><Icon name={cp.done ? 'Check' : kindIcon} size={16} className="text-ink-950" /></div>
              <p className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-white whitespace-nowrap bg-ink-900/70 px-1.5 py-0.5 rounded">{cp.label}</p>
            </div>
          );
        })}

        {/* Player avatar */}
        <div className="absolute transition-all duration-100" style={{ left: `${playerPos.x}%`, top: `${playerPos.y}%`, transform: 'translate(-50%,-50%)' }}>
          <div className="relative">
            {!accessibility.disableChallengeAnimations && <div className="absolute inset-0 rounded-full bg-nova-400/30 animate-ring-expand" />}
            <div className={`relative w-10 h-10 rounded-2xl bg-gradient-to-br ${levelInfo.level >= 7 ? 'from-plasma-400 to-nova-500' : 'from-nova-300 to-ember-500'} flex items-center justify-center shadow-glow ${playerMoving && !accessibility.disableChallengeAnimations ? 'animate-bounce-walk' : 'animate-idle-bob'}`}><span className="text-lg">🦊</span></div>
          </div>
        </div>
      </div>

      {/* HUD overlay */}
      {hudVisible && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {/* Top HUD */}
          <div className="absolute top-0 inset-x-0 p-4">
            <div className="flex items-center gap-2">
              <button onClick={exitAdventure} className="pointer-events-auto glass-strong rounded-2xl w-10 h-10 flex items-center justify-center text-slate-200"><Icon name="X" size={18} /></button>
              <div className="glass-strong rounded-2xl px-3 py-2 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="chip bg-ink-900/70 border border-white/10 text-nova-300 !px-2 !py-0.5 !text-[10px]"><Icon name={typeMeta.icon} size={10} /> {typeMeta.label}</span>
                  <p className="text-xs font-bold text-white truncate">{adv.name}</p>
                </div>
                {/* Phase 7: Progress feedback */}
                <div className="mt-2"><ProgressBar value={progress} height="h-1.5" barClass="from-nova-300 to-ember-400" /></div>
                <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{cpDone}/{cpTotal} checkpoints</span>
                  <span>{Math.round(progress * 100)}% complete</span>
                  <span>{distRemaining} km left</span>
                </div>
              </div>
              <div className="pointer-events-auto glass-strong rounded-2xl px-3 py-2 flex flex-col items-center"><span className="text-[10px] text-slate-400">Lvl</span><span className="font-display text-sm font-bold text-nova-300">{levelInfo.level}</span></div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <StatPill icon="Zap" value={`+${sessionXp}`} />
              <StatPill icon="Coins" value={sessionCoins} />
              <StatPill icon="Footprints" value={`${adv.distanceKm}km`} />
              <StatPill icon="Clock" value={`${adv.durationMin}m`} />
            </div>
            {/* Phase 7: Combo meter */}
            {combo > 0 && <div className="mt-2 pointer-events-auto"><ComboMeter combo={combo} disableAnimations={accessibility.disableChallengeAnimations} /></div>}
          </div>

          {/* Phase 7: Current objective panel */}
          <div className="absolute top-32 right-3 pointer-events-auto">
            <button onClick={() => setShowChallengePanel(!showChallengePanel)} className="glass-strong rounded-2xl px-3 py-2 flex items-center gap-2">
              <Icon name="Swords" size={16} className="text-ember-400" />
              <span className="text-xs font-bold text-white">{completedChallenges}/{activeChallenges.length}</span>
              <Icon name="ChevronDown" size={14} className={`text-slate-400 transition-transform ${showChallengePanel ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Phase 7: Challenge panel */}
          {showChallengePanel && (
            <div className="absolute top-48 right-3 left-3 pointer-events-auto animate-slide-down">
              <div className="glass-strong rounded-2xl p-3 max-h-60 overflow-y-auto">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Active Challenges</p>
                <div className="flex flex-col gap-2">
                  {activeChallenges.map((ac) => {
                    const ch = CHALLENGES.find((c) => c.id === ac.challengeId);
                    if (!ch) return null;
                    return (
                      <div key={ac.challengeId} className={`glass rounded-xl p-2.5 flex items-center gap-2.5 ${ac.status === 'completed' ? 'opacity-50' : ''}`}>
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${ch.accent} flex items-center justify-center shrink-0`}><Icon name={ac.status === 'completed' ? 'Check' : ch.icon} size={14} className="text-ink-950" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{ch.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{ch.description}</p>
                        </div>
                        {ac.status === 'pending' && !accessibility.skipChallenges && (
                          <button onClick={() => skipChallenge(ac.challengeId)} className="glass rounded-lg px-2 py-1.5 text-[10px] font-semibold text-slate-300 active:scale-95 shrink-0"><Icon name="SkipForward" size={12} /></button>
                        )}
                        {ac.status === 'completed' && <Icon name="CheckCircle" size={16} className="text-nova-400 shrink-0" />}
                        {ac.status === 'skipped' && <Icon name="SkipForward" size={16} className="text-slate-500 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Bottom controls */}
          <div className="absolute bottom-0 inset-x-0 p-4">
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setZoom(Math.max(0.7, zoom - 0.2))} className="pointer-events-auto glass-strong rounded-2xl w-11 h-11 flex items-center justify-center text-slate-200 active:scale-95"><Icon name="Minus" size={18} /></button>
              <button onClick={() => setPlayerMoving(!playerMoving)} className={`pointer-events-auto rounded-2xl px-6 h-12 flex items-center gap-2 font-bold text-sm transition-all active:scale-95 ${playerMoving ? 'glass-strong text-ember-300' : 'btn-glow'}`}><Icon name={playerMoving ? 'Pause' : 'Play'} size={18} />{playerMoving ? 'Pause' : 'Walk'}</button>
              <button onClick={() => setZoom(Math.min(2, zoom + 0.2))} className="pointer-events-auto glass-strong rounded-2xl w-11 h-11 flex items-center justify-center text-slate-200 active:scale-95"><Icon name="Plus" size={18} /></button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              <button onClick={() => setMapRotation(mapRotation - 15)} className="pointer-events-auto glass rounded-xl w-9 h-9 flex items-center justify-center text-slate-300"><Icon name="RotateCcw" size={15} /></button>
              <button onClick={toggleHud} className="pointer-events-auto glass rounded-xl px-3 h-9 flex items-center gap-1.5 text-xs font-semibold text-slate-300"><Icon name="EyeOff" size={14} /> Hide HUD</button>
              <button onClick={() => setMapRotation(mapRotation + 15)} className="pointer-events-auto glass rounded-xl w-9 h-9 flex items-center justify-center text-slate-300"><Icon name="RotateCw" size={15} /></button>
            </div>
          </div>

          {/* Side stats */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 pointer-events-none">
            <div className="glass rounded-xl px-2.5 py-2 flex items-center gap-1.5"><Icon name="Coins" size={14} className="text-gold-300" /><span className="text-xs font-bold text-white">{collectedCoins}/{adv.coins.length}</span></div>
            <div className="glass rounded-xl px-2.5 py-2 flex items-center gap-1.5"><Icon name="Gem" size={14} className="text-ember-300" /><span className="text-xs font-bold text-white">{openedTreasures}/{adv.treasures.length}</span></div>
            <div className="glass rounded-xl px-2.5 py-2 flex items-center gap-1.5"><Icon name="Swords" size={14} className="text-plasma-300" /><span className="text-xs font-bold text-white">{completedChallenges}/{activeChallenges.length}</span></div>
            {mysteryEventCount > 0 && <div className="glass rounded-xl px-2.5 py-2 flex items-center gap-1.5"><Icon name="HelpCircle" size={14} className="text-plasma-400" /><span className="text-xs font-bold text-white">{mysteryEventCount}</span></div>}
          </div>
        </div>
      )}

      {/* Hidden HUD toggle */}
      {!hudVisible && (
        <button onClick={toggleHud} className="absolute top-4 right-4 z-20 glass-strong rounded-2xl w-10 h-10 flex items-center justify-center text-slate-200 pointer-events-auto"><Icon name="Eye" size={18} /></button>
      )}

      {/* Phase 7: Mystery event banner */}
      {activeMystery && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[55] animate-mystery-flash w-[90%] max-w-sm pointer-events-auto" onClick={dismissMystery}>
          <div className="glass-strong rounded-2xl p-3 flex items-center gap-3" style={{ boxShadow: `0 0 24px ${activeMystery.color}40` }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center animate-mystery-spin" style={{ background: `${activeMystery.color}30` }}>
              <span style={{ color: activeMystery.color }}><Icon name={activeMystery.icon} size={20} /></span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: activeMystery.color }}>Mystery Event</p>
              <p className="text-sm font-bold text-white">{activeMystery.label}</p>
              {activeMystery.duration > 0 && <div className="mt-1 h-1 rounded-full bg-white/10 overflow-hidden"><div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(activeMystery.timeRemaining / activeMystery.duration) * 100}%`, background: activeMystery.color }} /></div>}
            </div>
          </div>
        </div>
      )}

      {/* Phase 7: Decision challenge modal */}
      {decisionActive && (
        <div className="fixed inset-0 z-[58] flex items-center justify-center p-6 bg-ink-950/80 backdrop-blur-md animate-pop">
          <div className="glass-strong rounded-3xl p-6 max-w-sm w-full shadow-glow-plasma">
            <div className="flex items-center gap-2 mb-1"><Icon name="GitFork" size={18} className="text-plasma-400" /><p className="text-xs font-bold uppercase tracking-wide text-plasma-400">Decision Point</p></div>
            <h2 className="font-display text-xl font-bold text-white mb-1">Choose your route</h2>
            <p className="text-sm text-slate-400 mb-4">Each path offers a different experience.</p>
            <div className="flex flex-col gap-2.5">
              {DECISION_ROUTES.map((r) => (
                <button key={r.id} onClick={() => { selectDecisionRoute(r.id); }} className={`glass rounded-2xl p-3.5 flex items-center gap-3 text-left hover:border-white/25 active:scale-[0.98] transition-all ${selectedRoute === r.id ? 'border-plasma-400/60 shadow-glow-plasma' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${r.accent} flex items-center justify-center shrink-0`}><Icon name={r.icon} size={18} className="text-ink-950" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{r.label}</p>
                    <p className="text-[11px] text-slate-400">{r.desc}</p>
                    <div className="mt-1 flex items-center gap-2 text-[10px]"><span className="text-nova-300">XP {r.xpBonus}x</span><span className="text-gold-300">Coins {r.coinBonus}x</span></div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={dismissDecision} className="mt-4 w-full glass rounded-2xl py-2.5 text-xs font-semibold text-slate-400">Skip</button>
          </div>
        </div>
      )}

      {/* Completion button */}
      {allDone && (
        <div className="absolute bottom-24 inset-x-0 flex justify-center z-30 animate-pop">
          <button onClick={completeAdventure} className="btn-glow px-8 py-4 text-base"><Icon name="Trophy" size={20} /> Complete Adventure</button>
        </div>
      )}
    </div>
  );
}

function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function findNearestPathIndex(pos: MapPoint, path: MapPoint[]): number {
  let minDist = Infinity;
  let nearest = 0;
  for (let i = 0; i < path.length; i++) {
    const d = dist(pos.x, pos.y, path[i].x, path[i].y);
    if (d < minDist) { minDist = d; nearest = i; }
  }
  return nearest;
}
