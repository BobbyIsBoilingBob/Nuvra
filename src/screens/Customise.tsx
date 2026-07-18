import { useState } from 'react';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { useCustomise } from '../hooks/useCustomise';
import { AVATAR_EMOJIS, AVATAR_COLORS } from '../data/gameData';
import { Palette, Save, Check } from 'lucide-react';

export default function Customise() {
  const navigate = useStore((s) => s.navigate);
  const { isGuest } = useAuth();
  const { avatar, loading, saving, error, save } = useCustomise();
  const [localEmoji, setLocalEmoji] = useState<string | null>(null);
  const [localColor, setLocalColor] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (isGuest) {
    return (
      <div className="pb-24"><Header title="Customise" />
        <div className="px-4 py-10 text-center"><Palette size={48} className="text-ink-500 mx-auto" /><p className="text-ink-300 mt-4">Sign in to customise your avatar.</p><Button className="mt-4" onClick={() => navigate('auth')}>Sign In</Button></div>
      </div>
    );
  }

  if (loading) return <div className="pb-24"><Header title="Customise" /><Spinner label="Loading avatar…" /></div>;

  const currentEmoji = localEmoji ?? avatar.emoji;
  const currentColor = localColor ?? avatar.color;
  const hasChanges = localEmoji !== null || localColor !== null;

  const handleSave = async () => {
    setSaveError(null);
    const res = await save({ emoji: currentEmoji, color: currentColor });
    if (res.error) { setSaveError(res.error); return; }
    setLocalEmoji(null);
    setLocalColor(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="pb-24"><Header title="Customise" />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {error && <p className="text-error-400 text-sm">{error}</p>}
        {saveError && <p className="text-error-400 text-sm">{saveError}</p>}

        <Card className="p-6 text-center">
          <div className="h-24 w-24 rounded-full mx-auto flex items-center justify-center text-5xl transition-all"
            style={{ backgroundColor: currentColor + '30', border: `3px solid ${currentColor}` }}>
            {currentEmoji}
          </div>
          <p className="text-white font-semibold mt-3">Your Avatar</p>
          <p className="text-ink-400 text-sm">Choose an emoji and color</p>
        </Card>

        <Card className="p-4">
          <h3 className="font-display font-bold text-white mb-3">Choose an emoji</h3>
          <div className="grid grid-cols-6 gap-2">
            {AVATAR_EMOJIS.map((emoji) => (
              <button key={emoji} onClick={() => setLocalEmoji(emoji)}
                className={`h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${currentEmoji === emoji ? 'bg-brand-500/30 border-2 border-brand-500' : 'bg-ink-900 border border-ink-700 hover:border-ink-600'}`}>
                {emoji}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-display font-bold text-white mb-3">Choose a color</h3>
          <div className="flex flex-wrap gap-3">
            {AVATAR_COLORS.map((color) => (
              <button key={color} onClick={() => setLocalColor(color)}
                className={`h-10 w-10 rounded-full transition-all ${currentColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-ink-800 scale-110' : 'hover:scale-105'}`}
                style={{ backgroundColor: color }}
                aria-label={`Color ${color}`}
              />
            ))}
          </div>
        </Card>

        {hasChanges && (
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? <Spinner /> : saved ? <><Check size={18} /> Saved!</> : <><Save size={18} /> Save Avatar</>}
          </Button>
        )}
      </div>
    </div>
  );
}
