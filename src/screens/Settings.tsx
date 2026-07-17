import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { useSettings } from '../lib/settings';
import { useStore } from '../store';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Button, ConfirmDialog, Modal, Pill } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { vibrate } from '../lib/settings';

function Toggle({ label, icon, desc, value, onChange }: { label: string; icon: string; desc: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-9 h-9 rounded-xl glass flex items-center justify-center"><Icon name={icon} size={16} className="text-white/60" /></div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-white">{label}</p>
        <p className="text-[10px] text-white/40">{desc}</p>
      </div>
      <button onClick={() => { onChange(!value); vibrate(10); }} className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${value ? 'bg-zeviqo-500' : 'bg-white/10'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${value ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

export function Settings() {
  const { profile, signOut, updatePassword, updateEmail, deleteAccount } = useAuth();
  const { settings, updateSetting, resetSettings } = useSettings();
  const { resetLocalState } = useStore();
  const [showDelete, setShowDelete] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handlePassword = async () => {
    const { error } = await updatePassword(newPassword);
    if (error) setMsg({ type: 'error', text: error });
    else { setMsg({ type: 'success', text: 'Password updated.' }); setNewPassword(''); setShowPasswordModal(false); }
  };

  const handleEmail = async () => {
    const { error } = await updateEmail(newEmail);
    if (error) setMsg({ type: 'error', text: error });
    else { setMsg({ type: 'success', text: 'Email update requested. Check your inbox to confirm.' }); setNewEmail(''); setShowEmailModal(false); }
  };

  const handleDelete = async () => {
    const { error } = await deleteAccount();
    if (error) setMsg({ type: 'error', text: error });
    else resetLocalState();
    setShowDelete(false);
  };

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg />
      <TopBar title="Settings" showBack />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        {msg && (
          <GlassCard className={`p-3 animate-fade-in ${msg.type === 'error' ? 'border-rose-500/20' : 'border-emerald-500/20'}`}>
            <div className="flex items-center gap-2">
              <Icon name={msg.type === 'error' ? 'AlertCircle' : 'CheckCircle'} size={14} className={msg.type === 'error' ? 'text-rose-400' : 'text-emerald-400'} />
              <span className={`text-xs ${msg.type === 'error' ? 'text-rose-300' : 'text-emerald-300'}`}>{msg.text}</span>
            </div>
          </GlassCard>
        )}

        <GlassCard className="p-4 animate-slide-up">
          <h3 className="text-xs font-bold text-white/40 uppercase mb-1">Preferences</h3>
          <Toggle label="Vibration" icon="Vibrate" desc="Haptic feedback during adventures" value={settings.vibration} onChange={v => updateSetting('vibration', v)} />
          <Toggle label="Sound" icon="Volume2" desc="Audio feedback for actions" value={settings.sound} onChange={v => updateSetting('sound', v)} />
          <Toggle label="Notifications" icon="Bell" desc="Friend requests and alerts" value={settings.notifications} onChange={v => updateSetting('notifications', v)} />
          <Toggle label="GPS Tracking" icon="MapPin" desc="High-accuracy location tracking" value={settings.gpsTracking} onChange={v => updateSetting('gpsTracking', v)} />
          <Toggle label="Reduce Motion" icon="Sparkles" desc="Minimize animations" value={settings.reduceMotion} onChange={v => updateSetting('reduceMotion', v)} />
          <button onClick={() => { resetSettings(); vibrate(20); }} className="text-xs text-zeviqo-400 font-bold mt-2">Reset to defaults</button>
        </GlassCard>

        <GlassCard className="p-4 animate-slide-up">
          <h3 className="text-xs font-bold text-white/40 uppercase mb-2">Account</h3>
          <div className="flex items-center gap-3 py-2">
            <ProfileAvatarInline emoji={profile?.avatar_emoji ?? '🧭'} color={profile?.avatar_color ?? '#00c4ff'} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">{profile?.username}</p>
              <p className="text-[10px] text-white/40">{profile?.level ? `Level ${profile.level}` : ''}</p>
            </div>
            <Pill accent="text-zeviqo-300 border-zeviqo-500/20">LV {profile?.level ?? 1}</Pill>
          </div>
          <div className="space-y-1 mt-2">
            <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center gap-3 py-2.5 text-left">
              <Icon name="Lock" size={16} className="text-white/50" /><span className="text-sm text-white/70">Change Password</span>
            </button>
            <button onClick={() => setShowEmailModal(true)} className="w-full flex items-center gap-3 py-2.5 text-left">
              <Icon name="Mail" size={16} className="text-white/50" /><span className="text-sm text-white/70">Change Email</span>
            </button>
            <button onClick={signOut} className="w-full flex items-center gap-3 py-2.5 text-left">
              <Icon name="LogOut" size={16} className="text-white/50" /><span className="text-sm text-white/70">Log Out</span>
            </button>
          </div>
        </GlassCard>

        <GlassCard className="p-4 animate-slide-up border-rose-500/10">
          <h3 className="text-xs font-bold text-rose-400/60 uppercase mb-2">Danger Zone</h3>
          <Button variant="danger" size="md" icon="Trash2" onClick={() => setShowDelete(true)}>Delete Account</Button>
          <p className="text-[10px] text-white/30 mt-2">This permanently deletes your profile, friends, and data. This cannot be undone.</p>
        </GlassCard>

        <p className="text-center text-[10px] text-white/20 pb-4">Zeviqo v14.0.0 · Beta</p>
      </div>

      <ConfirmDialog visible={showDelete} title="Delete Account?" message="This will permanently delete your account and all associated data. This action cannot be undone." confirmLabel="Delete" danger onConfirm={handleDelete} onCancel={() => setShowDelete(false)} />

      <Modal visible={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
        <div className="space-y-3">
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password (min 6 chars)" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-zeviqo-400/50" />
          <Button fullWidth size="md" onClick={handlePassword} disabled={newPassword.length < 6}>Update Password</Button>
        </div>
      </Modal>

      <Modal visible={showEmailModal} onClose={() => setShowEmailModal(false)} title="Change Email">
        <div className="space-y-3">
          <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="New email address" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-zeviqo-400/50" />
          <Button fullWidth size="md" onClick={handleEmail} disabled={!newEmail.includes('@')}>Update Email</Button>
        </div>
      </Modal>
    </div>
  );
}

function ProfileAvatarInline({ emoji, color }: { emoji: string; color: string }) {
  return <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: `${color}22`, border: `1px solid ${color}44` }}>{emoji}</div>;
}
