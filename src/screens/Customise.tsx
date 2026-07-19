import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Shuffle, Check } from 'lucide-react';
import { useState } from 'react';

const AVATARS = ['🧭', '🚶', '🏃', '🚴', '🧗', '🏕️', '🌊', '⛰️'];
const COLORS = ['#1c7af5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function Customise() {
  const goBack = useStore((s) => s.goBack);
  const { profile, updateProfile, isGuest } = useAuth();
  const navigateToAuth = useStore((s) => s.navigateToAuth);
  const [avatar, setAvatar] = useState(profile?.avatar ?? '🧭');
  const [color, setColor] = useState(profile?.avatarColor ?? '#1c7af5');
  const [saved, setSaved] = useState(false);

  function save() { updateProfile({ avatar, avatarColor: color }); setSaved(true); setTimeout(() => setSaved(false), 1500); }

  return (
    <div>
      <Header title="Customise" onBack={goBack} subtitle="Personalise your avatar" />
      <div className="px-4 py-4 space-y-4">
        {isGuest && (<Card className="bg-warning-50 border-warning-100"><p className="text-sm text-warning-800">Sign in to save your customisation.</p><Button size="sm" className="mt-2" onClick={() => navigateToAuth('customise')}>Sign In</Button></Card>)}
        <Card className="text-center py-6"><div className="w-24 h-24 rounded-full mx-auto flex items-center justify-center text-5xl" style={{ background: color }}>{avatar}</div></Card>
        <Card><h3 className="font-semibold mb-3">Avatar</h3><div className="grid grid-cols-4 gap-3">{AVATARS.map((a) => (<button key={a} onClick={() => setAvatar(a)} className={`aspect-square rounded-xl text-3xl flex items-center justify-center transition-all ${avatar === a ? 'bg-brand-100 ring-2 ring-brand-500' : 'bg-ink-50'}`}>{a}</button>))}</div></Card>
        <Card><h3 className="font-semibold mb-3">Background Color</h3><div className="grid grid-cols-4 gap-3">{COLORS.map((c) => (<button key={c} onClick={() => setColor(c)} className={`aspect-square rounded-xl transition-all ${color === c ? 'ring-2 ring-offset-2 ring-brand-500' : ''}`} style={{ background: c }}>{color === c && <Check className="text-white mx-auto" />}</button>))}</div></Card>
        <Button fullWidth onClick={save}>{saved ? <><Check size={18} className="inline mr-2" />Saved!</> : <><Shuffle size={18} className="inline mr-2" />Save Customisation</>}</Button>
      </div>
    </div>
  );
}
