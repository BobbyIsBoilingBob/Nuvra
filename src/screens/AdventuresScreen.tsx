import { useState } from 'react';
import { useStore } from '../store';
import { AdventureBg } from '../components/AdventureBg';
import { Icon, GlassCard, DifficultyBadge } from '../components/ui';
import { ADVENTURE_TYPE_META, type Adventure, type AdventureType } from '../data';

type Tab = 'recommended' | 'completed' | 'saved';

export function AdventuresScreen() {
  const { adventures, selectAdventure, go, savedAdventures, dailyAdventure, weeklyAdventure } = useStore();
  const [tab, setTab] = useState<Tab>('recommended');
  const featured = adventures[0];
  const recommended = adventures.filter((a) => !a.completed);
  const completed = adventures.filter((a) => a.completed);
  const saved = savedAdventures.length > 0 ? savedAdventures : adventures.filter((a) => a.saved);
  const tabs: { id: Tab; label: string; icon: string; count: number }[] = [
    { id: 'recommended', label: 'Recommended', icon: 'Sparkles', count: recommended.length },
    { id: 'completed', label: 'Completed', icon: 'CheckCircle', count: completed.length },
    { id: 'saved', label: 'Saved', icon: 'Bookmark', count: saved.length },
  ];
  const list = tab === 'recommended' ? recommended : tab === 'completed' ? completed : saved;

  return (
    <div className="relative min-h-screen pb-28 overflow-hidden">
      <AdventureBg />
      <div className="relative z-10 mx-auto max-w-md px-5 pt-12">
        <div className="flex items-center gap-3 animate-rise">
          <button onClick={() => go('home')} className="glass rounded-2xl w-10 h-10 flex items-center justify-center text-slate-200"><Icon name="ArrowLeft" size={18} /></button>
          <div><h1 className="font-display text-2xl font-extrabold text-white">Adventures</h1><p className="text-xs text-slate-400">Choose your next quest</p></div>
        </div>

        <button onClick={() => go('ai-generator')} className="mt-5 w-full glass-strong rounded-2xl p-4 flex items-center gap-3 hover:border-plasma-400/40 transition-all animate-rise">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-plasma-400 to-nova-500 flex items-center justify-center shadow-glow shrink-0"><Icon name="Sparkles" size={24} className="text-ink-950" /></div>
          <div className="flex-1 text-left"><p className="font-display text-sm font-bold text-white">Generate AI Adventure</p><p className="text-xs text-slate-400">Personalised just for you</p></div>
          <Icon name="ArrowRight" size={18} className="text-plasma-400" />
        </button>

        {featured && (<div className="mt-5 animate-rise" onClick={() => selectAdventure(featured.id)}><FeaturedCard adventure={featured} /></div>)}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div onClick={() => selectAdventure(dailyAdventure.id)} className="glass rounded-2xl p-3 cursor-pointer hover:border-gold-400/30 transition-all">
            <div className="flex items-center gap-2 mb-1"><Icon name="Star" size={14} className="text-gold-300" /><span className="text-[10px] font-bold text-gold-300">DAILY x{dailyAdventure.bonusMultiplier}</span></div>
            <p className="text-xs font-bold text-white truncate">{dailyAdventure.name}</p>
            <p className="text-[10px] text-slate-400">{dailyAdventure.distanceKm} km · {dailyAdventure.durationMin} min</p>
          </div>
          <div onClick={() => selectAdventure(weeklyAdventure.id)} className="glass rounded-2xl p-3 cursor-pointer hover:border-plasma-400/30 transition-all">
            <div className="flex items-center gap-2 mb-1"><Icon name="Trophy" size={14} className="text-plasma-300" /><span className="text-[10px] font-bold text-plasma-300">WEEKLY x{weeklyAdventure.bonusMultiplier}</span></div>
            <p className="text-xs font-bold text-white truncate">{weeklyAdventure.name}</p>
            <p className="text-[10px] text-slate-400">{weeklyAdventure.distanceKm} km · {weeklyAdventure.durationMin} min</p>
          </div>
        </div>

        <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {(Object.keys(ADVENTURE_TYPE_META) as AdventureType[]).map((t) => {
            const meta = ADVENTURE_TYPE_META[t];
            return (<div key={t} className="glass rounded-full px-3 py-2 flex items-center gap-1.5 shrink-0"><Icon name={meta.icon} size={14} className="text-nova-300" /><span className="text-xs font-semibold text-slate-200">{meta.label}</span></div>);
          })}
        </div>

        <div className="mt-4 glass rounded-2xl p-1.5 flex">
          {tabs.map((t) => (<button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${tab === t.id ? 'bg-gradient-to-r from-nova-300 to-nova-500 text-ink-950 shadow-glow' : 'text-slate-400 hover:text-slate-200'}`}><Icon name={t.icon} size={14} />{t.label}<span className={`text-[10px] ${tab === t.id ? 'text-ink-700' : 'text-slate-500'}`}>{t.count}</span></button>))}
        </div>

        <div className="mt-5 stagger">
          {list.length === 0 ? (<div className="glass rounded-2xl p-8 text-center"><Icon name="Compass" size={32} className="mx-auto text-slate-500" /><p className="mt-3 text-sm text-slate-400">{tab === 'completed' ? 'No completed adventures yet' : tab === 'saved' ? 'No saved adventures yet' : 'No adventures found'}</p></div>) : (<div className="flex flex-col gap-3">{list.map((adv) => <AdventureCard key={adv.id} adventure={adv} onClick={() => selectAdventure(adv.id)} />)}</div>)}
        </div>
      </div>
    </div>
  );
}

function FeaturedCard({ adventure }: { adventure: Adventure }) {
  const typeMeta = ADVENTURE_TYPE_META[adventure.type];
  return (
    <div className="relative rounded-3xl overflow-hidden glass-strong cursor-pointer hover:border-white/25 transition-all group">
      <div className="relative h-44 overflow-hidden">
        <img src={adventure.image} alt={adventure.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-2"><span className="chip bg-ember-500/20 backdrop-blur-md border border-ember-500/40 text-ember-300"><Icon name="Flame" size={12} /> Featured</span><span className="chip bg-ink-900/70 backdrop-blur-md border border-white/10 text-nova-300"><Icon name={typeMeta.icon} size={12} /> {typeMeta.label}</span></div>
        <div className="absolute top-3 right-3"><DifficultyBadge difficulty={adventure.difficulty} /></div>
        <div className="absolute bottom-3 inset-x-3"><h2 className="font-display text-2xl font-extrabold text-white">{adventure.name}</h2><div className="mt-1 flex items-center gap-3 text-xs text-slate-300"><span className="flex items-center gap-1"><Icon name="Footprints" size={12} /> {adventure.distanceKm} km</span><span className="flex items-center gap-1"><Icon name="Clock" size={12} /> {adventure.durationMin} min</span><span className="flex items-center gap-1 text-nova-300"><Icon name="Star" size={12} /> {adventure.rating}</span></div></div>
      </div>
      <div className="p-4 flex items-center justify-between"><div className="flex items-center gap-3"><span className="chip bg-nova-400/15 text-nova-300"><Icon name="Zap" size={12} /> +{adventure.xpReward} XP</span><span className="chip bg-gold-400/15 text-gold-300"><Icon name="Coins" size={12} /> +{adventure.coinReward}</span></div><button className="btn-glow px-5 py-2 text-sm">Start <Icon name="Play" size={14} /></button></div>
    </div>
  );
}

function AdventureCard({ adventure, onClick }: { adventure: Adventure; onClick: () => void }) {
  const typeMeta = ADVENTURE_TYPE_META[adventure.type];
  return (
    <GlassCard onClick={onClick} className="overflow-hidden">
      <div className="flex">
        <div className="relative w-24 h-auto shrink-0 overflow-hidden"><img src={adventure.image} alt={adventure.name} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-gradient-to-r from-transparent to-ink-900/80" /></div>
        <div className="flex-1 p-3.5 min-w-0">
          <div className="flex items-center gap-2 mb-1"><span className="chip bg-ink-900/70 border border-white/10 text-nova-300 !px-2 !py-0.5 !text-[10px]"><Icon name={typeMeta.icon} size={10} /> {typeMeta.label}</span>{adventure.completed && <span className="chip bg-nova-400/15 text-nova-400 !px-2 !py-0.5 !text-[10px]"><Icon name="Check" size={10} /> Done</span>}{adventure.isAIGenerated && <span className="chip bg-plasma-500/15 text-plasma-300 !px-2 !py-0.5 !text-[10px]"><Icon name="Sparkles" size={10} /> AI</span>}</div>
          <h3 className="font-display text-sm font-bold text-white truncate">{adventure.name}</h3>
          <div className="mt-1 flex items-center gap-2.5 text-[11px] text-slate-400"><span className="flex items-center gap-1"><Icon name="Footprints" size={11} /> {adventure.distanceKm} km</span><span className="flex items-center gap-1"><Icon name="Clock" size={11} /> {adventure.durationMin} min</span></div>
          <div className="mt-2 flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-[11px] font-bold text-nova-300">+{adventure.xpReward} XP</span><span className="text-[11px] font-bold text-gold-300">+{adventure.coinReward}</span></div><DifficultyBadge difficulty={adventure.difficulty} /></div>
        </div>
      </div>
    </GlassCard>
  );
}
