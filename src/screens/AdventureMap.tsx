import { useState, useEffect, useRef } from 'react';
import { Icon, GlassCard, Button, ProgressBar, ComboMeter } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { CHALLENGES, TREASURE_RARITY_MAP, MYSTERY_EVENTS, getComboTier } from '../data';
import { TRAILS, PETS } from '../cosmetics';

interface MapCoinState { id: string; x: number; y: number; collected: boolean }
interface MapTreasureState { id: string; x: number; y: number; coins: number; xp: number; opened: boolean; rarity: keyof typeof TREASURE_RARITY_MAP }
interface MapCheckpointState { id: string; label: string; kind: 'start' | 'challenge' | 'treasure' | 'finish'; x: number; y: number; reward: number; done: boolean }

const PROXIMITY = 7;

export function AdventureMap(): React.ReactElement {
  const { selectedAdventure, setScreen, combo, setCombo, resetCombo, accessibility, addCoins, setActiveMystery, profile } = useStore();

  const [progress, setProgress] = useState(0);
  const [collectedCoins, setCollectedCoins] = useState(0);
  const [collectedTreasures, setCollectedTreasures] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const [finished, setFinished] = useState(false);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [coins, setCoins] = useState<MapCoinState[]>([]);
  const [treasures, setTreasures] = useState<MapTreasureState[]>([]);
  const [checkpoints, setCheckpoints] = useState<MapCheckpointState[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const progressRef = useRef(0);

  // Initialize from selected adventure
  useEffect(() => {
    if (!selectedAdventure) return;
    setCoins(selectedAdventure.coins.map((c) => ({ ...c })));
    setTreasures(selectedAdventure.treasures.map((t) => ({ ...t })));
    setCheckpoints(selectedAdventure.checkpoints.map((c) => ({ ...c })));
    const start = selectedAdventure.routePath[0];
    if (start) setPlayerPos({ x: start.x, y: start.y });
    setTimeLeft(selectedAdventure.durationMin * 60);
  }, [selectedAdventure]);

  // Walking simulation — move player along route path
  useEffect(() => {
    if (!selectedAdventure || finished) return;
    const route = selectedAdventure.routePath;
    if (route.length < 2) return;

    const interval = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        const next = Math.min(100, prev + 100 / route.length);
        progressRef.current = next;
        return next;
      });

      setPlayerPos((prevPos) => {
        const segmentCount = route.length - 1;
        const segmentProgress = (progressRef.current / 100) * segmentCount;
        const segIdx = Math.min(Math.floor(segmentProgress), segmentCount - 1);
        const segT = segmentProgress - segIdx;
        const a = route[segIdx];
        const b = route[segIdx + 1];
        if (!a || !b) return prevPos;
        return {
          x: a.x + (b.x - a.x) * segT,
          y: a.y + (b.y - a.y) * segT,
        };
      });
    }, 800);

    return () => window.clearInterval(interval);
  }, [selectedAdventure, finished]);

  // Collect coins / treasures / checkpoints near player
  useEffect(() => {
    if (finished) return;

    setCoins((prev) =>
      prev.map((c) => {
        if (c.collected) return c;
        const dx = c.x - playerPos.x;
        const dy = c.y - playerPos.y;
        if (Math.sqrt(dx * dx + dy * dy) < PROXIMITY) {
          setCollectedCoins((n) => n + 1);
          setCombo((c) => c + 1);
          addCoins(10);
          return { ...c, collected: true };
        }
        return c;
      }),
    );

    setTreasures((prev) =>
      prev.map((t) => {
        if (t.opened) return t;
        const dx = t.x - playerPos.x;
        const dy = t.y - playerPos.y;
        if (Math.sqrt(dx * dx + dy * dy) < PROXIMITY) {
          setCollectedTreasures((n) => n + 1);
          setCombo((c) => c + 1);
          addCoins(t.coins);
          return { ...t, opened: true };
        }
        return t;
      }),
    );

    setCheckpoints((prev) =>
      prev.map((c) => {
        if (c.done || c.kind === 'start') return c;
        const dx = c.x - playerPos.x;
        const dy = c.y - playerPos.y;
        if (Math.sqrt(dx * dx + dy * dy) < PROXIMITY) {
          setCompletedChallenges((n) => n + 1);
          setCombo((c) => c + 1);
          addCoins(c.reward);
          return { ...c, done: true };
        }
        return c;
      }),
    );
  }, [playerPos, finished, setCombo, addCoins]);

  // Finish when progress reaches 100
  useEffect(() => {
    if (progress >= 100 && !finished) {
      setFinished(true);
    }
  }, [progress, finished]);

  // Mystery events — 15% chance every 8s, skip if relaxedMode
  useEffect(() => {
    if (!selectedAdventure || finished || accessibility.relaxedMode) return;
    const interval = window.setInterval(() => {
      if (Math.random() < 0.15) {
        const event = MYSTERY_EVENTS[Math.floor(Math.random() * MYSTERY_EVENTS.length)];
        setActiveMystery({
          type: event.id,
          label: event.label,
          icon: event.icon,
          color: event.color,
          timeRemaining: event.duration,
          duration: event.duration,
        });
      }
    }, 8000);
    return () => window.clearInterval(interval);
  }, [selectedAdventure, finished, accessibility.relaxedMode, setActiveMystery]);

  // Timer countdown
  useEffect(() => {
    if (!selectedAdventure || finished) return;
    if (timeLeft <= 0) return;
    const interval = window.setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => window.clearInterval(interval);
  }, [selectedAdventure, finished]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!selectedAdventure) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        <AdventureBg />
        <TopBar showBack />
        <div className="relative z-10 px-4 max-w-md mx-auto flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-4 text-white/40">
            <Icon name="Map" size={32} />
          </div>
          <h3 className="text-base font-bold text-white mb-1">No adventure selected</h3>
          <p className="text-sm text-white/50 mb-5">Choose an adventure to start exploring.</p>
          <Button variant="secondary" icon="ArrowLeft" onClick={() => setScreen('adventures')}>
            Browse Adventures
          </Button>
        </div>
      </div>
    );
  }

  const adv = selectedAdventure;
  const tier = getComboTier(combo);
  const equippedTrail = TRAILS.find((t) => t.id === profile.equippedTrail) ?? null;
  const trailColor = equippedTrail?.color ?? '#40f5cb';
  const equippedPet = PETS.find((p) => p.id === profile.equippedPet) ?? null;
  const petEmoji = equippedPet?.emoji ?? '🦊';

  // Build SVG path string
  const pathD = adv.routePath.length > 0
    ? adv.routePath.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
    : '';

  const activeChallenges = adv.challenges
    .map((id) => CHALLENGES.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => c != null);

  const minsLeft = Math.floor(timeLeft / 60);
  const secsLeft = timeLeft % 60;

  function handleQuit(): void {
    resetCombo();
    setScreen('adventure-detail');
  }

  if (finished) {
    const totalCoins = collectedCoins * 10 + treasures.filter((t) => t.opened).reduce((sum, t) => sum + t.coins, 0) + checkpoints.filter((c) => c.done).reduce((sum, c) => sum + c.reward, 0);
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        <AdventureBg accent="#fbbf24" />
        <div className="relative z-10 px-4 max-w-md mx-auto flex flex-col items-center justify-center py-16 text-center">
          <div className="text-7xl mb-4 animate-float">🏆</div>
          <h2 className="text-2xl font-black text-white mb-1">Adventure Complete!</h2>
          <p className="text-sm text-white/60 mb-6">{adv.name}</p>

          <GlassCard className="p-5 w-full">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-nova-300">
                  <Icon name="Zap" size={20} />
                </div>
                <div className="text-lg font-black text-white">+{adv.xpReward}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">XP Earned</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-gold-300">
                  <Icon name="Coins" size={20} />
                </div>
                <div className="text-lg font-black text-white">+{totalCoins}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Coins Earned</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-plasma-300">
                  <Icon name="Gem" size={20} />
                </div>
                <div className="text-lg font-black text-white">{collectedTreasures}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Treasures</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-ember-300">
                  <Icon name="Swords" size={20} />
                </div>
                <div className="text-lg font-black text-white">{completedChallenges}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Challenges</div>
              </div>
            </div>
          </GlassCard>

          <div className="flex flex-col gap-3 w-full mt-6">
            <Button variant="primary" size="lg" fullWidth icon="Home" onClick={() => setScreen('home')}>
              Back to Home
            </Button>
            <Button variant="secondary" size="lg" fullWidth icon="Compass" onClick={() => setScreen('adventures')}>
              More Adventures
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent={trailColor} />
      <ComboMeter combo={combo} />

      <div className="relative z-10">
        <TopBar showBack showCurrencies={false} title={adv.name} />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-4">
          {/* Progress card */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-white/40">Progress</span>
              <span className="text-xs font-bold text-nova-300">{Math.round(progress)}%</span>
            </div>
            <ProgressBar value={progress} accent="from-nova-400 to-cyan-300" />
            <div className="grid grid-cols-4 gap-2 mt-3">
              <div className="flex flex-col items-center gap-0.5">
                <Icon name="Coins" size={14} className="text-gold-300" />
                <span className="text-sm font-bold text-white">{collectedCoins}</span>
                <span className="text-[9px] text-white/40 uppercase">Coins</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Icon name="Gem" size={14} className="text-plasma-300" />
                <span className="text-sm font-bold text-white">{collectedTreasures}</span>
                <span className="text-[9px] text-white/40 uppercase">Treasures</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Icon name="Swords" size={14} className="text-ember-300" />
                <span className="text-sm font-bold text-white">{completedChallenges}</span>
                <span className="text-[9px] text-white/40 uppercase">Challenges</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <Icon name="Flame" size={14} className="text-rose-300" />
                <span className="text-sm font-bold text-white">{combo}x</span>
                <span className="text-[9px] text-white/40 uppercase">Combo</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <Icon name="Clock" size={14} className="text-white/40" />
                <span className="text-xs font-bold text-white/60">{minsLeft}:{secsLeft.toString().padStart(2, '0')}</span>
              </div>
              <div className={`text-xs font-bold ${tier.threshold > 1 ? 'text-ember-300' : 'text-white/40'}`}>
                {tier.label}
              </div>
            </div>
          </GlassCard>

          {/* Map area */}
          <GlassCard className="p-0 overflow-hidden">
            <div className="relative w-full aspect-square bg-ink-950/40">
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                {/* Route path */}
                {pathD && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#40f5cb"
                    strokeWidth="1.5"
                    strokeDasharray="3 2"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                )}

                {/* Zones */}
                {adv.zones.map((z) => (
                  <circle
                    key={z.id}
                    cx={z.x}
                    cy={z.y}
                    r={z.radius}
                    fill={z.color}
                    fillOpacity="0.12"
                    stroke={z.color}
                    strokeWidth="0.5"
                    strokeDasharray="2 1"
                  />
                ))}

                {/* Checkpoints */}
                {checkpoints.map((c) => (
                  <g key={c.id}>
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r="3"
                      fill={c.done ? '#40f5cb' : '#1a2a3a'}
                      stroke="#40f5cb"
                      strokeWidth="0.8"
                    />
                    {c.done && (
                      <text x={c.x} y={c.y + 1.2} textAnchor="middle" fontSize="3" fill="#0a0f1a" fontWeight="bold">✓</text>
                    )}
                  </g>
                ))}

                {/* Coins */}
                {coins.map((c) => (
                  !c.collected && (
                    <circle
                      key={c.id}
                      cx={c.x}
                      cy={c.y}
                      r="1.2"
                      fill="#fbbf24"
                    />
                  )
                ))}

                {/* Treasures */}
                {treasures.map((t) => {
                  const rarity = TREASURE_RARITY_MAP[t.rarity];
                  return (
                    !t.opened && (
                      <text
                        key={t.id}
                        x={t.x}
                        y={t.y + 1.5}
                        textAnchor="middle"
                        fontSize="3.5"
                        opacity="0.9"
                      >
                        {rarity.emoji}
                      </text>
                    )
                  );
                })}

                {/* Player trail */}
                {equippedTrail && (
                  <circle
                    cx={playerPos.x}
                    cy={playerPos.y}
                    r="2.5"
                    fill={trailColor}
                    opacity="0.3"
                  >
                    <animate attributeName="r" values="2.5;4;2.5" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Player avatar */}
                <circle
                  cx={playerPos.x}
                  cy={playerPos.y}
                  r="2"
                  fill="#40f5cb"
                  stroke="#0a0f1a"
                  strokeWidth="0.5"
                />
              </svg>

              {/* Pet following player (HTML overlay for emoji) */}
              <div
                className="absolute pointer-events-none transition-all duration-700 ease-linear"
                style={{
                  left: `${playerPos.x}%`,
                  top: `${playerPos.y}%`,
                  transform: 'translate(8px, 8px)',
                  fontSize: '14px',
                }}
              >
                <span className="animate-pet-bounce inline-block">{petEmoji}</span>
              </div>
            </div>
          </GlassCard>

          {/* Active challenges */}
          {activeChallenges.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Swords" size={18} className="text-ember-300" />
                <h3 className="text-sm font-bold text-white">Active Challenges</h3>
              </div>
              <div className="flex flex-col gap-2">
                {activeChallenges.map((c, i) => {
                  const done = i < completedChallenges;
                  return (
                    <div key={c.id} className="flex items-center gap-2.5">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${done ? 'bg-nova-500/20 text-nova-300' : 'glass text-white/40'}`}>
                        {done ? <Icon name="Check" size={14} /> : <Icon name={c.icon} size={14} />}
                      </div>
                      <span className={`text-sm ${done ? 'text-white/50 line-through' : 'text-white/80'}`}>{c.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quit button */}
          <Button variant="danger" size="md" fullWidth icon="X" onClick={handleQuit}>
            Quit Adventure
          </Button>
        </div>
      </div>
    </div>
  );
}
