import { useMemo } from 'react';
import { Icon, GlassCard, Pill, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { RoutePreview } from '../components/RoutePreview';
import { useStore } from '../store';
import { ADVENTURES, ADVENTURE_THEMES } from '../data';

export function AdventureDetail(): React.ReactElement {
  const { selectedAdventureId, selectedAdventure, setScreen } = useStore();

  const adventure = useMemo(() => {
    if (selectedAdventure) return selectedAdventure;
    return ADVENTURES.find(a => a.id === selectedAdventureId) ?? null;
  }, [selectedAdventure, selectedAdventureId]);

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

  const theme = ADVENTURE_THEMES.find(t => t.id === adventure.theme);
  const accent = theme?.accent ?? '#33ffd6';

  const handleStart = () => setScreen('adventure-map');

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent={accent} />
      <div className="relative z-10">
        <TopBar showBack title="Adventure" showCurrencies />
        <div className="px-4 max-w-md mx-auto flex flex-col gap-4">
          {/* Hero */}
          <GlassCard className="p-6 text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-plasma-400 to-nova-500 flex items-center justify-center text-5xl mx-auto mb-4 shadow-glow">{adventure.emoji}</div>
            <h2 className="text-xl font-black text-white">{adventure.name}</h2>
            <p className="text-sm text-white/50 mt-2 leading-relaxed">{adventure.description}</p>
            {adventure.isGenerated && <div className="mt-2"><Pill icon="Sparkles" accent="text-gold-300 border-gold-500/30">AI Generated</Pill></div>}
          </GlassCard>

          {/* Route Preview */}
          {adventure.routePreview && adventure.routePreview.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white/60 mb-2">Route Preview</h3>
              <RoutePreview route={adventure.routePreview} accent={accent} height={180} />
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <GlassCard className="p-3 flex items-center gap-2">
              <Icon name="MapPin" size={18} className="text-cyan-300" />
              <div><div className="text-[10px] font-bold uppercase text-white/40">Distance</div><div className="text-sm font-black text-white">{adventure.distanceKm} km</div></div>
            </GlassCard>
            <GlassCard className="p-3 flex items-center gap-2">
              <Icon name="Clock" size={18} className="text-white/60" />
              <div><div className="text-[10px] font-bold uppercase text-white/40">Duration</div><div className="text-sm font-black text-white">{adventure.durationMin} min</div></div>
            </GlassCard>
            <GlassCard className="p-3 flex items-center gap-2">
              <Icon name="Flame" size={18} className="text-ember-300" />
              <div><div className="text-[10px] font-bold uppercase text-white/40">Calories</div><div className="text-sm font-black text-white">~{adventure.caloriesEstimate}</div></div>
            </GlassCard>
            <GlassCard className="p-3 flex items-center gap-2">
              <Icon name="Gauge" size={18} className="text-ember-300" />
              <div><div className="text-[10px] font-bold uppercase text-white/40">Difficulty</div><div className="text-sm font-black text-white">{adventure.difficulty}</div></div>
            </GlassCard>
            <GlassCard className="p-3 flex items-center gap-2">
              <Icon name="Map" size={18} className="text-plasma-300" />
              <div><div className="text-[10px] font-bold uppercase text-white/40">Terrain</div><div className="text-sm font-black text-white">{adventure.terrain}</div></div>
            </GlassCard>
            <GlassCard className="p-3 flex items-center gap-2">
              <Icon name="Compass" size={18} className="text-nova-300" />
              <div><div className="text-[10px] font-bold uppercase text-white/40">Type</div><div className="text-sm font-black text-white capitalize">{adventure.type.replace('_',' ')}</div></div>
            </GlassCard>
          </div>

          {/* Objectives */}
          {adventure.objectives.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white/60 mb-2">Objectives</h3>
              <div className="flex flex-col gap-2">
                {adventure.objectives.map(obj => (
                  <GlassCard key={obj.id} className="p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl glass flex items-center justify-center flex-shrink-0"><Icon name={obj.icon} size={16} className="text-nova-300" /></div>
                    <div className="flex-1"><div className="text-sm font-bold text-white">{obj.label}</div></div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

          {/* Reward Preview */}
          <GlassCard className="p-4">
            <div className="text-xs font-black uppercase tracking-wider text-white/60 mb-3">Reward Preview</div>
            <div className="flex items-center justify-around">
              <div className="flex items-center gap-2"><Icon name="Zap" size={20} className="text-nova-300" /><span className="text-sm font-black text-white">+{adventure.xpReward}</span><span className="text-xs text-white/40">XP</span></div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex items-center gap-2"><Icon name="Coins" size={20} className="text-gold-300" /><span className="text-sm font-black text-white">+{adventure.coinReward}</span></div>
              {adventure.gemReward > 0 && (<><div className="w-px h-8 bg-white/10" /><div className="flex items-center gap-2"><Icon name="Gem" size={20} className="text-plasma-400" /><span className="text-sm font-black text-white">+{adventure.gemReward}</span></div></>)}
            </div>
          </GlassCard>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button variant="primary" size="lg" fullWidth icon="Play" onClick={handleStart}>Start Adventure</Button>
            <Button variant="secondary" size="md" fullWidth icon="Users" onClick={() => setScreen('party')}>Create Party</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
