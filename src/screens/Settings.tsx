import { useState } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { TopBar, BottomNav } from '../components/BottomNav';
import { GlassCard, Icon, Button, ConfirmDialog } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { loadSettings, saveSettings, type AppSettings, vibrate } from '../lib/settings';

function Toggle({ label, icon, value, onChange }: { label: string; icon: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between p-3 glass rounded-xl">
      <div className="flex items-center gap-2">
        <Icon name={icon} size={16} className="text-white/60" />
        <span className="text-sm font-bold text-white">{label}</span>
      </div>
      <button
        onClick={() => { onChange(!value); vibrate(20); }}
        className={`w-11 h-6 rounded-full transition-all flex items-center ${value ? 'bg-zeviqo-500' : 'bg-white/10'}`}
      >
        <div className={`w-5 h-5 rounded-full bg-white transition-all ${value ? 'ml-5' : 'ml-0.5'}`} />
      </button>
    </div>
  );
}

export function Settings() {
  const { resetLocalState, goBack } = useStore();
  const { signOut, resetPassword, deleteAccount } = useAuth();
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [showDelete, setShowDelete] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function updateSetting(key: keyof AppSettings, value: boolean | string) {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveSettings(updated);
  }

  async function handleResetPassword() {
    const { error } = await resetPassword(''); // Will use current user's email
    setMessage(error ? error : 'Password reset link sent to your email.');
    setShowReset(false);
  }

  async function handleDeleteAccount() {
    const { error } = await deleteAccount();
    if (error) setMessage(error);
    setShowDelete(false);
  }

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg />
      <TopBar title="Settings" showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-3 space-y-4">
        {message && (
          <GlassCard className="p-3 flex items-center gap-2">
            <Icon name="Info" size={14} className="text-zeviqo-400" />
            <p className="text-xs text-white/60">{message}</p>
          </GlassCard>
        )}

        <div>
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Icon name="Volume2" size={14} className="text-zeviqo-400" />
            Preferences
          </h3>
          <div className="space-y-2">
            <Toggle label="Sound" icon="Volume2" value={settings.soundEnabled} onChange={v => updateSetting('soundEnabled', v)} />
            <Toggle label="Haptics" icon="Vibrate" value={settings.hapticsEnabled} onChange={v => updateSetting('hapticsEnabled', v)} />
            <Toggle label="Voice Guide" icon="User" value={settings.voiceEnabled} onChange={v => updateSetting('voiceEnabled', v)} />
            <Toggle label="High Contrast" icon="Eye" value={settings.highContrast} onChange={v => updateSetting('highContrast', v)} />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Icon name="Shield" size={14} className="text-zeviqo-400" />
            Account
          </h3>
          <div className="space-y-2">
            <Button variant="secondary" fullWidth icon="Mail" onClick={() => setShowReset(true)}>Reset Password</Button>
            <Button variant="secondary" fullWidth icon="LogOut" onClick={() => signOut()}>Sign Out</Button>
            <Button variant="danger" fullWidth icon="Trash2" onClick={() => setShowDelete(true)}>Delete Account</Button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
            <Icon name="Trash2" size={14} className="text-zeviqo-400" />
            Data
          </h3>
          <Button variant="secondary" fullWidth icon="RotateCcw" onClick={() => { resetLocalState(); setMessage('Local data cleared.'); }}>
            Clear Local Data
          </Button>
        </div>

        <p className="text-center text-[10px] text-white/30 pt-4">Zeviqo v1.0.0</p>
      </div>
      <BottomNav />

      <ConfirmDialog
        visible={showDelete}
        title="Delete Account?"
        message="This will permanently delete your account and all data. This cannot be undone."
        confirmLabel="Delete Forever"
        danger
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDelete(false)}
      />
      <ConfirmDialog
        visible={showReset}
        title="Reset Password?"
        message="A password reset link will be sent to your email."
        confirmLabel="Send Link"
        onConfirm={handleResetPassword}
        onCancel={() => setShowReset(false)}
      />
    </div>
  );
}
