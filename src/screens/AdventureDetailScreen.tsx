import { useStore } from '../store';
import { AdventureBg } from '../components/AdventureBg';
import { Icon, GlassCard, DifficultyBadge } from '../components/ui';
import { ADVENTURE_TYPE_META, CHALLENGES, TREASURE_RARITY_MAP, type MapCheckpoint } from '../data';

const KIND_ICON: Record<MapCheckpoint['kind'], string> = { start: 'Flag', challenge: 'Swords', treasure: 'Gem', finish: 'Trophy' };
const KIND_COLOR: Record<MapCheckpoint['kind'], string> = { start: 'from-nova-300 to-nova-500', challenge: 'from-ember-400 to-ember-600', treasure: 'from-gold-300 to-gold-500', finish: 'from-plasma-400 to-nova-500' };

export function AdventureDetailScreen() {
  const { adventures, selectedAdventureId, go, startAdventure, toggleSave, dailyAdventure, weeklyAdventure, savedAdventures } = useStore();
  const adv = adventures.find((a) => a.id === selectedAdventureId) ?? savedAdventures.find((a) => a.id === selectedAdventureId) ?? (selectedAdventureId === dailyAdventure.id ? dailyAdventure : null) ?? (selectedAdventureId === weeklyAdventure.id ? weeklyAdventure : null);

  if (!adv) {
    return (<div className="relative min-h-screen flex items-center justify-center"><AdventureBg /><div className="relative z-10 text-center"><p className="text-slate-400">Adventure not found</p><button onClick={() => go('adventures')} className="btn-glow mt-4 px-6 py-3">Back to Adventures</button></div></div>);
  }

  const typeMeta = ADVENTURE_TYPE_META[adv.type];
  const includedChallenges = CHALLENGES.filter((c) => adv.challenges.includes(c.id));

  return (
    <div className="relative min-h-screen pb-28 overflow-hidden">
      <AdventureBg />
      <div className="relative z-10 mx-auto max-w-md px-5 pt-12">
        <div className="flex items-center gap-3 animate-rise">
          <button onClick={() => go('adventures')} className="glass rounded-2xl w-10 h-10 flex items-center justify-center text-slate-200"><Icon name="ArrowLeft" size={18} /></button>
          <button onClick={() => toggleSave(adv.id)} className="glass rounded-2xl w-10 h-10 flex items-center justify-center ml-auto"><Icon name="Bookmark" size={18} className={adv.saved ? 'text-nova-300' : 'text-slate-300'} /></button>
          <button className="glass rounded-2xl w-10 h-10 flex items-center justify-center text-slate-300"><Icon name="Share2" size={18} /></button>
        </div>
        <div className="mt-5 relative rounded-3xl overflow-hidden glass-strong animate-rise">
          <div className="relative h-52 overflow-hidden">
            <img src={adv.image} alt={adv.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent" />
            <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap">
              <span className="chip bg-ink-900/70 backdrop-blur-md border border-white/10 text-nova-300"><Icon name={typeMeta.icon} size={12} /> {typeMeta.label}</span>
              {adv.isAIGenerated && <span className="chip bg-plasma-500/20 backdrop-blur-md border border-plasma-500/40 text-plasma-300"><Icon name="Sparkles" size={12} /> AI</span>}
              {adv.isDaily && <span className="chip bg-gold-400/20 backdrop-blur-md border border-gold-400/40 text-gold-300"><Icon name="Star" size={12} /> Daily x{adv.bonusMultiplier}</span>}
              {adv.isWeekly && <span className="chip bg-plasma-500/20 backdrop-blur-md border border-plasma-500/40 text-plasma-300"><Icon name="Trophy" size={12} /> Weekly x{adv.bonusMultiplier}</span>}
            </div>
            <div className="absolute top-3 right-3"><DifficultyBadge difficulty={adv.difficulty} /></div>
            <div className="absolute bottom-3 inset-x-4">
              <h1 className="font-display text-2xl font-extrabold text-white">{adv.name}</h1>
              <div className="mt-1 flex items-center gap-3 text-xs text-slate-300">
                <span className="flex items-center gap-1"><Icon name="Footprints" size={12} /> {adv.distanceKm} km</span><span className="flex items-center gap-1"><Icon name="Clock" size={12} /> {adv.durationMin} min</span>
                {adv.rating > 0 && <span className="flex items-center gap-1 text-gold-300"><Icon name="Star" size={12} /> {adv.rating}</span>}
                {adv.plays > 0 && <span className="flex items-center gap-1"><Icon name="Users" size={12} /> {adv.plays.toLocaleString()}</span>}
              </div>
            </div>
          </div>
        </div>
        <GlassCard className="mt-4 p-4 animate-rise"><h2 className="section-title mb-2">About this adventure</h2><p className="text-sm text-slate-300 leading-relaxed">{adv.description}</p></GlassCard>
        <div className="mt-4 grid grid-cols-2 gap-3 stagger">
          <StatTile icon="Footprints" label="Distance" value={`${adv.distanceKm} km`} accent="text-nova-300" />
          <StatTile icon="Clock" label="Duration" value={`${adv.durationMin} min`} accent="text-cyan-300" />
          <StatTile icon="Zap" label="XP Reward" value={`+${adv.xpReward}`} accent="text-nova-300" />
          <StatTile icon="Coins" label="Coin Reward" value={`+${adv.coinReward}`} accent="text-gold-300" />
        </div>

        {/* Phase 7: Treasure rarities preview */}
        <div className="mt-6">
          <h2 className="section-title mb-3">Treasures to Find</h2>
          <div className="flex flex-col gap-2.5 stagger">
            {adv.treasures.map((t) => {
              const r = TREASURE_RARITY_MAP[t.rarity];
              return (
                <div key={t.id} className="glass rounded-2xl p-3 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${r.accent} flex items-center justify-center shrink-0 ${r.glowClass}`}><Icon name="Gem" size={18} className="text-ink-950" /></div>
                  <div className="flex-1"><p className="text-sm font-semibold text-white">{r.label} Chest</p><p className="text-[11px] text-slate-400">+{t.coins} coins · +{t.xp} XP</p></div>
                  <span className="chip !px-2 !py-0.5 !text-[10px]" style={{ background: `${r.color}20`, color: r.color }}>{r.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6"><h2 className="section-title mb-3">Route Checkpoints</h2>
          <div className="flex flex-col gap-2.5 stagger">{adv.checkpoints.map((cp) => (
            <div key={cp.id} className="glass rounded-2xl p-3 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${KIND_COLOR[cp.kind]} flex items-center justify-center shrink-0`}><Icon name={KIND_ICON[cp.kind]} size={18} className="text-ink-950" /></div>
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-white">{cp.label}</p><p className="text-[11px] text-slate-500 capitalize">{cp.kind}</p></div>
              {cp.reward > 0 && <span className="chip bg-gold-400/15 text-gold-300"><Icon name="Coins" size={12} /> {cp.reward}</span>}
            </div>
          ))}</div>
        </div>

        {/* Phase 7: Challenges with categories */}
        <div className="mt-6"><h2 className="section-title mb-3">Challenges Included</h2>
          <div className="flex flex-col gap-3 stagger">{includedChallenges.map((c) => (
            <div key={c.id} className="glass rounded-2xl p-3.5 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.accent} flex items-center justify-center shrink-0`}><Icon name={c.icon} size={18} className="text-ink-950" /></div>
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-white">{c.title}</p><p className="text-[11px] text-slate-400 truncate">{c.description}</p><span className="chip bg-white/5 text-slate-400 !px-2 !py-0.5 !text-[9px] mt-1">{c.tag}</span></div>
              <span className="chip bg-gold-400/15 text-gold-300 !px-2 !py-0.5 !text-[10px]">+{c.baseReward}</span>
            </div>
          ))}</div>
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={() => toggleSave(adv.id)} className="glass rounded-2xl px-5 py-3.5 font-semibold text-slate-200 active:scale-95 flex items-center gap-2"><Icon name={adv.saved ? 'BookmarkCheck' : 'Bookmark'} size={18} className={adv.saved ? 'text-nova-300' : ''} />{adv.saved ? 'Saved' : 'Save'}</button>
          <button onClick={() => startAdventure(adv.id)} className="btn-glow flex-1 py-3.5">Start Adventure <Icon name="Play" size={18} /></button>
        </div>
      </div>
    </div>
  );
}

function StatTile({ icon, label, value, accent }: { icon: string; label: string; value: string; accent: string }) {
  return (<div className="glass rounded-2xl p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0"><Icon name={icon} size={20} className={accent} /></div><div><p className="font-display text-base font-bold text-white">{value}</p><p className="text-[10px] text-slate-400">{label}</p></div></div>);
}
