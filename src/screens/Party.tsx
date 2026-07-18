import { useState } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { useParty } from '../hooks/useParty';
import { useFriends } from '../hooks/useFriends';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import { Users, Plus, UserPlus, LogOut, Crown } from 'lucide-react';

export default function Party() {
  const navigate = useStore((s) => s.navigate);
  const { isGuest, user } = useAuth();
  const { party, loading, error, createParty, inviteFriend, leaveParty } = useParty();
  const { friends } = useFriends();
  const [showCreate, setShowCreate] = useState(false);
  const [partyName, setPartyName] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (isGuest) {
    return (
      <div className="pb-24"><Header title="Party" />
        <div className="px-4 py-10 text-center"><Users size={48} className="text-ink-500 mx-auto" /><p className="text-ink-300 mt-4">Sign in to form a walking party.</p><Button className="mt-4" onClick={() => navigate('auth')}>Sign In</Button></div>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!partyName.trim()) { setActionError('Party name is required.'); return; }
    setBusy(true);
    setActionError(null);
    const res = await createParty(partyName);
    setBusy(false);
    if (res.error) { setActionError(res.error); return; }
    setPartyName('');
    setShowCreate(false);
  };

  const handleInvite = async (friendId: string) => {
    setBusy(true);
    setActionError(null);
    const res = await inviteFriend(friendId);
    setBusy(false);
    if (res.error) { setActionError(res.error); return; }
    setShowInvite(false);
  };

  const handleLeave = async () => {
    setBusy(true);
    setActionError(null);
    const res = await leaveParty();
    setBusy(false);
    if (res.error) setActionError(res.error);
  };

  return (
    <div className="pb-24"><Header title="Party" />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {actionError && <p className="text-error-400 text-sm">{actionError}</p>}
        {error && <p className="text-error-400 text-sm">{error}</p>}
        {loading && <Spinner label="Loading party…" />}

        {!loading && !party && !showCreate && (
          <Card className="p-5 text-center">
            <Users size={40} className="text-brand-400 mx-auto" />
            <p className="text-white font-semibold mt-3">No active party</p>
            <p className="text-ink-400 text-sm mt-1">Create a party to walk with friends.</p>
            <Button className="mt-4" onClick={() => setShowCreate(true)}><Plus size={18} /> Create Party</Button>
          </Card>
        )}

        {showCreate && (
          <Card className="p-5">
            <h3 className="font-display font-bold text-white mb-3">Create a new party</h3>
            <input value={partyName} onChange={(e) => setPartyName(e.target.value)} placeholder="Party name"
              className="w-full px-3 py-2 rounded-xl bg-ink-900 border border-ink-700 text-white outline-none focus:border-brand-500" />
            <div className="flex gap-3 mt-3">
              <Button variant="secondary" className="flex-1" onClick={() => { setShowCreate(false); setPartyName(''); setActionError(null); }}>Cancel</Button>
              <Button className="flex-1" onClick={handleCreate} disabled={busy}>{busy ? <Spinner /> : 'Create'}</Button>
            </div>
          </Card>
        )}

        {!loading && party && (
          <>
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-white">{party.name}</h3>
                  <p className="text-ink-400 text-sm capitalize">{party.status} • {party.members.length} member(s)</p>
                </div>
                {party.leaderId === user?.id && <Crown size={20} className="text-accent-400" />}
              </div>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold text-white mb-3">Members</h4>
              <div className="space-y-2">
                {party.members.map((m) => (
                  <div key={m.userId} className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-brand-500/20 flex items-center justify-center text-sm font-bold text-brand-300">
                      {m.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white flex-1">{m.username}</span>
                    {m.role === 'leader' && <Crown size={16} className="text-accent-400" />}
                    <span className="text-ink-400 text-xs capitalize">{m.role}</span>
                  </div>
                ))}
              </div>
            </Card>

            {party.leaderId === user?.id && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-white">Invite friends</h4>
                  <Button size="sm" variant="ghost" onClick={() => setShowInvite(!showInvite)}><UserPlus size={16} /></Button>
                </div>
                {showInvite && (
                  <div className="space-y-2">
                    {friends.length === 0 && <p className="text-ink-400 text-sm">No friends to invite. Add friends first.</p>}
                    {friends.map((f) => (
                      <div key={f.id} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-brand-500/20 flex items-center justify-center text-sm">{f.avatar ?? '🧭'}</div>
                        <span className="text-white flex-1 text-sm">{f.username}</span>
                        <Button size="sm" onClick={() => handleInvite(f.id)} disabled={busy}>Invite</Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            <Button variant="danger" className="w-full" onClick={handleLeave} disabled={busy}>
              <LogOut size={18} /> Leave Party
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
