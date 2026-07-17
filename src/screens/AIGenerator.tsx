import { useState } from 'react';
import { Icon, GlassCard, Button, SectionTitle, Spinner } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import {
  LENGTH_OPTIONS,
  STYLE_PREF_OPTIONS,
  DIFFICULTY_PREF_OPTIONS,
  REWARD_PRIORITY_OPTIONS,
  ADVENTURE_THEMES,
  ADVENTURE_TYPE_META,
  type AdventurePreferences,
  type Adventure,
  type AdventureLength,
  type AdventureStylePref,
  type DifficultyPref,
  type RewardPriority,
} from '../adventure-model';
import { generateAdventureOptions } from '../generator';

export function AIGenerator(): React.ReactElement {
  const { aiPrefs, setAiPrefs, setScreen, addAdventure } = useStore();
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<Adventure[]>([]);

  const themeOptions = [
    { id: 'random', name: 'Random', emoji: '🎲', accent: 'from-plasma-400 to-nova-500' },
    ...ADVENTURE_THEMES.slice(0, 5),
  ];
  const [selectedTheme, setSelectedTheme] = useState<string>('random');

  function updatePref<K extends keyof AdventurePreferences>(key: K, value: AdventurePreferences[K]): void {
    setAiPrefs({ ...aiPrefs, [key]: value });
  }

  function handleGenerate(): void {
    setGenerating(true);
    setResults([]);
    window.setTimeout(() => {
      const prefs: AdventurePreferences = {
        length: aiPrefs.length,
        style: aiPrefs.style,
        difficulty: aiPrefs.difficulty,
        rewardPriority: aiPrefs.rewardPriority,
      };
      const generated = generateAdventureOptions(prefs, 3);
      setResults(generated);
      setGenerating(false);
    }, 1200);
  }

  function openAdventure(a: Adventure): void {
    addAdventure(a as unknown as import('../data').Adventure);
    setScreen('adventure-detail');
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg variant="space" accent="#a78bfa" />

      <div className="relative z-10">
        <TopBar showBack title="AI Adventure Generator" />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-5">
          {/* Theme selection */}
          <div>
            <SectionTitle icon="Palette" accent="text-plasma-300">
              Theme
            </SectionTitle>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {themeOptions.map((t) => {
                const active = selectedTheme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTheme(t.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 ${
                      active
                        ? `bg-gradient-to-br ${t.accent} text-ink-950 shadow-glow-plasma`
                        : 'glass text-white/70 hover:text-white'
                    }`}
                  >
                    <span className="text-xl">{t.emoji}</span>
                    <span className="text-xs font-bold">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Duration selector */}
          <div>
            <SectionTitle icon="Clock" accent="text-cyan-300">
              Duration
            </SectionTitle>
            <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
              {LENGTH_OPTIONS.map((opt) => {
                const active = aiPrefs.length === (opt.id as AdventureLength);
                return (
                  <button
                    key={opt.id}
                    onClick={() => updatePref('length', opt.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-nova-400 to-cyan-400 text-ink-950 shadow-glow'
                        : 'glass text-white/60 hover:text-white'
                    }`}
                  >
                    <Icon name="Clock" size={14} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Style selector */}
          <div>
            <SectionTitle icon="Compass" accent="text-nova-300">
              Style
            </SectionTitle>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {STYLE_PREF_OPTIONS.map((opt) => {
                const active = aiPrefs.style === (opt.id as AdventureStylePref);
                return (
                  <button
                    key={opt.id}
                    onClick={() => updatePref('style', opt.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-br from-nova-400 to-cyan-400 text-ink-950 shadow-glow'
                        : 'glass text-white/70 hover:text-white'
                    }`}
                  >
                    <Icon name={opt.icon} size={18} />
                    <span className="text-xs font-bold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty selector */}
          <div>
            <SectionTitle icon="Flame" accent="text-ember-300">
              Difficulty
            </SectionTitle>
            <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
              {DIFFICULTY_PREF_OPTIONS.map((opt) => {
                const active = aiPrefs.difficulty === (opt.id as DifficultyPref);
                return (
                  <button
                    key={opt.id}
                    onClick={() => updatePref('difficulty', opt.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-ember-400 to-rose-500 text-ink-950 shadow-glow-rose'
                        : 'glass text-white/60 hover:text-white'
                    }`}
                  >
                    <Icon name="Clock" size={14} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reward priority selector */}
          <div>
            <SectionTitle icon="Gem" accent="text-gold-300">
              Reward Priority
            </SectionTitle>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {REWARD_PRIORITY_OPTIONS.map((opt) => {
                const active = aiPrefs.rewardPriority === (opt.id as RewardPriority);
                return (
                  <button
                    key={opt.id}
                    onClick={() => updatePref('rewardPriority', opt.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-br from-gold-300 to-ember-500 text-ink-950 shadow-glow-gold'
                        : 'glass text-white/70 hover:text-white'
                    }`}
                  >
                    <Icon name={opt.icon} size={18} />
                    <span className="text-xs font-bold">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon="Sparkles"
            disabled={generating}
            onClick={handleGenerate}
          >
            {generating ? 'Generating...' : 'Generate Adventures'}
          </Button>

          {/* Generating state */}
          {generating && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <Spinner size={32} />
              <p className="text-sm text-white/60">Crafting unique adventures for you...</p>
            </div>
          )}

          {/* Results list */}
          {!generating && results.length > 0 && (
            <div>
              <SectionTitle icon="Compass" accent="text-nova-300">
                Generated Adventures
              </SectionTitle>
              <div className="mt-3 flex flex-col gap-3">
                {results.map((adv) => {
                  const meta = ADVENTURE_TYPE_META[adv.type];
                  return (
                    <GlassCard key={adv.id} className="p-3 flex items-center gap-3" onClick={() => openAdventure(adv)}>
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={adv.image}
                          alt={adv.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-base">{adv.emoji}</span>
                          <h3 className="text-sm font-extrabold text-white truncate">{adv.name}</h3>
                        </div>
                        <p className="text-xs text-white/50 truncate">{adv.description}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border border-nova-500/30 text-nova-300 bg-white/[0.04]">
                            <Icon name={meta.icon} size={10} />
                            {meta.label}
                          </span>
                          <span className="text-xs text-white/50">{adv.distanceKm} km</span>
                          <span className="text-xs text-white/30">·</span>
                          <span className="text-xs font-bold text-nova-300">+{adv.xpReward} XP</span>
                        </div>
                      </div>
                      <Icon name="ChevronRight" size={18} className="text-white/40 flex-shrink-0" />
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
