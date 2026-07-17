import { useState } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Pill, Button, ProgressBar } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES } from '../cosmetics';

export function Achievements() {
  const { profile } = useAuth();
  const [category, setCategory] = useState<string>('all');
  const filtered = category === 'all' ? ACHIEVEMENTS : ACHIEVEMENTS.filter(a => a.category === category);
  const stats: Record<string, number> = {
    adventures: profile?.completed_adventures ?? 0,
    distance: profile?.distance_walked ?? 0,
    treasures: profile?.treasure_collected ?? 0,
    streak: profile?.walking_streak ?? 0,
    level: profile?.level ?? 1,
  };

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg />
      <TopBar title="Achievements" showBack showCurrencies />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button onClick={() => setCategory('all')} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${category === 'all' ? 'bg-gradient-to-r from-zeviqo-400 to-zeviqo-500 text-ink-950' : 'glass text-white/60'}`}>All</button>
          {ACHIEVEMENT_CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${category === c ? 'bg-gradient-to-r from-zeviqo-400 to-zeviqo-500 text-ink-950' : 'glasstext-white/60'}`}>{c}</button>
          ))}
        </div>
        <div className="space-y-2">
          {filtered.map(a => {
            const progress = stats[a.metric] ?? 0;
            const unlocked = progress >= a.requirement;
            return (
              <GlassCard key={a.id} className={`p-3 ${unlocked ? 'border-gold-500/30' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${unlocked ? 'bg-gold-500/20' : 'glass'}`}><Icon name={a.icon} size={18} className={unlocked ? 'text-gold-400' : 'text-white/30'} /></div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">{a.title}</p>
                    <p className="text-[10px] text-white/40">{a.description}</p>
                    <div className="mt-1.5"><ProgressBar value={Math.min(progress, a.requirement)} max={a.requirement} height={4} /></div>
                  </div>
                  <Pill accent={unlocked ? 'text-gold-300 border-gold-500/30' : 'text-white/30 border-white/10'}>{unlocked ? 'Unlocked' : `${Math.min(progress, a.requirement)}/${a.requirement}`}</Pill>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
