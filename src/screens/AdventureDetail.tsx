import { useMemo } from 'react';
import { Icon, GlassCard, Pill, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { ADVENTURES } from '../data';

export function AdventureDetail(): React.ReactElement {
  const { selectedAdventureId, setScreen, recordAdventureComplete } = useStore();
  const adventure = useMemo(() => ADVENTURES.find((a) => a.id === selectedAdventureId), [selectedAdventureId]);

  if (!adventure) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden">
        <AdventureBg />
        <div className="relative z-10">
          <TopBar showBack title="Adventure" />
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-white/40">Adventure not found</p>
            <Button variant="secondary" className="mt-4" onClick={() => setScreen('adventures')}>Back to Adventures</Button>
          </div>
        </div>
      </div>
    );
  }

  const handleStart = () => {
    setScreen('adventure-map');
  };

  const handleQuickComplete = () => {
    recordAdventureComplete(adventure.id, adventure.xpReward, adventure.coinReward, adventure.gemReward, false);
    setScreen('home');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#33ffd6" />
      <div className="relative z-10">
        <TopBar showBack title="Adventure" showCurrencies />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-4">
          {/* Hero */}
          <GlassCard className="p-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-plasma-400 to-nova-500 flex items-center justify-center text-5xl mx-auto mb-4 shadow-glow">
              {adventure.emoji}
            </div>
            <h2 className="text-xl font-black text-white">{adventure.name}</h2>
            <p className="text-sm text-white/50 mt-2 leading-relaxed">{adventure.description}</p>
          </GlassCard>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            <GlassCard className="p-3 flex items-center gap-2">
              <Icon name="MapPin" size={18} className="text-cyan-300" />
              <div>
                <div className="text-[10px] font-bold uppercase text-white/40">Distance</div>
                <div className="text-sm font-black text-white">{adventure.distanceKm} km</div>
              </div>
            </GlassCard>
            <GlassCard className="p-3 flex items-center gap-2">
              <Icon name="Clock" size={18} className="text-white/60" />
              <div>
                <div className="text-[10px] font-bold uppercase text-white/40">Duration</div>
                <div className="text-sm font-black text-white">{adventure.durationMin} min</div>
              </div>
            </GlassCard>
            <GlassCard className="p-3 flex items-center gap-2">
              <Icon name="Gauge" size={18} className="text-ember-300" />
              <div>
                <div className="text-[10px] font-bold uppercase text-white/40">Difficulty</div>
                <div className="text-sm font-black text-white">{adventure.difficulty}</div>
              </div>
            </GlassCard>
            <GlassCard className="p-3 flex items-center gap-2">
              <Icon name="Tag" size={18} className="text-plasma-300" />
              <div>
                <div className="text-[10px] font-bold uppercase text-white/40">Theme</div>
                <div className="text-sm font-black text-white capitalize">{adventure.theme}</div>
              </div>
            </GlassCard>
          </div>

          {/* Rewards */}
          <GlassCard className="p-4">
            <div className="text-xs font-black uppercase tracking-wider text-white/60 mb-3">Rewards</div>
            <div className="flex items-center justify-around">
              <div className="flex items-center gap-2">
                <Icon name="Zap" size={20} className="text-nova-300" />
                <span className="text-sm font-black text-white">+{adventure.xpReward}</span>
                <span className="text-xs text-white/40">XP</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex items-center gap-2">
                <Icon name="Coins" size={20} className="text-gold-300" />
                <span className="text-sm font-black text-white">+{adventure.coinReward}</span>
              </div>
              {adventure.gemReward > 0 && (
                <>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex items-center gap-2">
                    <Icon name="Gem" size={20} className="text-plasma-400" />
                    <span className="text-sm font-black text-white">+{adventure.gemReward}</span>
                  </div>
                </>
              )}
            </div>
          </GlassCard>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button variant="primary" size="lg" fullWidth icon="Play" onClick={handleStart}>
              Start Adventure
            </Button>
            <Button variant="secondary" size="md" fullWidth icon="Users" onClick={() => setScreen('party')}>
              Create Party
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
