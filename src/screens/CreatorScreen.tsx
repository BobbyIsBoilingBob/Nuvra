import { useState } from 'react';
import { useStore } from '../store';
import { AdventureBg } from '../components/AdventureBg';
import { Icon, GlassCard, DifficultyBadge } from '../components/ui';
import { ADVENTURE_TYPE_META, type AdventureType, type Difficulty } from '../data';

const TYPES = Object.keys(ADVENTURE_TYPE_META) as AdventureType[];
const DIFFS: Difficulty[] = ['Easy', 'Medium', 'Hard', 'Epic'];
const EMOJI_CHOICES = ['🧭', '💎', '⛰️', '🏙️', '🌿', '🌅', '🏛️', '🌙', '🌊', '🔥', '✨', '🏆'];

export function CreatorScreen() {
  const { go, startAdventureDirect } = useStore();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState<AdventureType>('explorer');
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [emoji, setEmoji] = useState('🧭');
  const [distance, setDistance] = useState(2);
  const [duration, setDuration] = useState(30);
  const [created, setCreated] = useState(false);

  const canCreate = name.trim().length >= 3;
  const diffMult = difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 1.3 : difficulty === 'Hard' ? 1.7 : 2.2;

  const handleCreate = () => { if (canCreate) setCreated(true); };

  const handleStart = () => {
    const adv = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      description: desc.trim() || 'A custom adventure created by you.',
      type, difficulty,
      distanceKm: distance, durationMin: duration,
      xpReward: Math.round(duration * 5 * diffMult),
      coinReward: Math.round(duration * 4 * diffMult),
      accent: ADVENTURE_TYPE_META[type].accent,
      emoji,
      image: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=800',
      challenges: ['c1', 'c3'],
      routePath: [
        { x: 15, y: 78 }, { x: 28, y: 62 }, { x: 42, y: 68 }, { x: 55, y: 48 },
        { x: 68, y: 55 }, { x: 78, y: 38 }, { x: 88, y: 28 },
      ],
      checkpoints: [
        { id: 'cp1', label: 'Trailhead', kind: 'start' as const, x: 15, y: 78, reward: 0, done: false },
        { id: 'cp2', label: 'Midpoint', kind: 'challenge' as const, x: 42, y: 68, reward: 120, done: false },
        { id: 'cp3', label: 'Hidden Cache', kind: 'treasure' as const, x: 55, y: 48, reward: 200, done: false },
        { id: 'cp4', label: 'Adventure End', kind: 'finish' as const, x: 88, y: 28, reward: 300, done: false },
      ],
      treasures: [
        { id: 't1', x: 28, y: 62, coins: 50, xp: 30, opened: false, rarity: 'common' as const },
        { id: 't2', x: 68, y: 55, coins: 80, xp: 50, opened: false, rarity: 'rare' as const },
      ],
      coins: [
        { id: 'co1', x: 22, y: 70, collected: false }, { id: 'co2', x: 35, y: 64, collected: false },
        { id: 'co3', x: 48, y: 58, collected: false }, { id: 'co4', x: 62, y: 50, collected: false },
        { id: 'co5', x: 73, y: 45, collected: false }, { id: 'co6', x: 82, y: 33, collected: false },
      ],
      zones: [
        { id: 'z1', type: 'balance' as const, label: 'Balance Challenge', x: 42, y: 68, radius: 8, icon: 'Scale', accent: 'from-nova-400 to-nova-600', color: '#1fe3b0' },
        { id: 'z2', type: 'treasure' as const, label: 'Treasure Zone', x: 55, y: 48, radius: 7, icon: 'Gem', accent: 'from-gold-400 to-ember-500', color: '#fbbf24' },
      ],
      completed: false, saved: false, plays: 0, rating: 0,
      isAIGenerated: false,
    };
    startAdventureDirect(adv);
  };

  return (
    <div className="relative min-h-screen pb-28 overflow-hidden">
      <AdventureBg />
      <div className="relative z-10 mx-auto max-w-md px-5 pt-12">
        <div className="flex items-center gap-3 animate-rise">
          <button onClick={() => go('home')} className="glass rounded-2xl w-10 h-10 flex items-center justify-center text-slate-200"><Icon name="ArrowLeft" size={18} /></button>
          <div><h1 className="font-display text-2xl font-extrabold text-white">Create Adventure</h1><p className="text-xs text-slate-400">Design your own quest</p></div>
        </div>

        {!created ? (
          <div className="mt-5 stagger">
            <GlassCard className="p-4"><label className="text-xs font-semibold text-slate-400 mb-2 block">Adventure Name</label><input value={name} onChange={(e) => setName(e.target.value)} maxLength={32} placeholder="e.g. Mystic Harbor Trail" className="w-full glass rounded-xl px-4 py-3 text-sm font-semibold text-white placeholder:text-slate-500 outline-none focus:border-nova-400/50" /><p className="mt-2 text-[10px] text-slate-500">{name.length}/32 characters</p></GlassCard>
            <GlassCard className="p-4 mt-3"><label className="text-xs font-semibold text-slate-400 mb-2 block">Description</label><textarea value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={140} placeholder="Describe your adventure..." className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-nova-400/50 resize-none" rows={3} /><p className="mt-1 text-[10px] text-slate-500">{desc.length}/140</p></GlassCard>
            <GlassCard className="p-4 mt-3"><label className="text-xs font-semibold text-slate-400 mb-2 block">Icon</label><div className="flex gap-2 flex-wrap">{EMOJI_CHOICES.map((e) => (<button key={e} onClick={() => setEmoji(e)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${emoji === e ? 'bg-nova-400/20 border border-nova-400/50 scale-110' : 'glass hover:border-white/20'}`}>{e}</button>))}</div></GlassCard>
            <GlassCard className="p-4 mt-3"><label className="text-xs font-semibold text-slate-400 mb-2 block">Adventure Type</label><div className="grid grid-cols-2 gap-2">{TYPES.map((t) => { const meta = ADVENTURE_TYPE_META[t]; return (<button key={t} onClick={() => setType(t)} className={`glass rounded-2xl p-3 flex items-center gap-2.5 transition-all ${type === t ? 'border-nova-400/60 shadow-glow scale-105' : 'hover:border-white/20'}`}><div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${meta.accent} flex items-center justify-center`}><Icon name={meta.icon} size={16} className="text-ink-950" /></div><span className={`text-xs font-bold ${type === t ? 'text-white' : 'text-slate-300'}`}>{meta.label}</span></button>); })}</div></GlassCard>
            <GlassCard className="p-4 mt-3"><label className="text-xs font-semibold text-slate-400 mb-2 block">Difficulty</label><div className="flex gap-2">{DIFFS.map((d) => (<button key={d} onClick={() => setDifficulty(d)} className={`flex-1 glass rounded-xl py-2.5 text-xs font-bold transition-all ${difficulty === d ? 'border-nova-400/60 shadow-glow scale-105 text-white' : 'text-slate-400 hover:text-slate-200'}`}>{d}</button>))}</div></GlassCard>
            <GlassCard className="p-4 mt-3"><div className="flex items-center justify-between mb-2"><label className="text-xs font-semibold text-slate-400">Distance</label><span className="font-mono text-sm font-bold text-nova-300">{distance} km</span></div><input type="range" min={1} max={10} value={distance} onChange={(e) => setDistance(Number(e.target.value))} className="w-full accent-nova-400" /></GlassCard>
            <GlassCard className="p-4 mt-3"><div className="flex items-center justify-between mb-2"><label className="text-xs font-semibold text-slate-400">Duration</label><span className="font-mono text-sm font-bold text-nova-300">{duration} min</span></div><input type="range" min={10} max={90} step={5} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full accent-nova-400" /></GlassCard>
            <div className="mt-3 glass rounded-2xl p-4 flex items-center justify-between"><div className="flex items-center gap-2"><Icon name="Zap" size={16} className="text-nova-300" /><span className="text-sm font-bold text-white">+{Math.round(duration * 5 * diffMult)} XP</span></div><div className="flex items-center gap-2"><Icon name="Coins" size={16} className="text-gold-300" /><span className="text-sm font-bold text-white">+{Math.round(duration * 4 * diffMult)}</span></div></div>
            <button onClick={handleCreate} disabled={!canCreate} className={`w-full py-4 text-base mt-4 transition-all ${canCreate ? 'btn-glow' : 'glass rounded-2xl text-slate-500 cursor-not-allowed'}`}><Icon name="Check" size={20} /> Create Adventure</button>
            {!canCreate && <p className="mt-2 text-center text-[11px] text-slate-500">Enter a name (3+ chars) to continue</p>}
          </div>
        ) : (
          <div className="mt-5 animate-pop">
            <div className="glass-strong rounded-3xl p-6 text-center"><div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-nova-300 to-ember-500 flex items-center justify-center shadow-glow animate-pulse-glow"><Icon name="Check" size={40} className="text-ink-950" /></div><p className="mt-4 font-display text-xl font-bold text-white">Adventure Created!</p><p className="mt-1 text-sm text-slate-300">Your custom adventure is ready to play.</p></div>
            <div className="mt-4 relative rounded-3xl overflow-hidden glass-strong"><div className="p-5"><div className="flex items-center gap-3 mb-3"><div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${ADVENTURE_TYPE_META[type].accent} flex items-center justify-center text-2xl`}>{emoji}</div><div className="flex-1 min-w-0"><h2 className="font-display text-lg font-bold text-white truncate">{name}</h2><div className="flex items-center gap-2 mt-1"><span className="chip bg-ink-900/70 border border-white/10 text-nova-300 !px-2 !py-0.5 !text-[10px]"><Icon name={ADVENTURE_TYPE_META[type].icon} size={10} /> {ADVENTURE_TYPE_META[type].label}</span><DifficultyBadge difficulty={difficulty} /></div></div></div><p className="text-sm text-slate-300">{desc || 'A custom adventure created by you.'}</p><div className="mt-3 grid grid-cols-2 gap-3"><div className="glass rounded-xl p-2.5 flex items-center gap-2"><Icon name="Footprints" size={16} className="text-nova-300" /><span className="text-sm font-bold text-white">{distance} km</span></div><div className="glass rounded-xl p-2.5 flex items-center gap-2"><Icon name="Clock" size={16} className="text-cyan-300" /><span className="text-sm font-bold text-white">{duration} min</span></div></div></div></div>
            <div className="mt-5 flex gap-3"><button onClick={() => { setCreated(false); setName(''); setDesc(''); }} className="glass rounded-2xl px-5 py-3.5 font-semibold text-slate-200 active:scale-95">New</button><button onClick={handleStart} className="btn-glow flex-1 py-3.5">Start Adventure <Icon name="Play" size={18} /></button></div>
          </div>
        )}
      </div>
    </div>
  );
}
