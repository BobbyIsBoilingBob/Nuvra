import { useState } from 'react';
import { Icon, GlassCard, Pill, SectionTitle, ProgressBar } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  type AchievementCategory,
  BADGES,
  getLevelProgress,
  LEVELS,
} from '../adventure-model';

const CATEGORY_ACCENTS: Record<AchievementCategory, string> = {
  Explorer: 'from-nova-400 to-cyan-500',
  Collector: 'from-gold-300 to-ember-500',
  Adventure: 'from-ember-400 to-rose-500',
  Community: 'from-plasma-400 to-nova-500',
  Seasonal: 'from-green-400 to-nova-500',
  Master: 'from-rose-400 to-plasma-500',
};

const TIER_META: Record<string, { label: string; color: string }> = {
  bronze: { label: 'Bronze', color: 'text-amber-600' },
  silver: { label: 'Silver', color: 'text-slate-300' },
  gold: { label: 'Gold', color: 'text-gold-300' },
  legendary: { label: 'Legendary', color: 'text-plasma-300' },
};

export function Rewards(): React.ReactElement {
  const { profile } = useStore();
  const [activeCategory, setActiveCategory] = useState<AchievementCategory>('Explorer');

  const levelProgress = getLevelProgress(profile.xp);
  const unlockedCount = ACHIEVEMENTS.filter((a) => a.unlocked).length;
  const totalCount = ACHIEVEMENTS.length;

  const filteredAchievements = ACHIEVEMENTS.filter((a) => a.category === activeCategory);
  const categoryUnlocked = ACHIEVEMENTS.filter(
    (a) => a.category === activeCategory && a.unlocked,
  ).length;
  const categoryTotal = ACHIEVEMENTS.filter((a) => a.category === activeCategory).length;
  const categoryPct = categoryTotal > 0 ? Math.round((categoryUnlocked / categoryTotal) * 100) : 0;

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg variant="cyber" accent="#fbbf24" />

      <div className="relative z-10">
        <TopBar showBack title="Rewards & Achievements" />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-5">
          {/* Level progress card */}
          <GlassCard className="p-5">
            <SectionTitle icon="TrendingUp" accent="text-nova-300">
              Level Progress
            </SectionTitle>
            <div className="mt-4 flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-nova-400 to-cyan-500 flex items-center justify-center text-3xl flex-shrink-0">
                {levelProgress.info.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between">
                  <div className="text-lg font-black text-white">
                    Level {levelProgress.info.level}
                  </div>
                  <div className="text-xs font-bold text-nova-300">
                    {levelProgress.info.title}
                  </div>
                </div>
                <div className="mt-2">
                  <ProgressBar
                    value={levelProgress.current}
                    max={levelProgress.needed}
                    accent="from-nova-400 to-cyan-300"
                  />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-xs text-white/50">
                  <span>
                    {levelProgress.current.toLocaleString()} / {levelProgress.needed.toLocaleString()} XP
                  </span>
                  <span className="font-bold text-nova-300">{Math.round(levelProgress.pct * 100)}%</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Achievement overview card */}
          <GlassCard className="p-5">
            <SectionTitle icon="Award" accent="text-gold-300">
              Achievement Overview
            </SectionTitle>
            <div className="mt-4 flex items-center gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="6"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    fill="none"
                    stroke="url(#achGrad)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${(unlockedCount / totalCount) * 213.6} 213.6`}
                  />
                  <defs>
                    <linearGradient id="achGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#fb923c" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-xl font-black text-white">{unlockedCount}</div>
                  <div className="text-[10px] text-white/40 font-bold uppercase">unlocked</div>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-white/60">
                  You've unlocked{' '}
                  <span className="font-bold text-gold-300">{unlockedCount}</span> of{' '}
                  <span className="font-bold text-white">{totalCount}</span> achievements.
                </div>
                <div className="mt-2 flex gap-2 flex-wrap">
                  <Pill icon="Trophy" accent="text-gold-300 border-gold-500/30">
                    {Math.round((unlockedCount / totalCount) * 100)}% Complete
                  </Pill>
                  <Pill icon="Lock" accent="text-white/40 border-white/10">
                    {totalCount - unlockedCount} Locked
                  </Pill>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Category showcase */}
          <div>
            <SectionTitle icon="Grid" accent="text-plasma-300">
              Categories
            </SectionTitle>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {ACHIEVEMENT_CATEGORIES.map((cat) => {
                const unlocked = ACHIEVEMENTS.filter(
                  (a) => a.category === cat && a.unlocked,
                ).length;
                const total = ACHIEVEMENTS.filter((a) => a.category === cat).length;
                const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0;
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`relative rounded-2xl p-3 text-left transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-br ${CATEGORY_ACCENTS[cat]} shadow-glow`
                        : 'glass hover:bg-white/[0.1]'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
                        isActive ? 'bg-ink-950/20' : `bg-gradient-to-br ${CATEGORY_ACCENTS[cat]}`
                      }`}
                    >
                      <Icon
                        name={cat === 'Master' ? 'Crown' : cat === 'Seasonal' ? 'CalendarStar' : cat === 'Community' ? 'Users' : cat === 'Adventure' ? 'Swords' : cat === 'Collector' ? 'Gem' : 'Compass'}
                        size={16}
                        className={isActive ? 'text-white' : 'text-ink-950'}
                      />
                    </div>
                    <div className={`text-xs font-bold ${isActive ? 'text-ink-950' : 'text-white'}`}>
                      {cat}
                    </div>
                    <div className={`text-[10px] font-semibold ${isActive ? 'text-ink-950/70' : 'text-white/50'}`}>
                      {unlocked}/{total} · {pct}%
                    </div>
                    <div className="mt-1.5 h-1 rounded-full bg-ink-950/20 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isActive ? 'bg-ink-950/40' : `bg-gradient-to-r ${CATEGORY_ACCENTS[cat]}`}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Achievement list (filtered) */}
          <div>
            <SectionTitle
              icon="Award"
              accent="text-nova-300"
              action={
                <Pill accent="text-nova-300 border-nova-500/30">
                  {categoryUnlocked}/{categoryTotal} · {categoryPct}%
                </Pill>
              }
            >
              {activeCategory} Achievements
            </SectionTitle>
            <div className="mt-3 flex flex-col gap-2.5">
              {filteredAchievements.map((a) => {
                const tier = TIER_META[a.tier];
                return (
                  <GlassCard
                    key={a.id}
                    className={`p-3.5 flex items-center gap-3 ${a.unlocked ? '' : 'opacity-50'}`}
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${CATEGORY_ACCENTS[a.category]} flex items-center justify-center flex-shrink-0`}>
                      <Icon name={a.unlocked ? a.icon : 'Lock'} size={20} className="text-ink-950" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white">{a.title}</h4>
                      <p className="text-xs text-white/50 truncate">{a.description}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${tier.color}`}>
                          {tier.label}
                        </span>
                        {a.unlocked && a.date && (
                          <span className="text-[10px] text-white/40">{a.date}</span>
                        )}
                      </div>
                    </div>
                    {a.unlocked && (
                      <div className="flex-shrink-0">
                        <Icon name="CheckCircle" size={20} className="text-nova-300" />
                      </div>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          </div>

          {/* Badges display */}
          <div>
            <SectionTitle icon="Shield" accent="text-rose-300">
              Badges
            </SectionTitle>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {BADGES.map((b) => (
                <GlassCard key={b.id} className="p-3 flex flex-col items-center gap-2 text-center">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${b.color} flex items-center justify-center`}>
                    <Icon name={b.icon} size={22} className="text-ink-950" />
                  </div>
                  <div className="text-xs font-bold text-white">{b.label}</div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* Level ladder */}
          <div>
            <SectionTitle icon="Trophy" accent="text-gold-300">
              Level Ladder
            </SectionTitle>
            <div className="mt-3 flex flex-col gap-2">
              {LEVELS.map((lvl) => {
                const reached = profile.xp >= lvl.minXp;
                const isCurrent = levelProgress.info.level === lvl.level;
                return (
                  <div
                    key={lvl.level}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                      isCurrent ? 'glass shadow-glow' : reached ? 'glass' : 'opacity-40'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                      reached ? 'bg-gradient-to-br from-nova-400 to-cyan-500' : 'bg-white/5'
                    }`}>
                      {lvl.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">Lv {lvl.level}</span>
                        <span className="text-xs text-nova-300 font-semibold">{lvl.title}</span>
                        {isCurrent && (
                          <Pill icon="Target" accent="text-nova-300 border-nova-500/30" className="ml-auto">
                            Current
                          </Pill>
                        )}
                      </div>
                      <div className="text-[10px] text-white/40 mt-0.5">
                        {lvl.minXp.toLocaleString()} – {lvl.maxXp === 999999 ? '∞' : lvl.maxXp.toLocaleString()} XP
                      </div>
                    </div>
                    {reached && !isCurrent && (
                      <Icon name="CheckCircle" size={18} className="text-nova-300 flex-shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
