import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useStore } from '../store';
import { Card, Screen, Button } from '../components/ui';
import { ChevronRight, MapPin, Trophy, Users, Gift } from 'lucide-react';

const steps = [
  { icon: MapPin, title: 'Explore the World', desc: 'Walk around your neighborhood to discover adventures and complete quests in real locations.' },
  { icon: Trophy, title: 'Complete Quests', desc: 'Finish location-based challenges to earn XP, coins, and level up your character.' },
  { icon: Users, title: 'Play with Friends', desc: 'Create parties, add friends, and adventure together in real-time.' },
  { icon: Gift, title: 'Earn Rewards', desc: 'Claim daily rewards, unlock cosmetics, and customize your profile.' },
];

export default function Onboarding() {
  const { profile, updateProfile } = useAuth(); const { setScreen } = useStore(); const [step, setStep] = useState(0);
  const finish = async () => { await updateProfile({ onboarding_complete: true }); setScreen('home'); };
  if (step >= steps.length) return (
    <Screen className="flex items-center justify-center"><Card className="p-6 text-center"><div className="text-5xl mb-4">🎉</div><h2 className="font-display text-xl font-bold text-white mb-2">You're all set!</h2><p className="text-ink-400 text-sm mb-4">Ready to start your adventure?</p><Button onClick={finish} className="w-full">Start Exploring</Button></Card></Screen>
  );
  const s = steps[step]; const Icon = s.icon;
  return (
    <Screen className="flex flex-col justify-center">
      <div className="flex justify-center gap-1.5 mb-8">{steps.map((_, i) => <div key={i} className={`h-1.5 rounded-full transition-all ${i <= step ? 'bg-zeviqo-500 w-8' : 'bg-ink-700 w-4'}`} />)}</div>
      <Card className="p-6 text-center"><div className="w-16 h-16 rounded-2xl bg-zeviqo-500/20 flex items-center justify-center mx-auto mb-4"><Icon size={32} color="#fbbf24" /></div><h2 className="font-display text-xl font-bold text-white mb-2">{s.title}</h2><p className="text-ink-400 text-sm mb-6">{s.desc}</p><div className="flex gap-2">{step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button>}<Button className="flex-1 flex items-center justify-center gap-1" onClick={() => setStep(step + 1)}>{step === steps.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={18} /></Button></div></Card>
      <button onClick={finish} className="text-ink-500 text-sm mt-6 text-center">Skip</button>
    </Screen>
  );
}
