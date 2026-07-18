import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { loadSettings, saveSettings, DEFAULT_SETTINGS, type AppSettings } from '../lib/settings';
import { Card, Screen, Button } from '../components/ui';
import { Volume2, Vibrate, Mic, Eye, Lock, Mail, LogOut, Trash2, ChevronRight } from 'lucide-react';

export default function Settings() {
  const { user, signOut, updatePassword, deleteAccount } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [showReset, setShowReset] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [msg, setMsg] = useState('');

  const update = (partial: Partial<AppSettings>) => { setSettings({ ...settings, ...partial }); saveSettings({ ...settings, ...partial }); };
  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button onClick={onClick} className={`w-12 h-7 rounded-full transition-colors ${on ? 'bg-zeviqo-500' : 'bg-ink-600'}`}>
      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${on ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );

  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4">Settings</h1>
      <Card className="p-4 mb-4">
        <h3 className="text-ink-400 text-sm font-semibold uppercase mb-3">Preferences</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3"><Volume2 size={20} color="#00c4ff" /><span className="flex-1 text-white">Sound Effects</span><Toggle on={settings.soundEnabled} onClick={() => update({ soundEnabled: !settings.soundEnabled })} /></div>
          <div className="flex items-center gap-3"><Vibrate size={20} color="#22c55e" /><span className="flex-1 text-white">Haptics</span><Toggle on={settings.hapticsEnabled} onClick={() => update({ hapticsEnabled: !settings.hapticsEnabled })} /></div>
          <div className="flex items-center gap-3"><Mic size={20} color="#a78bfa" /><span className="flex-1 text-white">Voice Navigation</span><Toggle on={settings.voiceEnabled} onClick={() => update({ voiceEnabled: !settings.voiceEnabled })} /></div>
          <div className="flex items-center gap-3"><Eye size={20} color="#fbbf24" /><span className="flex-1 text-white">High Contrast</span><Toggle on={settings.highContrast} onClick={() => update({ highContrast: !settings.highContrast })} /></div>
        </div>
      </Card>
      <Card className="p-4 mb-4">
        <h3 className="text-ink-400 text-sm font-semibold uppercase mb-3">Account</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 text-ink-300"><Mail size={18} /> {user?.email}</div>
          <button onClick={() => setShowReset(!showReset)} className="w-full flex items-center gap-3 text-ink-300 hover:text-white"><Lock size={18} /> Change Password <ChevronRight size={16} className="ml-auto" /></button>
          {showReset && (
            <div className="flex gap-2">
              <input value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password" type="password" className="flex-1 bg-ink-700/50 border border-ink-600/30 rounded-xl px-3 py-2 text-white text-sm" />
              <Button size="sm" onClick={async () => { const r = await updatePassword(newPw); setMsg(r.error ?? 'Password updated'); setNewPw(''); }}>Save</Button>
            </div>
          )}
          {msg && <p className="text-ink-400 text-xs">{msg}</p>}
        </div>
      </Card>
      <Button variant="danger" onClick={signOut} className="w-full mb-2 flex items-center justify-center gap-2"><LogOut size={18} /> Sign Out</Button>
      <Button variant="ghost" onClick={async () => { if (confirm('Delete your account? This cannot be undone.')) { const r = await deleteAccount(); if (r.error) alert(r.error); } }} className="w-full flex items-center justify-center gap-2 text-red-400"><Trash2 size={18} /> Delete Account</Button>
    </Screen>
  );
}
