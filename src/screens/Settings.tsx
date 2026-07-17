import { useState } from 'react';
import { GlassCard, Button, Icon, Modal } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';

export function Settings() {
  const { profile, signOut, updatePassword, updateEmail, deleteAccount, updateProfile } = useAuth();
  const { resetLocalState } = useStore();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!profile) return null;

  const handleChangePassword = async () => {
    setError(null); setSuccess(null); setLoading(true);
    const { error } = await updatePassword(newPassword);
    if (error) setError(error); else { setSuccess('Password updated successfully!'); setShowPasswordModal(false); setNewPassword(''); }
    setLoading(false);
  };

  const handleChangeEmail = async () => {
    setError(null); setSuccess(null); setLoading(true);
    const { error } = await updateEmail(newEmail);
    if (error) setError(error); else { setSuccess('Email update link sent! Check your inbox to confirm.'); setShowEmailModal(false); setNewEmail(''); }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    setError(null); setLoading(true);
    const { error } = await deleteAccount();
    if (error) setError(error);
    else { resetLocalState(); }
    setLoading(false);
  };

  const handleUpdateUsername = (username: string) => {
    if (username.length >= 3 && username.length <= 20 && /^[a-zA-Z0-9_]+$/.test(username)) {
      updateProfile({ username });
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#3dd4ff" />
      <div className="relative z-10"><TopBar title="Settings" showBack showCurrencies={false} />
        <div className="px-4 max-w-md mx-auto flex flex-col gap-4 pt-4">
          {error && <div className="glass rounded-xl px-4 py-2.5 text-xs text-rose-300 font-bold text-center">{error}</div>}
          {success && <div className="glass rounded-xl px-4 py-2.5 text-xs text-emerald-300 font-bold text-center">{success}</div>}

          <GlassCard className="p-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-white/60 mb-3">Profile</h3>
            <div className="mb-3">
              <label className="text-xs text-white/40 mb-1 block">Username</label>
              <input type="text" defaultValue={profile.username} onChange={e => handleUpdateUsername(e.target.value.slice(0, 20))} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm font-bold outline-none focus:border-zeviqo-400/50" maxLength={20} />
            </div>
            <div className="mb-3">
              <label className="text-xs text-white/40 mb-1 block">Avatar Emoji</label>
              <input type="text" defaultValue={profile.avatar_emoji} onChange={e => updateProfile({ avatar_emoji: e.target.value.slice(0, 2) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-2xl text-center outline-none focus:border-zeviqo-400/50" maxLength={2} />
            </div>
            {profile.bio !== undefined && (
              <div>
                <label className="text-xs text-white/40 mb-1 block">Bio</label>
                <input type="text" defaultValue={profile.bio ?? ''} onChange={e => updateProfile({ bio: e.target.value.slice(0, 100) })} placeholder="Tell others about yourself..." className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-zeviqo-400/50" maxLength={100} />
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-white/60 mb-3">Account</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Email</span>
                <span className="text-white/70 truncate ml-2">{profile.id ? '••••@••••' : ''}</span>
              </div>
              <Button variant="secondary" size="sm" fullWidth icon="Lock" onClick={() => setShowPasswordModal(true)}>Change Password</Button>
              <Button variant="secondary" size="sm" fullWidth icon="Mail" onClick={() => setShowEmailModal(true)}>Change Email</Button>
              <Button variant="ghost" size="sm" fullWidth icon="LogOut" onClick={() => signOut()}>Log Out</Button>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-white/60 mb-3">About Zeviqo</h3>
            <div className="flex flex-col gap-2 text-xs text-white/50">
              <div className="flex justify-between"><span>Version</span><span className="text-white/70">13.0.0</span></div>
              <div className="flex justify-between"><span>Member since</span><span className="text-white/70">{new Date(profile.created_at).toLocaleDateString()}</span></div>
            </div>
          </GlassCard>

          <GlassCard className="p-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-rose-300 mb-3">Danger Zone</h3>
            <Button variant="danger" size="sm" icon="Trash2" onClick={() => setShowDeleteModal(true)}>Delete Account</Button>
          </GlassCard>
        </div>
      </div>

      <Modal visible={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
        <div className="flex flex-col gap-3">
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password (min 6 chars)" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-zeviqo-400/50" />
          <Button variant="primary" size="md" fullWidth disabled={newPassword.length < 6 || loading} onClick={handleChangePassword}>{loading ? 'Updating...' : 'Update Password'}</Button>
        </div>
      </Modal>

      <Modal visible={showEmailModal} onClose={() => setShowEmailModal(false)} title="Change Email">
        <div className="flex flex-col gap-3">
          <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="New email address" className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-zeviqo-400/50" />
          <Button variant="primary" size="md" fullWidth disabled={!newEmail.includes('@') || loading} onClick={handleChangeEmail}>{loading ? 'Sending...' : 'Send Confirmation'}</Button>
        </div>
      </Modal>

      <Modal visible={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Account">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <Icon name="AlertTriangle" size={20} className="text-rose-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-white/60">This will permanently delete your account, profile, and all associated data. This action cannot be undone.</p>
          </div>
          <Button variant="danger" size="md" fullWidth disabled={loading} onClick={handleDeleteAccount}>{loading ? 'Deleting...' : 'Delete My Account'}</Button>
        </div>
      </Modal>
    </div>
  );
}
