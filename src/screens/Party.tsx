import { useState } from 'react';
import { useStore } from '../store';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, AvatarDisplay, Pill, Button, LoadingScreen } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { useParty } from '../hooks/useParty';

export function Party() {
  const { goBack } = useStore();
  const { party, loading, createParty, leaveParty } = useParty();
  const [partyName, setPartyName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (loading) return <LoadingScreen />;

  async function handleCreate() {
    if (partyName.trim().length < 2) { setError('Party name must be at least 2 characters.'); return; }
    setError(null);
    const { error: err } = await createParty(partyName.trim());
    if (err) setError(err);
    else setPartyName('');
  }

  async function handleLeave() {
    await leaveParty();
  }

  return (
    <div className="relative min-h-screen pb-8">
      <AdventureBg accent="#8b5cf6" />
      <TopBar title="Party" showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-3 space-y-4">
        {error && (
          <GlassCard className="p-3 flex items-center gap-2 border-rose-500/20">
            <Icon name="AlertCircle" size={14} className="text-rose-400" />
            <p className="text-xs text-rose-300">{error}</p>
          </GlassCard>
        )}

        {!party ? (
          <GlassCard className="p-5 space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2">🗺️</div>
              <h2 className="text-lg font-display font-bold text-white">Create a Party</h2>
              <p className="text-xs text-white/40 mt-1">Walk together with friends in real-time</p>
            </div>
            <div>
              <label className="text-xs text-white/50 font-semibold mb-1 block">Party Name</label>
              <input
                value={partyName}
                onChange={e => setPartyName(e.target.value)}
                placeholder="Adventure Squad"
                className="w-full glass rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:ring-2 focus:ring-zeviqo-400/40"
              />
            </div>
            <Button fullWidth size="lg" icon="Users" onClick={handleCreate}>Create Party</Button>
          </GlassCard>
        ) : (
          <>
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-display font-bold text-white">{party.name}</h2>
                  <p className="text-[10px] text-white/40">{party.members.length} member{party.members.length !== 1 ? 's' : ''}</p>
                </div>
                <Pill icon="Users" accent="text-zeviqo-300 border-zeviqo-500/30">{party.status}</Pill>
              </div>
              <div className="space-y-2">
                {party.members.map(m => (
                  <div key={m.id} className="flex items-center gap-3 glass rounded-xl p-3">
                    <AvatarDisplay emoji={m.profile?.avatar_emoji ?? '🧭'} color={m.profile?.avatar_color ?? '#00c4ff'} size={36} />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white">{m.profile?.username ?? 'Unknown'}</p>
                      <p className="text-[10px] text-white/40">{m.role === 'leader' ? '👑 Leader' : 'Member'}</p>
                    </div>
                    {m.profile?.is_online && <div className="w-2 h-2 rounded-full bg-green-400" />}
                  </div>
                ))}
              </div>
            </GlassCard>
            <Button variant="danger" fullWidth icon="LogOut" onClick={handleLeave}>Leave Party</Button>
          </>
        )}
      </div>
    </div>
  );
}
