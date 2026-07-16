import { useEffect, useState } from 'react';
import { useStore } from '../store';
import { AdventureBg } from '../components/AdventureBg';
import { Icon, GlassCard, DifficultyBadge } from '../components/ui';
import { GENERATION_STEPS, getThemeById, getRecommendation } from '../generator';
import {
  LENGTH_OPTIONS, STYLE_PREF_OPTIONS, DIFFICULTY_PREF_OPTIONS, REWARD_PRIORITY_OPTIONS,
  CHALLENGES, ADVENTURE_TYPE_META,
  type AdventureLength, type AdventureStylePref, type DifficultyPref, type RewardPriority,
} from '../data';

export function AIGeneratorScreen() {
  const {
    aiPreferences: pref, setAIPreferences, generatedAdventure: adv,
    isGenerating, generateAI, regenerateAI, saveGenerated, startGenerated, go, profile,
  } = useStore();
  const [stepIdx, setStepIdx] = useState(0);
  const recommendation = getRecommendation(profile);

  useEffect(() => {
    if (!isGenerating) { setStepIdx(0); return; }
    setStepIdx(0);
    const stepDuration = 3200 / GENERATION_STEPS.length;
    const interval = setInterval(() => { setStepIdx((i) => Math.min(i + 1, GENERATION_STEPS.length - 1)); }, stepDuration);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const theme = getThemeById(adv?.themeId);
  const includedChallenges = adv ? CHALLENGES.filter((c) => adv.challenges.includes(c.id)) : [];

  return (
    <div className="relative min-h-screen pb-28 overflow-hidden">
      <AdventureBg variant="aurora" />
      <div className="relative z-10 mx-auto max-w-md px-5 pt-12">
        <div className="flex items-center gap-3 animate-rise">
          <button onClick={() => go('home')} className="glass rounded-2xl w-10 h-10 flex items-center justify-center text-slate-200"><Icon name="ArrowLeft" size={18} /></button>
          <div className="flex-1"><h1 className="font-display text-2xl font-extrabold text-white flex items-center gap-2">AI Adventure <span className="chip bg-plasma-500/20 border border-plasma-500/40 text-plasma-300 !text-[10px]">BETA</span></h1><p className="text-xs text-slate-400">Personalised adventures, generated for you</p></div>
        </div>

        {!isGenerating && !adv && (
          <div className="mt-5 glass rounded-2xl p-4 flex items-center gap-3 animate-rise">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${recommendation.accent} flex items-center justify-center shrink-0`}><Icon name={recommendation.icon} size={18} className="text-ink-950" /></div>
            <div><p className="text-[10px] font-bold text-nova-300 uppercase tracking-wide">Smart Pick</p><p className="text-sm text-slate-200">{recommendation.text}</p></div>
          </div>
        )}

        {!isGenerating && !adv && (
          <div className="mt-5 stagger">
            <PrefSection title="Adventure Length" icon="Clock">
              <div className="grid grid-cols-5 gap-2">
                {LENGTH_OPTIONS.map((o) => (<button key={o.id} onClick={() => setAIPreferences({ length: o.id as AdventureLength })} className={`glass rounded-2xl p-2.5 flex flex-col items-center gap-1 transition-all ${pref.length === o.id ? 'border-nova-400/60 shadow-glow scale-105' : 'hover:border-white/20'}`}><Icon name={o.icon} size={16} className={pref.length === o.id ? 'text-nova-300' : 'text-slate-400'} /><span className={`text-[9px] font-bold leading-tight text-center ${pref.length === o.id ? 'text-white' : 'text-slate-400'}`}>{o.label}</span></button>))}
              </div>
            </PrefSection>
            <PrefSection title="Adventure Style" icon="Compass">
              <div className="grid grid-cols-3 gap-2">
                {STYLE_PREF_OPTIONS.map((o) => (<button key={o.id} onClick={() => setAIPreferences({ style: o.id as AdventureStylePref })} className={`glass rounded-2xl p-3 flex flex-col items-center gap-1.5 transition-all ${pref.style === o.id ? 'border-nova-400/60 shadow-glow scale-105' : 'hover:border-white/20'}`}><div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${o.accent} flex items-center justify-center`}><Icon name={o.icon} size={18} className="text-ink-950" /></div><span className={`text-[11px] font-bold ${pref.style === o.id ? 'text-white' : 'text-slate-300'}`}>{o.label}</span><span className="text-[9px] text-slate-500 text-center leading-tight">{o.desc}</span></button>))}
              </div>
            </PrefSection>
            <PrefSection title="Difficulty" icon="Flame">
              <div className="flex gap-2">
                {DIFFICULTY_PREF_OPTIONS.map((o) => (<button key={o.id} onClick={() => setAIPreferences({ difficulty: o.id as DifficultyPref })} className={`flex-1 glass rounded-2xl p-3 flex flex-col items-center gap-1 transition-all ${pref.difficulty === o.id ? 'border-nova-400/60 shadow-glow scale-105' : 'hover:border-white/20'}`}><div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${o.accent} flex items-center justify-center`}><Icon name={o.icon} size={16} className="text-ink-950" /></div><span className={`text-[10px] font-bold ${pref.difficulty === o.id ? 'text-white' : 'text-slate-400'}`}>{o.label}</span></button>))}
              </div>
            </PrefSection>
            <PrefSection title="Reward Priority" icon="Gift">
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {REWARD_PRIORITY_OPTIONS.map((o) => (<button key={o.id} onClick={() => setAIPreferences({ rewardPriority: o.id as RewardPriority })} className={`glass rounded-2xl px-4 py-3 flex flex-col items-center gap-1.5 shrink-0 transition-all ${pref.rewardPriority === o.id ? 'border-nova-400/60 shadow-glow scale-105' : 'hover:border-white/20'}`}><div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${o.accent} flex items-center justify-center`}><Icon name={o.icon} size={18} className="text-ink-950" /></div><span className={`text-[11px] font-bold ${pref.rewardPriority === o.id ? 'text-white' : 'text-slate-300'}`}>{o.label}</span></button>))}
              </div>
            </PrefSection>
            <button onClick={generateAI} className="btn-glow w-full py-4 text-base mt-2"><Icon name="Sparkles" size={20} /> Generate Adventure</button>
          </div>
        )}

        {isGenerating && (
          <div className="mt-8 flex flex-col items-center animate-rise">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-plasma-400/30 animate-pulse-glow" />
              <div className="absolute inset-4 rounded-full border-2 border-nova-400/40 animate-pulse-glow" style={{ animationDelay: '0.3s' }} />
              <div className="absolute inset-8 rounded-full border-2 border-ember-400/50 animate-pulse-glow" style={{ animationDelay: '0.6s' }} />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-plasma-400 via-nova-400 to-ember-500 flex items-center justify-center shadow-glow animate-gen-pulse"><Icon name="Sparkles" size={36} className="text-ink-950" /></div>
              {[0, 1, 2, 3].map((i) => (<div key={i} className="absolute w-2.5 h-2.5 rounded-full bg-nova-300 animate-orbit" style={{ animationDelay: `${i * 0.4}s` }} />))}
            </div>
            <svg className="mt-6 w-full h-16 opacity-60" viewBox="0 0 200 60" preserveAspectRatio="none"><defs><linearGradient id="genRoute" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#40f5cb" stopOpacity="0" /><stop offset="50%" stopColor="#a78bfa" stopOpacity="1" /><stop offset="100%" stopColor="#fb923c" stopOpacity="0" /></linearGradient></defs><path d="M0,30 Q50,10 100,30 T200,30" stroke="url(#genRoute)" strokeWidth="2" fill="none" strokeDasharray="4 3" className="animate-dash" /></svg>
            <div className="mt-4 w-full flex flex-col gap-2.5">
              {GENERATION_STEPS.map((s, i) => (<div key={s} className={`flex items-center gap-3 transition-all duration-500 ${i <= stepIdx ? 'opacity-100' : 'opacity-30'}`}><div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all ${i < stepIdx ? 'bg-nova-400/20' : i === stepIdx ? 'bg-plasma-500/30 animate-pulse-glow' : 'bg-white/5'}`}>{i < stepIdx ? <Icon name="Check" size={14} className="text-nova-300" /> : i === stepIdx ? <Icon name="Loader" size={14} className="text-plasma-300 animate-spin" /> : <span className="w-2 h-2 rounded-full bg-slate-500" />}</div><p className={`text-sm font-semibold ${i === stepIdx ? 'text-white shimmer-text' : i < stepIdx ? 'text-slate-300' : 'text-slate-500'}`}>{s}</p></div>))}
            </div>
            <div className="mt-6 flex gap-3">{[0, 1, 2, 3, 4].map((i) => (<span key={i} className="w-1.5 h-1.5 rounded-full bg-nova-300/60 animate-particle-rise" style={{ animationDelay: `${i * 0.2}s` }} />))}</div>
          </div>
        )}

        {!isGenerating && adv && (
          <div className="mt-5 animate-pop">
            <div className="relative rounded-3xl overflow-hidden glass-strong">
              <div className="relative h-44 overflow-hidden">
                <img src={adv.image} alt={adv.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-2"><span className="chip bg-plasma-500/20 backdrop-blur-md border border-plasma-500/40 text-plasma-300"><Icon name="Sparkles" size={12} /> AI Generated</span>{theme && <span className="chip bg-ink-900/70 backdrop-blur-md border border-white/10 text-white">{theme.emoji} {theme.name}</span>}</div>
                <div className="absolute top-3 right-3"><DifficultyBadge difficulty={adv.difficulty} /></div>
                <div className="absolute bottom-3 inset-x-4"><h2 className="font-display text-2xl font-extrabold text-white">{adv.name}</h2><div className="mt-1 flex items-center gap-3 text-xs text-slate-300"><span className="flex items-center gap-1"><Icon name="Footprints" size={12} /> {adv.distanceKm} km</span><span className="flex items-center gap-1"><Icon name="Clock" size={12} /> {adv.durationMin} min</span><span className="chip bg-ink-900/70 border border-white/10 text-nova-300 !px-2 !py-0.5 !text-[10px]"><Icon name={ADVENTURE_TYPE_META[adv.type].icon} size={10} /> {ADVENTURE_TYPE_META[adv.type].label}</span></div></div>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-300 leading-relaxed">{adv.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="glass rounded-2xl p-3 flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-nova-400/15 flex items-center justify-center"><Icon name="Zap" size={18} className="text-nova-300" /></div><div><p className="font-display text-base font-bold text-white">+{adv.xpReward}</p><p className="text-[10px] text-slate-400">XP Reward</p></div></div>
                  <div className="glass rounded-2xl p-3 flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-gold-400/15 flex items-center justify-center"><Icon name="Coins" size={18} className="text-gold-300" /></div><div><p className="font-display text-base font-bold text-white">+{adv.coinReward}</p><p className="text-[10px] text-slate-400">Coin Reward</p></div></div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <MiniStat icon="MapPin" label="Checkpoints" value={adv.checkpoints.length} />
                  <MiniStat icon="Gem" label="Treasures" value={adv.treasures.length} />
                  <MiniStat icon="Swords" label="Challenges" value={adv.challenges.length} />
                </div>
              </div>
            </div>
            <div className="mt-4"><h3 className="section-title mb-3">Challenges Included</h3><div className="flex flex-col gap-2.5 stagger">{includedChallenges.map((c) => (<div key={c.id} className="glass rounded-2xl p-3 flex items-center gap-3"><div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.accent} flex items-center justify-center shrink-0`}><Icon name={c.icon} size={16} className="text-ink-950" /></div><div className="flex-1 min-w-0"><p className="text-sm font-semibold text-white">{c.title}</p><p className="text-[11px] text-slate-400 truncate">{c.description}</p></div><span className="chip bg-gold-400/15 text-gold-300 !px-2 !py-0.5 !text-[10px]">+{c.baseReward}</span></div>))}</div></div>
            <div className="mt-5 flex gap-3">
              <button onClick={regenerateAI} className="glass rounded-2xl px-4 py-3.5 font-semibold text-slate-200 active:scale-95 flex items-center gap-2"><Icon name="RefreshCw" size={18} /> Regenerate</button>
              <button onClick={saveGenerated} className="glass rounded-2xl px-4 py-3.5 font-semibold text-slate-200 active:scale-95 flex items-center gap-2"><Icon name="Bookmark" size={18} /> Save</button>
              <button onClick={startGenerated} className="btn-glow flex-1 py-3.5">Start <Icon name="Play" size={18} /></button>
            </div>
            <button className="mt-3 w-full glass rounded-2xl py-3 font-semibold text-slate-300 active:scale-95 flex items-center justify-center gap-2"><Icon name="Share2" size={16} /> Share Adventure</button>
          </div>
        )}
      </div>
    </div>
  );
}

function PrefSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (<GlassCard className="p-4"><div className="flex items-center gap-2 mb-3"><Icon name={icon} size={16} className="text-nova-300" /><h3 className="section-title">{title}</h3></div>{children}</GlassCard>);
}

function MiniStat({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (<div className="glass rounded-xl p-2.5 flex flex-col items-center gap-1"><Icon name={icon} size={16} className="text-nova-300" /><span className="font-display text-sm font-bold text-white">{value}</span><span className="text-[9px] text-slate-400">{label}</span></div>);
}
