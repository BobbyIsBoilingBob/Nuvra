import { useState } from 'react';
import { Icon, GlassCard, Pill, SectionTitle } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import {
  CHALLENGES,
  CHALLENGE_CATEGORIES,
  COMBO_TIERS,
  getComboTier,
  type ChallengeCategory,
  type AccessibilitySettings,
} from '../data';

function AccessibilityToggle({
  label,
  description,
  icon,
  value,
  onToggle,
}: {
  label: string;
  description: string;
  icon: string;
  value: boolean;
  onToggle: () => void;
}): React.ReactElement {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-9 h-9 rounded-xl glass flex items-center justify-center text-nova-300 flex-shrink-0">
        <Icon name={icon} size={16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-bold text-white">{label}</div>
        <div className="text-xs text-white/50">{description}</div>
      </div>
      <button
        onClick={onToggle}
        role="switch"
        aria-checked={value}
        aria-label={label}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
          value ? 'bg-gradient-to-r from-nova-400 to-cyan-400' : 'bg-white/10'
        }`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${
            value ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export function Challenges(): React.ReactElement {
  const { profile, combo, accessibility, setAccessibility } = useStore();
  const [filter, setFilter] = useState<ChallengeCategory | 'all'>('all');

  const currentTier = getComboTier(combo);

  const filteredChallenges = filter === 'all'
    ? CHALLENGES
    : CHALLENGES.filter((c) => c.category === filter);

  const stats = [
    { icon: 'CheckCircle', label: 'Completed', value: profile.challengesCompleted, accent: 'text-nova-300' },
    { icon: 'XCircle', label: 'Failed', value: profile.challengesFailed, accent: 'text-rose-300' },
    { icon: 'Flame', label: 'Best Combo', value: `${profile.bestCombo}x`, accent: 'text-ember-300' },
  ];

  function updateAccessibility<K extends keyof AccessibilitySettings>(key: K, value: boolean): void {
    setAccessibility({ ...accessibility, [key]: value });
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg variant="cyber" accent="#fb923c" />

      <div className="relative z-10">
        <TopBar showBack title="Challenges" />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-5">
          {/* Combo system card */}
          <GlassCard className="p-5">
            <SectionTitle icon="Flame" accent="text-ember-300">
              Combo System
            </SectionTitle>

            <div className="mt-4 flex items-center justify-center">
              <div className={`relative rounded-2xl px-6 py-4 bg-gradient-to-r ${currentTier.accent}`}>
                <div className="text-center">
                  <div className="text-3xl font-black text-ink-950 leading-none">{combo}x</div>
                  <div className="text-[10px] font-bold text-ink-950/70 uppercase tracking-wider mt-1">{currentTier.label}</div>
                </div>
              </div>
            </div>

            {/* Combo tiers display */}
            <div className="mt-4 flex flex-col gap-2">
              {COMBO_TIERS.map((tier) => {
                const active = combo >= tier.threshold;
                return (
                  <div
                    key={tier.label}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                      active ? 'glass' : 'opacity-40'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${tier.accent} flex items-center justify-center flex-shrink-0`}>
                      <Icon name="Flame" size={14} className="text-ink-950" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white">{tier.label}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-white/50">{tier.threshold}x threshold</span>
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <span className="text-[10px] font-bold text-nova-300">XP {tier.xpMult}x</span>
                      <span className="text-[10px] font-bold text-gold-300">💰 {tier.coinMult}x</span>
                      <span className="text-[10px] font-bold text-plasma-300">✨ {Math.round(tier.rareChance * 100)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map((s) => (
              <GlassCard key={s.label} className="p-3 flex flex-col items-center gap-1.5 text-center">
                <div className={`w-9 h-9 rounded-xl glass flex items-center justify-center ${s.accent}`}>
                  <Icon name={s.icon} size={16} />
                </div>
                <div className="text-lg font-black text-white">{s.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">{s.label}</div>
              </GlassCard>
            ))}
          </div>

          {/* Category filter */}
          <div>
            <SectionTitle icon="Filter" accent="text-nova-300">
              Categories
            </SectionTitle>
            <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
              <button
                onClick={() => setFilter('all')}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-nova-400 to-cyan-400 text-ink-950 shadow-glow'
                    : 'glass text-white/60 hover:text-white'
                }`}
              >
                <Icon name="Grid" size={14} />
                All
              </button>
              {CHALLENGE_CATEGORIES.map((cat) => {
                const active = filter === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setFilter(cat.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                      active
                        ? `bg-gradient-to-r ${cat.accent} text-ink-950 shadow-glow`
                        : 'glass text-white/60 hover:text-white'
                    }`}
                  >
                    <Icon name={cat.icon} size={14} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Challenge list */}
          <div className="flex flex-col gap-2">
            {filteredChallenges.map((c) => {
              const catMeta = CHALLENGE_CATEGORIES.find((cat) => cat.id === c.category);
              return (
                <GlassCard key={c.id} className="p-3 flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${c.accent} flex items-center justify-center flex-shrink-0`}>
                    <Icon name={c.icon} size={20} className="text-ink-950" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white">{c.title}</h4>
                    <p className="text-xs text-white/50 truncate">{c.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Pill accent="text-ember-300 border-ember-500/30">{c.difficulty}</Pill>
                      {catMeta && (
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{catMeta.label}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-xs font-bold text-gold-300">+{c.baseReward}</span>
                    <span className="text-[10px] text-white/40">coins</span>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          {/* Accessibility settings */}
          <GlassCard className="p-5">
            <SectionTitle icon="Accessibility" accent="text-plasma-300">
              Accessibility
            </SectionTitle>
            <div className="mt-4 flex flex-col divide-y divide-white/5">
              <AccessibilityToggle
                label="Relaxed Mode"
                description="Gentler pace, no mystery events"
                icon="Leaf"
                value={accessibility.relaxedMode}
                onToggle={() => updateAccessibility('relaxedMode', !accessibility.relaxedMode)}
              />
              <AccessibilityToggle
                label="Reduced Challenge Frequency"
                description="Fewer challenges per adventure"
                icon="Gauge"
                value={accessibility.reducedChallengeFrequency}
                onToggle={() => updateAccessibility('reducedChallengeFrequency', !accessibility.reducedChallengeFrequency)}
              />
              <AccessibilityToggle
                label="Disable Challenge Animations"
                description="Skip animated transitions"
                icon="Eye"
                value={accessibility.disableChallengeAnimations}
                onToggle={() => updateAccessibility('disableChallengeAnimations', !accessibility.disableChallengeAnimations)}
              />
              <AccessibilityToggle
                label="Skip Challenges"
                description="Auto-complete all challenges"
                icon="FastForward"
                value={accessibility.skipChallenges}
                onToggle={() => updateAccessibility('skipChallenges', !accessibility.skipChallenges)}
              />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
