import { useState } from 'react';
import { useStore } from '../store';
import { useSettings } from '../hooks/useSettings';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';

export default function Settings() {
  const goBack = useStore((s) => s.goBack);
  const { settings, loading, update } = useSettings();
  const [busy, setBusy] = useState(false);

  if (loading) return <div><Header title="Settings" onBack={goBack} /><div className="p-8 flex justify-center"><Spinner /></div></div>;

  async function toggle(key: 'notifications' | 'mapPreference' | 'privacy', value: any) {
    setBusy(true);
    try { await update({ [key]: value } as any); } catch { /* ignore */ } finally { setBusy(false); }
  }

  return (
    <div>
      <Header title="Settings" onBack={goBack} />
      <div className="px-4 py-4 space-y-3">
        <Card className="flex items-center justify-between">
          <div><p className="font-medium">Notifications</p><p className="text-xs text-ink-500">Adventure reminders & updates</p></div>
          <button onClick={() => toggle('notifications', !settings.notifications)}
            className={`w-12 h-6 rounded-full transition-colors ${settings.notifications ? 'bg-brand-500' : 'bg-ink-200'}`}>
            <span className={`block w-5 h-5 bg-white rounded-full transition-transform ${settings.notifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </Card>

        <Card>
          <p className="font-medium mb-2">Map Style</p>
          <div className="flex gap-2">
            {(['standard', 'satellite'] as const).map((m) => (
              <Button key={m} size="sm" variant={settings.mapPreference === m ? 'primary' : 'secondary'} onClick={() => toggle('mapPreference', m)}>
                {m}
              </Button>
            ))}
          </div>
        </Card>

        <Card>
          <p className="font-medium mb-2">Privacy</p>
          <div className="flex gap-2 flex-wrap">
            {(['public', 'friends', 'private'] as const).map((p) => (
              <Button key={p} size="sm" variant={settings.privacy === p ? 'primary' : 'secondary'} onClick={() => toggle('privacy', p)}>
                {p}
              </Button>
            ))}
          </div>
        </Card>

        {busy && <p className="text-xs text-ink-400 text-center">Saving...</p>}
      </div>
    </div>
  );
}
