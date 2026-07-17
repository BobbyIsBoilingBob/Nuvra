import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar, BottomNav } from '../components/BottomNav';
import { GlassCard, Icon, Pill } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '../data';

export function History() {
  const { history, toggleHistoryFavorite } = useStore();
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg />
      <TopBar title="History" showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-3 space-y-3">
        {history.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <Icon name="History" size={32} className="text-white/30 mx-auto mb-2" />
            <p className="text-sm text-white/40">No adventures completed yet</p>
            <p className="text-[10px] text-white/30 mt-1">Start an adventure to see it here!</p>
          </GlassCard>
        ) : (
          history.map(h => (
            <GlassCard key={h.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-3xl flex-shrink-0">{h.emoji ?? '🧭'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-white truncate">{h.adventure_name}</p>
                    <button
                      onClick={() => user && toggleHistoryFavorite(h.id, user.id)}
                      className="flex-shrink-0 active:scale-90 transition-transform"
                    >
                      <Icon
                        name="Star"
                        size={16}
                        className={h.is_favorite ? 'text-gold-400' : 'text-white/30'}
                        style={h.is_favorite ? { fill: '#fbbf24' } : undefined}
                      />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {h.difficulty && (
                      <Pill accent="text-white/60 border-white/10">
                        <span style={{ color: DIFFICULTY_COLORS[h.difficulty as keyof typeof DIFFICULTY_COLORS] }}>
                          {DIFFICULTY_LABELS[h.difficulty as keyof typeof DIFFICULTY_LABELS] ?? h.difficulty}
                        </span>
                      </Pill>
                    )}
                    <Pill icon="Route">{h.distance.toFixed(2)} km</Pill>
                    <Pill icon="Clock">{Math.floor(h.duration / 60)}m</Pill>
                    <Pill icon="Zap" accent="text-zeviqo-300 border-zeviqo-500/30">+{h.xp_earned} XP</Pill>
                    <Pill icon="Coins" accent="text-gold-400 border-gold-500/30">+{h.coins_earned}</Pill>
                    {h.gems_earned > 0 && <Pill icon="Gem" accent="text-zeviqo-300 border-zeviqo-500/30">+{h.gems_earned}</Pill>}
                    {h.max_combo > 0 && <Pill icon="Flame" accent="text-ember-400 border-ember-500/30">{h.max_combo}x</Pill>}
                  </div>
                  <p className="text-[10px] text-white/30 mt-2">
                    {new Date(h.completed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
      <BottomNav />
    </div>
  );
}
