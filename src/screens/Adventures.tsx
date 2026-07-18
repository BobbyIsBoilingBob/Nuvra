import { useState } from 'react';
import { getAdventures, ADVENTURE_TYPES, DIFFICULTY_LABELS, DIFFICULTY_COLORS, type AdventureType } from '../data';
import { useStore } from '../store';
import { Card, Screen, Badge, Button } from '../components/ui';
import { Map, Clock, Zap, Coins, Gem, Search } from 'lucide-react';

export default function Adventures() {
  const { setScreen, setSelectedAdventure, setSelectedAdventureObj, favoriteAdventures, toggleFavoriteAdventure } = useStore();
  const [filter, setFilter] = useState<AdventureType | 'all'>('all');
  const [search, setSearch] = useState('');
  const all = getAdventures();
  const filtered = all.filter(a => {
    if (filter !== 'all' && a.type !== filter) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openAdventure = (id: string) => {
    const adv = all.find(a => a.id === id);
    if (adv) setSelectedAdventureObj(adv);
    setSelectedAdventure(id);
    setScreen('adventure-detail');
  };

  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4">Adventures</h1>
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search adventures..."
          className="w-full bg-ink-800/60 border border-ink-600/30 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-ink-500 focus:outline-none focus:border-zeviqo-500/50" />
      </div>
      <div className="flex gap-2 mb-4 overflow-x-auto no-select pb-1">
        <button onClick={() => setFilter('all')} className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'all' ? 'bg-zeviqo-500 text-ink-950' : 'bg-ink-700/50 text-ink-400'}`}>All</button>
        {ADVENTURE_TYPES.map(t => (
          <button key={t.type} onClick={() => setFilter(t.type)} className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${filter === t.type ? 'bg-zeviqo-500 text-ink-950' : 'bg-ink-700/50 text-ink-400'}`}>{t.label}</button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map(a => (
          <Card key={a.id} className="p-4 cursor-pointer hover:border-zeviqo-500/30 transition-all" onClick={() => openAdventure(a.id)}>
            <div className="flex items-start gap-3">
              <div className="text-3xl">{a.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">{a.title}</h3>
                  <button onClick={(e) => { e.stopPropagation(); toggleFavoriteAdventure(a.id); }} className="text-ink-500 hover:text-gold-400">
                    <span className="text-lg">{favoriteAdventures.includes(a.id) ? '⭐' : '☆'}</span>
                  </button>
                </div>
                <p className="text-ink-400 text-sm mt-1 line-clamp-2">{a.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-ink-400">
                  <span className="flex items-center gap-1"><Map size={12} /> {a.distance} km</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {a.duration} min</span>
                  <span className="flex items-center gap-1"><Zap size={12} color="#00c4ff" /> {a.xp} XP</span>
                  <span className="flex items-center gap-1"><Coins size={12} color="#fbbf24" /> {a.coins}</span>
                  {a.gems > 0 && <span className="flex items-center gap-1"><Gem size={12} color="#a78bfa" /> {a.gems}</span>}
                </div>
                <div className="mt-2"><Badge color={DIFFICULTY_COLORS[a.difficulty]}>{DIFFICULTY_LABELS[a.difficulty]}</Badge></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Button variant="secondary" className="w-full mt-4" onClick={() => setScreen('ai-generator')}>Generate Custom Adventure</Button>
    </Screen>
  );
}
