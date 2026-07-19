import { useState } from 'react';
import { useStore } from '../store';
import { useCustomise } from '../hooks/useCustomise';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { Check } from 'lucide-react';

export default function Customise() {
  const goBack = useStore((s) => s.goBack);
  const { emoji, color, loading, save, emojis, colors } = useCustomise();
  const [selEmoji, setSelEmoji] = useState(emoji);
  const [selColor, setSelColor] = useState(color);
  const [busy, setBusy] = useState(false);

  if (loading) return <div><Header title="Customise Avatar" onBack={goBack} /><div className="p-8 flex justify-center"><Spinner /></div></div>;

  async function doSave() {
    setBusy(true);
    try { await save(selEmoji, selColor); goBack(); } catch { /* ignore */ } finally { setBusy(false); }
  }

  return (
    <div>
      <Header title="Customise Avatar" onBack={goBack} />
      <div className="px-4 py-4 space-y-4">
        <Card className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl" style={{ background: selColor }}>{selEmoji}</div>
          <div><p className="font-semibold">Preview</p><p className="text-sm text-ink-500">This is how others see you.</p></div>
        </Card>

        <div>
          <h2 className="font-semibold mb-2">Avatar</h2>
          <div className="grid grid-cols-6 gap-2">
            {emojis.map((e) => (
              <button key={e} onClick={() => setSelEmoji(e)}
                className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all ${selEmoji === e ? 'bg-brand-100 ring-2 ring-brand-500' : 'bg-ink-100'}`}>
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Colour</h2>
          <div className="grid grid-cols-8 gap-2">
            {colors.map((c) => (
              <button key={c} onClick={() => setSelColor(c)} style={{ background: c }}
                className={`aspect-square rounded-full transition-all ${selColor === c ? 'ring-2 ring-offset-2 ring-ink-900' : ''}`} />
            ))}
          </div>
        </div>

        <Button fullWidth onClick={doSave} disabled={busy || (selEmoji === emoji && selColor === color)}>
          {busy ? <Spinner size={18} className="mx-auto" /> : <><Check size={18} className="inline mr-2" />Save</>}
        </Button>
      </div>
    </div>
  );
}
