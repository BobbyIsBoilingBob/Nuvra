import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Button, ConfirmDialog } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { BottomNav } from '../components/BottomNav';
import { loadSettings, saveSettings, DEFAULT_SETTINGS, type AppSettings } from '../lib/settings';
import { useState, useEffect } from 'react';

export function Settings() {
  const { signOut, resetPassword, updatePassword, deleteAccount } = useAuth();
  const { profile } = useAuth();
  const { resetLocalState } = useStore();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [showReset, setShowReset] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { setSettings(loadSettings()); }, []);
  function updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    const updated = { ...settings, [key]: value };
    setSettings(updated); saveSettings(updated);
  }

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg />
      <TopBar title="Settings" showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        <GlassCard className="p-4 space-y-3">
          <h3 className="text-sm font-bold text-white">Preferences</h3>
          <ToggleRow icon="Volume2" label="Sound Effects" value={settings.soundEnabled} onChange={v => updateSetting('soundEnabled', v)} />
          <ToggleRow icon="Vibrate" label="Haptics" value={settings.hapticsEnabled} onChange={v => updateSetting('hapticsEnabled', v)} />
          <ToggleRow icon="BookOpen" label="Voice Guide" value={settings.voiceEnabled} onChange={v => updateSetting('voiceEnabled', v)} />
          <ToggleRow icon="Eye" label="High Contrast" value={settings.highContrast} onChange={v => updateSetting('highContrast', v)} />
        </GlassCard>

        <GlassCard className="p-4 space-y-3">
          <h3 className="text-sm font-bold text-white">Account</h3>
          <div className="text-xs text-white/40">Email: {profile?.username ? 'Connected' : 'Not set'}</div>
          <Button fullWidth variant="secondary" icon="Mail" onClick={() => { setMsg(null); setShowReset(true); }}>Reset Password</Button>
          <Button fullWidth variant="danger" icon="LogOut" onClick={() => setShowSignOut(true)}>Sign Out</Button>
        </GlassCard>

        <GlassCard className="p-4 space-y-3">
          <h3 className="text-sm font-bold text-white">Data</h3>
          <Button fullWidth variant="secondary" icon="Trash2" onClick={resetLocalState}>Clear Local Data</Button>
          <Button fullWidth variant="danger" icon="AlertCircle" onClick={() => setShowDelete(true)}>Delete Account</Button>
        </GlassCard>

        {msg && <div className="glass rounded-xl px-3 py-2 text-xs text-zeviqo-300">{msg}</div>}
      </div>
      <BottomNav />

      <ConfirmDialog visible={showSignOut} title="Sign Out?" message="You will need to sign in again to access your adventures." confirmLabel="Sign Out" onConfirm={() => { setShowSignOut(false); signOut(); }} onCancel={() => setShowSignOut(false)} />
      <ConfirmDialog visible={showDelete} title="Delete Account?" message="This will permanently delete your account and all data. This cannot be undone." confirmLabel="Delete" danger onConfirm={async () => { setShowDelete(false); const { error } = await deleteAccount(); if (error) setMsg(error); }} onCancel={() => setShowDelete(false)} />
      <ConfirmDialog visible={showReset} title="Reset Password" message="Enter your email to receive a reset link." confirmLabel="Send" onConfirm={async () => { const { error } = await resetPassword(resetEmail); setShowReset(false); setMsg(error ?? 'Reset link sent!'); }} onCancel={() => setShowReset(false)} />
    </div>
  );
}

function ToggleRow({ icon, label, value, onChange }: { icon: string; label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2"><Icon name={icon} size={16} className="text-white/50" /><span className="text-xs text-white/70">{label}</span></div>
      <button onClick={() => onChange(!value)} className={`w-11 h-6 rounded-full transition-colors ${value ? 'bg-zeviqo-500' : 'bg-white/10'}`}>
        <div className={`w-5 h-5 rounded-full bg-white transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`} />
      </button>
    </div>
  );
}
