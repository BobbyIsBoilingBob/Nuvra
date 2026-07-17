import { useState, useEffect, useRef } from 'react';
import { GlassCard, Icon, Pill, Button, RewardPopup } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { RoutePreview } from '../components/RoutePreview';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { CURATED_ADVENTURES, getComboTier, DIFFICULTY_MULTIPLIERS } from '../data';
import { formatDistance, formatDuration } from '../lib/map-utils';

export function AdventureMap() {
  const { selectedAdventure, selectedAdventureObj, setScreen, recordAdventureComplete } = useStore();
  const { profile, updateProfile } = useAuth();
  const adventure = selectedAdventureObj ?? CURATED_ADVENTURES.find(a => a.id === selectedAdventure);
  const [phase, setPhase] = useState<'active' | 'complete'>('active');
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [combo, setCombo] = useState(0);
  const [treasuresFound, setTreasuresFound] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState<Array<{ icon: string; label: string; amount: number; color: string }>>([]);
  const startTime = useRef(Date.now());
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (phase !== 'active') return;
    const tick = () => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
      setDistance(prev => prev + 0.0008 + Math.random() * 0.0004);
      if (Math.random() < 0.005) { setTreasuresFound(t => t + 1); setCombo(c => c + 1); }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  if (!adventure || !profile) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden pb-24">
        <AdventureBg />
        <div className="relative z-10"><TopBar title="Adventure" showBack />
          <div className="px-4 py-8 text-center text-white/40">Adventure not found.</div>
        </div>
      </div>
    );
  }

  const comboTier = getComboTier(combo);
  const diffMult = DIFFICULTY_MULTIPLIERS[adventure.difficulty];
  const finalXp = Math.round(adventure.xp * comboTier.multiplier);
  const finalCoins = Math.round(adventure.coins * comboTier.multiplier);
  const finalGems = adventure.gems;

  const handleComplete = () => {
    setPhase('complete');
    recordAdventureComplete({
      adventureId: adventure.id,
      adventureName: adventure.title,
      type: adventure.type,
      emoji: adventure.emoji,
      difficulty: adventure.difficulty,
      distance: Math.round(distance * 100) / 100,
      time: elapsed,
      xpEarned: finalXp,
      coinsEarned: finalCoins,
      gemsEarned: finalGems,
      treasuresFound,
      maxCombo: combo,
      players: [profile.username],
      challengesCompleted: []
    });
    // Sync to Supabase profile
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let newStreak = profile.walking_streak;
    if (profile.last_walk_date === yesterday) newStreak += 1;
    else if (profile.last_walk_date !== today) newStreak = 1;
    updateProfile({
      xp: profile.xp + finalXp,
      coins: profile.coins + finalCoins,
      distance_walked: profile.distance_walked + distance,
      completed_adventures: profile.completed_adventures + 1,
      treasure_collected: profile.treasure_collected + treasuresFound,
      walking_streak: newStreak,
      last_walk_date: today
    });
    setRewardData([
      { icon: 'Zap', label: 'XP', amount: finalXp, color: 'text-zeviqo-300' },
      { icon: 'Coins', label: 'Coins', amount: finalCoins, color: 'text-gold-300' },
      { icon: 'Gem', label: 'Gems', amount: finalGems, color: 'text-plasma-300' }
    ]);
    setTimeout(() => setShowReward(true), 500);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#00c4ff" />
      <RewardPopup rewards={rewardData} visible={showReward} onClose={() => { setShowReward(false); setScreen('home'); }} />
      <div className="relative z-10">
        <TopBar title={adventure.title} showBack />
        <div className="px-4 max-w-md mx-auto flex flex-col gap-4 pt-4">
          <RoutePreview route={adventure.route} color="#00c4ff" animated={false} />
          {phase === 'active' ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                <GlassCard className="p-3 flex flex-col items-center gap-1">
                  <Icon name="Clock" size={18} className="text-cyan-300" />
                  <span className="text-base font-bold text-white">{formatDuration(elapsed)}</span>
                  <span className="text-[9px] text-white/40 uppercase">Time</span>
                </GlassCard>
                <GlassCard className="p-3 flex flex-col items-center gap-1">
                  <Icon name="MapPin" size={18} className="text-zeviqo-300" />
                  <span className="text-base font-bold text-white">{formatDistance(distance)}</span>
                  <span className="text-[9px] text-white/40 uppercase">Distance</span>
                </GlassCard>
                <GlassCard className="p-3 flex flex-col items-center gap-1">
                  <Icon name="Gem" size={18} className="text-gold-300" />
                  <span className="text-base font-bold text-white">{treasuresFound}</span>
                  <span className="text-[9px] text-white/40 uppercase">Treasures</span>
                </GlassCard>
              </div>
              {combo > 0 && (
                <GlassCard className="p-3 flex items-center justify-center gap-2">
                  <Icon name="Flame" size={20} style={{ color: comboTier.color }} />
                  <span className="text-sm font-bold" style={{ color: comboTier.color }}>{comboTier.name} Combo</span>
                  <span className="text-lg font-display font-extrabold" style={{ color: comboTier.color }}>{combo}x</span>
                </GlassCard>
              )}
              <div className="flex flex-col gap-2">
                <div className="text-xs font-bold text-white/40 uppercase">Objectives</div>
                {adventure.objectives.map((obj, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-white/60">
                    <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center"><span className="text-[9px]">{i+1}</span></div>
                    {obj}
                  </div>
                ))}
              </div>
              <Button size="lg" fullWidth icon="Flag" variant="secondary" onClick={handleComplete} className="mb-4">Complete Adventure</Button>
            </>
          ) : (
            <>
              <GlassCard className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zeviqo-400 to-plasma-500 flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
                  <Icon name="Check" size={32} className="text-ink-950" />
                </div>
                <h2 className="text-xl font-display font-bold text-white mb-1">Adventure Complete!</h2>
                <p className="text-xs text-white/40 mb-4">{adventure.title}</p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div><div className="text-sm font-bold text-cyan-300">{formatDistance(distance)}</div><div className="text-[9px] text-white/40 uppercase">Distance</div></div>
                  <div><div className="text-sm font-bold text-white">{formatDuration(elapsed)}</div><div className="text-[9px] text-white/40 uppercase">Time</div></div>
                  <div><div className="text-sm font-bold text-gold-300">{treasuresFound}</div><div className="text-[9px] text-white/40 uppercase">Treasures</div></div>
                </div>
                <div className="flex justify-center gap-2">
                  <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/30">+{finalXp} XP</Pill>
                  <Pill icon="Coins" accent="text-gold-300 border-gold-500/30">+{finalCoins}</Pill>
                  <Pill icon="Gem" accent="text-plasma-300 border-plasma-500/30">+{finalGems}</Pill>
                </div>
              </GlassCard>
              <Button size="lg" fullWidth icon="Home" onClick={() => setScreen('home')} className="mb-4">Back to Home</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
