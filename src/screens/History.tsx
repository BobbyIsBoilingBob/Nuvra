import { useState } from 'react';
import { useStore, type AdventureHistoryEntry } from '../store';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Button, Pill, EmptyState, Modal } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { ADVENTURE_TYPES, DIFFICULTY_LABELS } from '../data';
import { formatDistance, formatDuration, formatTimeAgo } from '../lib/map-utils';
import { vibrate } from '../lib/settings';

export function History() {
  const { adventureHistory, toggleFavorite, repeatAdventure, setSelectedAdventureObj, setScreen } = useStore();
  const [detail, setDetail] = useState<AdventureHistoryEntry | null>(null);
  const [showFavOnly, setShowFavOnly] = useState(false);

  const filtered = showFavOnly ? adventureHistory.filter(h => h.isFavorite) : adventureHistory;

  const handleRepeat = (id: string) => {
    const adv = repeatAdventure(id);
    if (adv) { setSelectedAdventureObj(adv); setScreen('adventure-detail'); }
  };

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg />
      <TopBar title="History" showBack />
      <div className="relative z-10 px-4 pt-4 space-y-3">
        {adventureHistory.length > 0 && (
          <button onClick={() => setShowFavOnly(!showFavOnly)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${showFavOnly ? 'bg-gold-500 text-ink-950' : 'glass text-white/50'}`}>
            <Icon name="Star" size={10} />{showFavOnly ? 'Showing Favorites' : 'Show Favorites Only'}
          </button>
        )}

        {filtered.length === 0 ? (
          <EmptyState icon="History" title={showFavOnly ? 'No favorite adventures' : 'No adventures yet'} desc={showFavOnly ? 'Star adventures to find them here.' : 'Complete your first adventure to see it here!'} action={!showFavOnly ? <Button size="sm" icon="Compass" onClick={() => setScreen('adventures')}>Browse Adventures</Button> : undefined} />
        ) : (
          filtered.map(h => (
            <GlassCard key={h.id} className="p-4 animate-slide-up" onClick={() => setDetail(h)}>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl glass flex items-center justify-center text-2xl">{h.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-display font-bold text-white truncate">{h.adventureName}</h4>
                    <button onClick={(e) => { e.stopPropagation(); toggleFavorite(h.id); vibrate(10); }}>
                      <Icon name="Star" size={14} className={h.isFavorite ? 'text-gold-400 fill-gold-400' : 'text-white/30'} />
                    </button>
                  </div>
                  <p className="text-[10px] text-white/40">{formatTimeAgo(h.completedAt)} · {DIFFICULTY_LABELS[h.difficulty]}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Pill icon="Route">{formatDistance(h.distance)}</Pill>
                    <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/20">+{h.xpEarned}</Pill>
                    <Pill icon="Coins" accent="text-gold-300 border-gold-500/20">+{h.coinsEarned}</Pill>
                    {h.maxCombo > 0 && <Pill icon="Flame" accent="text-ember-300 border-ember-500/20">{h.maxCombo}x</Pill>}
                  </div>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      <Modal visible={detail !== null} onClose={() => setDetail(null)} title={detail?.adventureName}>
        {detail && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl glass flex items-center justify-center text-3xl">{detail.emoji}</div>
              <div>
                <p className="text-sm font-bold text-white">{detail.adventureName}</p>
                <p className="text-xs text-white/40">{ADVENTURE_TYPES.find(t => t.type === detail.type)?.label} · {DIFFICULTY_LABELS[detail.difficulty]}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-xl p-3"><p className="text-sm font-bold text-zeviqo-300">{formatDistance(detail.distance)}</p><p className="text-[10px] text-white/40">Distance</p></div>
              <div className="glass rounded-xl p-3"><p className="text-sm font-bold text-white">{formatDuration(detail.time)}</p><p className="text-[10px] text-white/40">Duration</p></div>
              <div className="glass rounded-xl p-3"><p className="text-sm font-bold text-zeviqo-300">+{detail.xpEarned} XP</p><p className="text-[10px] text-white/40">XP Earned</p></div>
              <div className="glass rounded-xl p-3"><p className="text-sm font-bold text-gold-300">+{detail.coinsEarned}</p><p className="text-[10px] text-white/40">Coins Earned</p></div>
              <div className="glass rounded-xl p-3"><p className="text-sm font-bold text-cyan-300">{detail.treasuresFound}</p><p className="text-[10px] text-white/40">Treasures</p></div>
              <div className="glass rounded-xl p-3"><p className="text-sm font-bold text-ember-300">{detail.maxCombo}x</p><p className="text-[10px] text-white/40">Max Combo</p></div>
            </div>
            <div className="flex gap-2">
              <Button fullWidth size="md" variant="secondary" icon="RefreshCw" onClick={() => handleRepeat(detail.id)}>Repeat</Button>
              <Button fullWidth size="md" variant="ghost" icon="Star" onClick={() => { toggleFavorite(detail.id); vibrate(10); }}>{detail.isFavorite ? 'Unfavorite' : 'Favorite'}</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
