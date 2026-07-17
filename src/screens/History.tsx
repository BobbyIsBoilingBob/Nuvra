import { useState, useMemo } from 'react';
import { Icon, GlassCard, Pill, Button, EmptyState, Modal } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { formatDistance, formatDuration } from '../lib/map-utils';
import type { AdventureHistoryEntry } from '../store';

export function History(): React.ReactElement {
  const { adventureHistory, toggleFavorite, repeatAdventure, setScreen, setSelectedAdventure, setSelectedAdventureObj } = useStore();
  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [detailEntry, setDetailEntry] = useState<AdventureHistoryEntry | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'favorites') return adventureHistory.filter(h => h.isFavorite);
    return adventureHistory;
  }, [adventureHistory, filter]);

  const handleRepeat = (entry: AdventureHistoryEntry) => {
    const adventure = repeatAdventure(entry.id);
    if (adventure) {
      setSelectedAdventure(adventure.id);
      setSelectedAdventureObj(adventure);
      setScreen('adventure-detail');
    }
  };

  const formatDate = (timestamp: number): string => {
    const d = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#22d3ee" />
      <div className="relative z-10">
        <TopBar showBack title="Adventure History" showCurrencies />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-4">
          {/* Filter tabs */}
          <div className="flex gap-2 p-1 glass rounded-2xl">
            <button onClick={() => setFilter('all')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${filter==='all'?'bg-gradient-to-r from-cyan-400 to-nova-500 text-ink-950':'text-white/50'}`}>All ({adventureHistory.length})</button>
            <button onClick={() => setFilter('favorites')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${filter==='favorites'?'bg-gradient-to-r from-cyan-400 to-nova-500 text-ink-950':'text-white/50'}`}>Favorites ({adventureHistory.filter(h=>h.isFavorite).length})</button>
          </div>

          {/* History list */}
          {filtered.length === 0 ? (
            <EmptyState
              icon={filter === 'favorites' ? 'Heart' : 'History'}
              title={filter === 'favorites' ? 'No favorites yet' : 'No adventures yet'}
              desc={filter === 'favorites' ? 'Tap the heart icon on completed adventures to save them here.' : 'Complete your first adventure to see it appear in your history.'}
              action={filter === 'all' ? <Button size="sm" variant="secondary" icon="Compass" onClick={() => setScreen('adventures')}>Browse Adventures</Button> : undefined}
            />
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map(entry => (
                <GlassCard key={entry.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-plasma-400/30 to-nova-500/30 flex items-center justify-center text-2xl flex-shrink-0">{entry.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white truncate">{entry.adventureName}</span>
                        <button onClick={() => toggleFavorite(entry.id)} aria-label="Toggle favorite" className="flex-shrink-0">
                          <Icon name={entry.isFavorite ? 'Heart' : 'Heart'} size={16} className={entry.isFavorite ? 'text-rose-400 fill-current' : 'text-white/30'} />
                        </button>
                      </div>
                      <div className="text-xs text-white/40 mt-0.5">{formatDate(entry.completedAt)}</div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Pill icon="MapPin" accent="text-cyan-300 border-cyan-500/30">{formatDistance(entry.distance)}</Pill>
                        <Pill icon="Clock" accent="text-white/60 border-white/10">{formatDuration(entry.time)}</Pill>
                        <Pill icon="Zap" accent="text-nova-300 border-nova-500/30">+{entry.xpEarned}</Pill>
                        <Pill icon="Coins" accent="text-gold-300 border-gold-500/30">+{entry.coinsEarned}</Pill>
                      </div>
                      {entry.players.length > 1 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Icon name="Users" size={12} className="text-plasma-300" />
                          <span className="text-[10px] text-white/40">{entry.players.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button variant="secondary" size="sm" icon="Eye" onClick={() => setDetailEntry(entry)}>Details</Button>
                    <Button variant="ghost" size="sm" icon="RotateCcw" onClick={() => handleRepeat(entry)}>Repeat</Button>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal visible={detailEntry !== null} onClose={() => setDetailEntry(null)} title="Adventure Details">
        {detailEntry && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-plasma-400/30 to-nova-500/30 flex items-center justify-center text-3xl">{detailEntry.emoji}</div>
              <div>
                <div className="text-base font-black text-white">{detailEntry.adventureName}</div>
                <div className="text-xs text-white/40">{new Date(detailEntry.completedAt).toLocaleString()}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="glass rounded-xl p-3"><div className="text-[10px] font-bold uppercase text-white/40">Distance</div><div className="text-sm font-black text-white">{formatDistance(detailEntry.distance)}</div></div>
              <div className="glass rounded-xl p-3"><div className="text-[10px] font-bold uppercase text-white/40">Time</div><div className="text-sm font-black text-white">{formatDuration(detailEntry.time)}</div></div>
              <div className="glass rounded-xl p-3"><div className="text-[10px] font-bold uppercase text-white/40">XP Earned</div><div className="text-sm font-black text-nova-300">+{detailEntry.xpEarned}</div></div>
              <div className="glass rounded-xl p-3"><div className="text-[10px] font-bold uppercase text-white/40">Coins Earned</div><div className="text-sm font-black text-gold-300">+{detailEntry.coinsEarned}</div></div>
              <div className="glass rounded-xl p-3"><div className="text-[10px] font-bold uppercase text-white/40">Gems</div><div className="text-sm font-black text-plasma-400">+{detailEntry.gemsEarned}</div></div>
              <div className="glass rounded-xl p-3"><div className="text-[10px] font-bold uppercase text-white/40">Treasures</div><div className="text-sm font-black text-white">{detailEntry.treasuresFound}</div></div>
              <div className="glass rounded-xl p-3"><div className="text-[10px] font-bold uppercase text-white/40">Max Combo</div><div className="text-sm font-black text-ember-300">{detailEntry.maxCombo}x</div></div>
              <div className="glass rounded-xl p-3"><div className="text-[10px] font-bold uppercase text-white/40">Type</div><div className="text-sm font-black text-white capitalize">{detailEntry.type.replace('_',' ')}</div></div>
            </div>
            {detailEntry.players.length > 0 && (
              <div>
                <div className="text-xs font-bold text-white/60 mb-1">Players</div>
                <div className="flex flex-wrap gap-2">
                  {detailEntry.players.map((p, i) => <Pill key={i} icon="User" accent="text-plasma-300 border-plasma-500/30">{p}</Pill>)}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" fullWidth icon={detailEntry.isFavorite ? 'Heart' : 'Heart'} onClick={() => { toggleFavorite(detailEntry.id); setDetailEntry({...detailEntry, isFavorite: !detailEntry.isFavorite}); }}>
                {detailEntry.isFavorite ? 'Unfavorite' : 'Favorite'}
              </Button>
              <Button variant="primary" size="sm" fullWidth icon="RotateCcw" onClick={() => { handleRepeat(detailEntry); setDetailEntry(null); }}>Repeat</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
