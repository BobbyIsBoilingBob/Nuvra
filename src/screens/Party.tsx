import { useState } from 'react';
import { useStore } from '../store';
import { useParty } from '../hooks/useParty';
import { useFriends } from '../hooks/useFriends';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { Users, Plus, LogOut, UserPlus } from 'lucide-react';

export default function Party() {
  const goBack = useStore((s) => s.goBack);
  const { party, members, loading, create, invite, leave } = useParty();
  const { friends } = useFriends();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function doCreate() {
    setBusy(true); setError(null);
    try { await create(name || 'Walking Party'); } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  async function doInvite(uid: string) {
    setBusy(true); setError(null);
    try { await invite(uid); } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  async function doLeave() {
    setBusy(true); setError(null);
    try { await leave(); } catch (e: any) { setError(e.message); } finally { setBusy(false); }
  }

  return (
    <div>
      <Header title="Party" onBack={goBack} />
      <div className="px-4 py-4 space-y-4">
        {loading && <div className="flex justify-center"><Spinner /></div>}
        {error && <p className="text-sm text-error-600">{error}</p>}

        {!party ? (
          <Card>
            <h2 className="font-semibold mb-2">Create a Party</h2>
            <p className="text-sm text-ink-500 mb-3">Walk together with friends and share the adventure.</p>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Party name"
              className="w-full px-3 py-2 rounded-lg border border-ink-200 mb-3" />
            <Button fullWidth onClick={doCreate} disabled={busy}>
              {busy ? <Spinner size={18} className="mx-auto" /> : <><Plus size={18} className="inline mr-2" />Create Party</>}
            </Button>
          </Card>
        ) : (
          <>
            <Card className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center"><Users size={24} /></div>
              <div className="flex-1">
                <p className="font-semibold">{party.name}</p>
                <p className="text-xs text-ink-500">{members.length} member{members.length !== 1 ? 's' : ''}</p>
              </div>
            </Card>

            <div>
              <h2 className="font-semibold mb-2">Members</h2>
              <div className="space-y-2">
                {members.map((m) => (
                  <Card key={m.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: m.avatar_color }}>{m.avatar_emoji}</div>
                    <span className="flex-1 font-medium">{m.username}</span>
                    <span className="text-xs text-ink-400">{m.role}</span>
                  </Card>
                ))}
              </div>
            </div>

            {friends.length > 0 && (
              <div>
                <h2 className="font-semibold mb-2">Invite Friends</h2>
                <div className="space-y-2">
                  {friends.map((f) => (
                    <Card key={f.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: f.avatar_color }}>{f.avatar_emoji}</div>
                      <span className="flex-1 font-medium">{f.username}</span>
                      <Button size="sm" variant="secondary" onClick={() => doInvite(f.id)} disabled={busy}><UserPlus size={16} /></Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <Button variant="danger" fullWidth onClick={doLeave} disabled={busy}><LogOut size={18} className="inline mr-2" />Leave Party</Button>
          </>
        )}
      </div>
    </div>
  );
}
