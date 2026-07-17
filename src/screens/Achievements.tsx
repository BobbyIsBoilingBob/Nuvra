import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, ProgressBar, Pill } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { ACHIEVEMENTS, type Achievement } from '../data';

const CATEGORIES = [
  { key: 'all', label: 'All', icon: 'Award' },
  { key: 'milestones', label: 'Milestones', icon: 'Flag' },
  { key: 'exploration', label: 'Exploration', icon: 'Compass' },
  { key: 'fitness', label: 'Fitness', icon: 'Flame' },
  { key: 'collection', label: 'Collection', icon: 'Gem' },
  { key: 'social', label: 'Social', icon: 'Users' }
] as const;

const TIER_STYLES: Record<string, { color: string; label: string }> = {
  bronze: { color: 'text-amber-600', label: 'Bronze' },
  silver: { color: 'text-gray-300', label: 'Silver' },
  gold: { color: 'text-gold-400', label: 'Gold' },
  platinum: { color: 'text-cyan-300', label: 'Platinum' }
};

export function Achievements() {
  const { profile } = useAuth();
  const [cat, setCat] = useState<string>('all');

  const getValue = (a: Achievement): number => {
    if (!profile) return 0;
    if (a.metric === 'distance') return profile.distance_walked;
    if (a.metric === 'adventures') return profile.completed_adventures;
    if (a.metric === 'streak') return profile.walking_streak;
    if (a.metric === 'treasures') return profile.treasure_collected;
    if (a.metric === 'challenges') return profile.completed_challenges;
    if (a.metric === 'level') return profile.level;
    if (a.metric === 'friends') return 0;
    return 0;
  };

  const filtered = ACHIEVEMENTS.filter(a => cat === 'all' || a.category === cat);
  const unlocked = filtered.filter(a => getValue(a) >= a.requirement).length;

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg />
      <TopBar title="Achievements" showBack />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        <GlassCard className="p-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40">Unlocked</p>
              <p className="text-xl font-display font-bold text-white">{unlocked} <span className="text-sm text-white/40">/ {ACHIEVEMENTS.length}</span></p>
            </div>
            <div className="w-12 h-12 rounded-xl glass flex items-center justify-center"><Icon name="Trophy" size={22} className="text-gold-400" /></div>
          </div>
        </GlassCard>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(c => (
            <button key={c.key} onClick={() => setCat(c.key)} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${cat===c.key?'bg-zeviqo-500 text-ink-950':'glass text-white/50'}`}>{c.label}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filtered.map(a => {
            const value = getValue(a);
            const done = value >= a.requirement;
            const tier = TIER_STYLES[a.tier];
            return (
              <GlassCard key={a.id} className={`p-4 animate-slide-up ${done ? 'border-zeviqo-500/20' : ''}`}>
                <div className="flex items-start gap-3 mb-2">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${done ? 'bg-zeviqo-500/20' : 'glass'}`}>
                    <Icon name={a.icon} size={20} className={done ? 'text-zeviqo-400' : 'text-white/30'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-display font-bold text-white">{a.title}</h4>
                    <p className="text-[11px] text-white/40">{a.description}</p>
                  </div>
                  <Pill accent={`${tier.color} border-current/20`}>{tier.label}</Pill>
                </div>
                <div className="flex items-center justify-between text-[10px] text-white/40 mb-1">
                  <span>{Math.min(value, a.requirement).toLocaleString()} / {a.requirement.toLocaleString()}</span>
                  {done && <Icon name="Check" size={12} className="text-emerald-400" />}
                </div>
                <ProgressBar value={value} max={a.requirement} colorClass={done ? 'from-emerald-400 to-emerald-500' : 'from-zeviqo-400 to-zeviqo-500'} />
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
