import { useState } from 'react';
import { useStore } from '../store';
import { AdventureBg } from '../components/AdventureBg';
import { Icon, GlassCard, DifficultyBadge } from '../components/ui';
import {
  CHALLENGE_CATEGORIES, CHALLENGES, COMBO_TIERS,
  MYSTERY_EVENTS, TREASURE_RARITIES,
} from '../data';

type SubTab = 'categories' | 'multipliers' | 'treasures' | 'mystery' | 'accessibility';

export function ChallengesScreen() {
  const { go, accessibility, setAccessibility } = useStore();
  const [sub, setSub] = useState<SubTab>('categories');
  const subTabs: { id: SubTab; label: string; icon: string }[] = [
    { id: 'categories', label: 'Categories', icon: 'Grid' },
    { id: 'multipliers', label: 'Combos', icon: 'TrendingUp' },
    { id: 'treasures', label: 'Treasures', icon: 'Gem' },
    { id: 'mystery', label: 'Mystery', icon: 'HelpCircle' },
    { id: 'accessibility', label: 'Access', icon: 'Accessibility' },
  ];

  return (
    <div className="relative min-h-screen pb-28 overflow-hidden">
      <AdventureBg />
      <div className="relative z-10 mx-auto max-w-md px-5 pt-12">
        <div className="flex items-center gap-3 animate-rise">
          <button onClick={() => go('home')} className="glass rounded-2xl w-10 h-10 flex items-center justify-center text-slate-200"><Icon name="ArrowLeft" size={18} /></button>
          <div><h1 className="font-display text-2xl font-extrabold text-white">Challenges</h1><p className="text-xs text-slate-400">Test your skills, earn rewards</p></div>
        </div>

        {/* Sub-tabs */}
        <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {subTabs.map((t) => (
            <button key={t.id} onClick={() => setSub(t.id)} className={`glass rounded-full px-3.5 py-2 flex items-center gap-1.5 shrink-0 transition-all ${sub === t.id ? 'border-nova-400/50 shadow-glow' : 'hover:border-white/20'}`}>
              <Icon name={t.icon} size={14} className={sub === t.id ? 'text-nova-300' : 'text-slate-400'} />
              <span className={`text-xs font-semibold ${sub === t.id ? 'text-white' : 'text-slate-400'}`}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Categories */}
        {sub === 'categories' && (
          <div className="mt-5 stagger">
            <div className="grid grid-cols-2 gap-3">
              {CHALLENGE_CATEGORIES.map((cat) => (
                <div key={cat.id} className="glass rounded-2xl p-4 cursor-pointer hover:border-white/20 transition-all">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.accent} flex items-center justify-center mb-2`}><Icon name={cat.icon} size={20} className="text-ink-950" /></div>
                  <p className="font-semibold text-sm text-white">{cat.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{cat.desc}</p>
                </div>
              ))}
            </div>
            <h2 className="section-title mt-6 mb-3">All Challenges</h2>
            <div className="flex flex-col gap-3">
              {CHALLENGES.map((c) => (
                <GlassCard key={c.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${c.accent} flex items-center justify-center shrink-0`}><Icon name={c.icon} size={22} className="text-ink-950" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1"><h3 className="font-bold text-sm text-white">{c.title}</h3><span className="chip bg-white/5 text-slate-400 !px-2 !py-0.5 !text-[10px]">{c.tag}</span></div>
                      <p className="text-xs text-slate-400">{c.description}</p>
                      <div className="mt-2.5 flex items-center gap-3"><DifficultyBadge difficulty={c.difficulty} /><span className="chip bg-gold-400/15 text-gold-300 !px-2 !py-0.5 !text-[10px]"><Icon name="Coins" size={11} /> +{c.baseReward}</span></div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* Combo Multipliers */}
        {sub === 'multipliers' && (
          <div className="mt-5 stagger">
            <div className="glass rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-3"><Icon name="TrendingUp" size={18} className="text-nova-300" /><h2 className="section-title">Combo System</h2></div>
              <p className="text-sm text-slate-300 mb-3">Complete challenges consecutively to build your combo multiplier. Missing a challenge resets the combo — but never removes earned rewards.</p>
            </div>
            <div className="flex flex-col gap-3">
              {COMBO_TIERS.map((t) => (
                <div key={t.threshold} className={`glass rounded-2xl p-4 flex items-center gap-3 ${t.threshold > 0 ? '' : 'opacity-60'}`}>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.accent} flex items-center justify-center shrink-0 shadow-glow`}><Icon name={t.icon} size={22} className="text-ink-950" /></div>
                  <div className="flex-1">
                    <p className="font-display text-sm font-bold text-white">{t.label}</p>
                    <div className="mt-1 flex items-center gap-3 text-[11px]">
                      <span className="text-nova-300">XP {t.xpMult}x</span>
                      <span className="text-gold-300">Coins {t.coinMult}x</span>
                      {t.rareChance > 0 && <span className="text-plasma-300">Rare {Math.round(t.rareChance * 100)}%</span>}
                    </div>
                  </div>
                  <span className="font-display text-2xl font-extrabold text-white">{t.threshold}+</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Treasure Rarities */}
        {sub === 'treasures' && (
          <div className="mt-5 stagger">
            <div className="glass rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2"><Icon name="Gem" size={18} className="text-gold-300" /><h2 className="section-title">Treasure Rarities</h2></div>
              <p className="text-sm text-slate-300">Each chest has a unique animation and reward multiplier. Rarer chests drop coins, XP, cosmetics, badges, titles, and special event items.</p>
            </div>
            <div className="flex flex-col gap-3">
              {TREASURE_RARITIES.map((r) => (
                <div key={r.id} className={`glass rounded-2xl p-4 flex items-center gap-3 ${r.glowClass}`}>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${r.accent} flex items-center justify-center shrink-0 ${r.animation}`}><Icon name="Gem" size={26} className="text-ink-950" /></div>
                  <div className="flex-1">
                    <p className="font-display text-base font-bold" style={{ color: r.color }}>{r.label}</p>
                    <div className="mt-1 flex items-center gap-3 text-[11px]">
                      <span className="text-nova-300">Coins {r.coinMult}x</span>
                      <span className="text-nova-300">XP {r.xpMult}x</span>
                      <span className="text-slate-400">Drop {Math.round(r.dropChance * 100)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mystery Events */}
        {sub === 'mystery' && (
          <div className="mt-5 stagger">
            <div className="glass rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2"><Icon name="HelpCircle" size={18} className="text-plasma-400" /><h2 className="section-title">Mystery Events</h2></div>
              <p className="text-sm text-slate-300">Surprise events trigger randomly during adventures. They're uncommon enough to stay exciting!</p>
            </div>
            <div className="flex flex-col gap-3">
              {MYSTERY_EVENTS.map((e) => (
                <div key={e.id} className="glass rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${e.color}20`, border: `1px solid ${e.color}40` }}>
                    <span style={{ color: e.color }}><Icon name={e.icon} size={22} /></span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-white">{e.label}</p>
                    <p className="text-[11px] text-slate-400">{e.desc}</p>
                    {e.duration > 0 && <p className="text-[10px] text-plasma-300 mt-1">{e.duration}s duration</p>}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">{Math.round(e.triggerChance * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accessibility */}
        {sub === 'accessibility' && (
          <div className="mt-5 stagger">
            <div className="glass rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2"><Icon name="Accessibility" size={18} className="text-nova-300" /><h2 className="section-title">Accessibility</h2></div>
              <p className="text-sm text-slate-300">Customize your challenge experience. All players should enjoy Nuvra.</p>
            </div>
            <div className="flex flex-col gap-3">
              <ToggleRow icon="Feather" label="Relaxed Mode" desc="Disable challenges and mystery events for a calm walk" value={accessibility.relaxedMode} onChange={(v) => setAccessibility({ relaxedMode: v })} />
              <ToggleRow icon="Gauge" label="Reduce Challenge Frequency" desc="Fewer challenges per adventure" value={accessibility.reducedChallengeFrequency} onChange={(v) => setAccessibility({ reducedChallengeFrequency: v })} />
              <ToggleRow icon="EyeOff" label="Disable Challenge Animations" desc="Turn off combo, ring, and treasure animations" value={accessibility.disableChallengeAnimations} onChange={(v) => setAccessibility({ disableChallengeAnimations: v })} />
              <ToggleRow icon="SkipForward" label="Allow Skip Challenges" desc="Let players skip individual challenges" value={accessibility.skipChallenges} onChange={(v) => setAccessibility({ skipChallenges: v })} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleRow({ icon, label, desc, value, onChange }: { icon: string; label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0"><Icon name={icon} size={18} className="text-nova-300" /></div>
      <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-white">{label}</p><p className="text-[11px] text-slate-400">{desc}</p></div>
      <button onClick={() => onChange(!value)} className={`relative w-12 h-6 rounded-full transition-all shrink-0 ${value ? 'bg-nova-400' : 'bg-white/10'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all ${value ? 'left-6' : 'left-0.5'}`} />
      </button>
    </div>
  );
}
