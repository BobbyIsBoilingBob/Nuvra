import { useStore } from '../store';
import { useParty } from '../hooks/useParty';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { UserPlus, Users } from 'lucide-react';
import { useState } from 'react';

export default function Party() {
  const goBack = useStore((s) => s.goBack);
  const { party, members, loading, error, create, leave, reload } = useParty();
  const [busy, setBusy] = useState(false);
  if (loading) return (<div><Header title="Party" onBack={goBack} /><div className="flex justify-center py-12"><Spinner /></div></div>);
  const partyInfo = party ? { id: party.id, name: party.name, members: members.map((m) => ({ id: m.id, name: m.username, isLeader: m.role === 'leader' })) } : null;
  async function handleCreate() { setBusy(true); try { await create('Walking Party'); } catch { /* ignore */ } finally { setBusy(false); } }
  async function handleLeave() { setBusy(true); try { await leave(); } catch { /* ignore */ } finally { setBusy(false); } }
  return (
    <div>
      <Header title="Party" onBack={goBack} subtitle="Walk together" />
      <div className="px-4 py-4 space-y-4">
        {error && <p className="text-sm text-error-600">{error}</p>}
        {partyInfo ? (
          <Card><div className="flex items-center gap-3 mb-3"><Users size={24} className="text-brand-600" /><h2 className="text-lg font-bold">{partyInfo.name}</h2></div><div className="space-y-2">{partyInfo.members.map((m) => (<div key={m.id} className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">{m.name[0]}</div><span className="flex-1">{m.name}</span>{m.isLeader && <span className="text-xs px-2 py-0.5 rounded-full bg-accent-100 text-accent-700">Leader</span>}</div>))}</div><Button variant="danger" className="mt-3" onClick={handleLeave} disabled={busy}>Leave Party</Button></Card>
        ) : (
          <Card className="text-center py-8"><Users size={40} className="mx-auto text-ink-300 mb-3" /><h2 className="text-lg font-bold">No Active Party</h2><p className="text-ink-500 mt-1">Create a party to walk with friends.</p><Button className="mt-4" onClick={handleCreate} disabled={busy}><UserPlus size={18} className="inline mr-2" />Create Party</Button></Card>
        )}
      </div>
    </div>
  );
}
