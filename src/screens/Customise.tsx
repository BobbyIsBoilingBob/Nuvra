import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useStore } from '../store';
import { Card, Screen, Button } from '../components/ui';
import { Palette, Check } from 'lucide-react';

const AVATAR_EMOJIS = ['🧭', '🗺️', '⚔️', '🏔️', '⭐', '👑', '🔥', '💎', '🌊', '🌿', '🌅', '🌙', '⚡', '🦉', '🐉', '🐱'];
const AVATAR_COLORS = ['#00c4ff', '#22c55e', '#fbbf24', '#fb923c', '#ef4444', '#a78bfa', '#ec4899', '#06b6d4'];

export default function Customise() {
  const { profile, updateProfile } = useAuth();
  const { setScreen } = useStore();
  const [emoji, setEmoji] = useState(profile?.avatar_emoji ?? '🧭');
  const [color, setColor] = useState(profile?.avatar_color ?? '#00c4ff');
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    await updateProfile({ avatar_emoji: emoji, avatar_color: color });
    setSaved(true);
    setTimeout(() => { setSaved(false); setScreen('profile'); }, 1000);
  };

  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4 flex items-center gap-2"><Palette size={24} color="#a78bfa" /> Customise</h1>
      <Card className="p-4 mb-4 text-center">
        <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center text-4xl mb-2" style={{ background: `${color}22` }}>{emoji}</div>
        <p className="text-white font-semibold">{profile?.username}</p>
      </Card>
      <Card className="p-4 mb-4">
        <h3 className="text-ink-400 text-sm font-semibold uppercase mb-3">Avatar</h3>
        <div className="grid grid-cols-8 gap-2">{AVATAR_EMOJIS.map(e => (
          <button key={e} onClick={() => setEmoji(e)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${emoji === e ? 'bg-zeviqo-500/30 border-2 border-zeviqo-500' : 'bg-ink-700/30'}`}>{e}</button>
        ))}</div>
      </Card>
      <Card className="p-4 mb-4">
        <h3 className="text-ink-400 text-sm font-semibold uppercase mb-3">Color</h3>
        <div className="flex flex-wrap gap-3">{AVATAR_COLORS.map(c => (
          <button key={c} onClick={() => setColor(c)} className={`w-10 h-10 rounded-full transition-all ${color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-ink-900' : ''}`} style={{ background: c }} />
        ))}</div>
      </Card>
      <Button onClick={handleSave} className="w-full flex items-center justify-center gap-2">{saved ? <><Check size={18} /> Saved!</> : 'Save Changes'}</Button>
    </Screen>
  );
}
