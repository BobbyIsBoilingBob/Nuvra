import { useStore } from '../store';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Pill } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { DIFFICULTY_LABELS } from '../data';

export function History() {
  const { history, toggleHistoryFavorite } = useStore();

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg />
      <TopBar title="History" showBack showCurrencies />
      <div className="relative z-10 px-4 pt-4 space-y-3">
        {history.length === 0 ? (
          <GlassCard className="p-6 text-center"><Icon name="History" size={32} className="text-white/20 mx-auto mb-2" /><p className="text-sm text-white/40">No adventures completed yet.</p><p className="text-xs text-white/30 mt-1">Start an adventure to see your history here.</p></GlassCard>
        ) : (
          history.map(h => (
            <GlassCard key={h.id} className="p-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{h.emoji}</span>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">{h.adventureName}</p>
                  <p className="text-[10px] text-white/40">{new Date(h.completedAt).toLocaleDateString()} · {h.distance.toFixed(2)} km</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/30">+{h.xpEarned}</Pill>
                    <Pill icon="Coins" accent="text-gold-300 border-gold-500/30">+{h.coinsEarned}</Pill>
                    {h.maxCombo > 0 && <Pill icon="Flame" accent="text-ember-400 border-ember-500/30">{h.maxCombo}x</Pill>}
                  </div>
                </div>
                <button onClick={() => toggleHistoryFavorite(h.id)} className="w-8 h-8 rounded-lg glass flex items-center justify-center active:scale-90 transition-transform">
                  <Icon name="Star" size={14} className={h.isFavorite ? 'text-gold-400 fill-gold-400' : 'text-white/30'} />
                </button>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
}
