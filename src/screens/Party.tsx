import { useState } from 'react';
import { useParty } from '../hooks/useParty';
import { useAuth } from '../lib/auth';
import { Card, Screen, Button, EmptyState, Badge } from '../components/ui';
import { PartyPopper, Plus, LogOut, Crown, LogIn } from 'lucide-react';

export default function Party() {
  const { isGuest, exitGuest } = useAuth();
  const { party, loading, createParty, leaveParty } = useParty();
  const [name, setName] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  if (isGuest) {
    return (
      <Screen>
        <h1 className="font-display text-2xl font-bold text-white mb-4">Party</h1>
        <Card className="p-6 text-center">
          <PartyPopper size={32} color="#fbbf24" className="mx-auto mb-3" />
          <h2 className="font-display text-lg font-bold text-white mb-2">Sign in to create parties</h2>
          <p className="text-ink-400 text-sm mb-4">Adventure with friends in real-time.</p>
          <Button className="w-full flex items-center justify-center gap-2" onClick={() => exitGuest()}><LogIn size={18} /> Sign In or Create Account</Button>
        </Card>
      </Screen>
    );
  }

  if (loading) return <Screen><div className="text-ink-400">Loading...</div></Screen>;
  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4">Party</h1>
      {!party ? (
        <div>
          <EmptyState icon={PartyPopper} title="No active party" subtitle="Create a party to adventure with friends" />
          {showCreate ? (
            <Card className="p-4 mt-4">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Party name" className="w-full bg-ink-700/50 border border-ink-600/30 rounded-xl px-4 py-2.5 text-white placeholder-ink-500 focus:outline-none focus:border-zeviqo-500/50 mb-3" />
              <div className="flex gap-2">
                <Button onClick={async () => { await createParty(name || 'My Party', null); setShowCreate(false); setName(''); }}>Create</Button>
                <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </Card>
          ) : (
            <Button onClick={() => setShowCreate(true)} className="w-full mt-4 flex items-center justify-center gap-2"><Plus size={18} /> Create Party</Button>
          )}
        </div>
      ) : (
        <div>
          <Card className="p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <PartyPopper size={24} color="#fbbf24" />
              <div className="flex-1">
                <h3 className="font-semibold text-white">{party.name}</h3>
                <Badge color={party.status === 'active' ? '#22c55e' : '#94a3b8'}>{party.status}</Badge>
              </div>
            </div>
          </Card>
          <h3 className="text-ink-400 text-sm font-semibold uppercase mb-3">Members ({party.members.length})</h3>
          <div className="space-y-2">
            {party.members.map((m) => (
              <Card key={m.id} className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-ink-700/50 flex items-center justify-center text-xl">{m.profile.avatar_emoji}</div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm flex items-center gap-2">{m.profile.username}{m.role === 'leader' && <Crown size={14} color="#fbbf24" />}</p>
                  <p className="text-ink-400 text-xs">Level {m.profile.level}</p>
                </div>
              </Card>
            ))}
          </div>
          <Button variant="danger" onClick={leaveParty} className="w-full mt-4 flex items-center justify-center gap-2"><LogOut size={18} /> {party.leader_id === party.members[0]?.user_id ? 'Disband Party' : 'Leave Party'}</Button>
        </div>
      )}
    </Screen>
  );
}
