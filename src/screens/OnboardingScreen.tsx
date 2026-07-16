import { useState } from 'react';
import { useStore } from '../store';
import { AdventureBg } from '../components/AdventureBg';
import { Icon, ProgressBar, AvatarBadge } from '../components/ui';
import { AVATARS, ADVENTURE_STYLES, type Avatar, type AdventureStyle } from '../data';

const STEPS = ['username', 'avatar', 'style', 'goals'] as const;
type Step = (typeof STEPS)[number];

export function OnboardingScreen() {
  const { setupProfile } = useStore();
  const [step, setStep] = useState<Step>('username');
  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState<Avatar>(AVATARS[0]);
  const [style, setStyle] = useState<AdventureStyle>('explorer');
  const [goal, setGoal] = useState(3);
  const stepIndex = STEPS.indexOf(step);
  const next = () => setStep(STEPS[Math.min(stepIndex + 1, STEPS.length - 1)]);
  const back = () => setStep(STEPS[Math.max(stepIndex - 1, 0)]);
  const finish = () => setupProfile(username.trim() || 'Explorer', avatar, style);

  return (
    <div className="relative min-h-screen flex flex-col px-6 py-10 overflow-hidden">
      <AdventureBg />
      <div className="relative z-10 mx-auto w-full max-w-md flex flex-col flex-1">
        <div className="flex items-center gap-3 mb-8"><div className="flex-1"><ProgressBar value={(stepIndex + 1) / STEPS.length} /></div><span className="text-xs font-semibold text-slate-400">{stepIndex + 1}/{STEPS.length}</span></div>
        <div className="flex-1 animate-rise" key={step}>
          {step === 'username' && (<Section title="What should we call you?" sub="Pick your adventurer name."><input value={username} onChange={(e) => setUsername(e.target.value)} maxLength={18} placeholder="e.g. Nova_Walker" className="w-full glass rounded-2xl px-5 py-4 text-lg font-semibold text-white placeholder:text-slate-500 outline-none focus:border-nova-400/50" /><p className="mt-3 text-xs text-slate-400">{username.length}/18 characters</p></Section>)}
          {step === 'avatar' && (<Section title="Choose your avatar" sub="Your companion on every journey."><div className="grid grid-cols-3 gap-3">{AVATARS.map((a) => (<button key={a.id} onClick={() => setAvatar(a)} className={`glass rounded-2xl p-4 flex flex-col items-center gap-2 transition-all ${avatar.id === a.id ? 'border-nova-400/60 shadow-glow scale-105' : 'hover:border-white/20'}`}><AvatarBadge emoji={a.emoji} color={a.color} size="lg" ring={false} /><span className="text-xs font-semibold text-slate-200">{a.name}</span></button>))}</div></Section>)}
          {step === 'style' && (<Section title="Your adventure style" sub="We'll tailor quests to match."><div className="flex flex-col gap-3">{ADVENTURE_STYLES.map((s) => (<button key={s.id} onClick={() => setStyle(s.id)} className={`glass rounded-2xl p-4 flex items-center gap-4 text-left transition-all ${style === s.id ? 'border-nova-400/60 shadow-glow' : 'hover:border-white/20'}`}><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-nova-300 to-nova-500 flex items-center justify-center shrink-0"><Icon name={s.icon} size={24} className="text-ink-950" /></div><div><p className="font-bold text-white">{s.label}</p><p className="text-xs text-slate-300">{s.desc}</p></div>{style === s.id && <Icon name="Check" size={20} className="ml-auto text-nova-300" />}</button>))}</div></Section>)}
          {step === 'goals' && (<Section title="Set your daily goal" sub="How many km per day feels right?"><div className="glass rounded-3xl p-6 text-center"><div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-nova-300 to-ember-500 flex items-center justify-center shadow-glow animate-pulse-glow"><span className="font-display text-3xl font-extrabold text-ink-950">{goal}</span></div><p className="mt-3 text-sm text-slate-300">km per day</p><input type="range" min={1} max={10} value={goal} onChange={(e) => setGoal(Number(e.target.value))} className="w-full mt-5 accent-nova-400" /><div className="flex justify-between text-[10px] text-slate-500 mt-1"><span>Casual</span><span>Ambitious</span></div></div></Section>)}
        </div>
        <div className="flex gap-3 mt-8">
          {stepIndex > 0 && <button onClick={back} className="glass rounded-2xl px-5 py-3.5 font-semibold text-slate-200 active:scale-95">Back</button>}
          {stepIndex < STEPS.length - 1 ? <button onClick={next} className="btn-glow flex-1 py-3.5">Continue <Icon name="ArrowRight" size={18} /></button> : <button onClick={finish} className="btn-glow flex-1 py-3.5">Begin Adventure <Icon name="Sparkles" size={18} /></button>}
        </div>
      </div>
    </div>
  );
}

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (<><h1 className="font-display text-2xl font-extrabold text-white tracking-tight">{title}</h1><p className="text-sm text-slate-400 mt-1 mb-6">{sub}</p>{children}</>);
}
