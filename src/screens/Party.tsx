import { useState, useCallback } from 'react';
import { Icon, GlassCard, Button, SectionTitle, Spinner } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { getLevelInfo } from '../data';

export function Party(): React.ReactElement {
  const { profile, selectedAdventure, setScreen } = useStore();
  const mp = useMultiplayer(profile.playerId, profile.username, profile.avatar.emoji, getLevelInfo(profile.xp).level);

  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreate = useCallback(async () => {
    if (!selectedAdventure) return;
    await mp.createParty(selectedAdventure.id, selectedAdventure.name);
  }, [selectedAdventure, mp]);

  const handleJoin = useCallback(async () => {
    if (joinCode.trim().length !== 6) return;
    await mp.joinParty(joinCode.trim());
  }, [joinCode, mp]);

  const handleCopyCode = useCallback(() => {
    if (!mp.party) return;
    navigator.clipboard?.writeText(mp.party.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [mp.party]);

  const handleStart = useCallback(async () => {
    await mp.startAdventure();
    setScreen('adventure-map');
  }, [mp, setScreen]);

  const handleLeave = useCallback(async () => {
    await mp.leaveParty();
    setScreen('adventure-detail');
  }, [mp, setScreen]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#a78bfa" />
      <div className="relative z-10">
        <TopBar showBack showCurrencies title="Adventure Party" />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-5">
          {!mp.party && (
            <>
              <GlassCard className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-plasma-400 to-nova-400 flex items-center justify-center">
                    <Icon name="Users" size={24} className="text-ink-950" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white">Walk Together</h2>
                    <p className="text-xs text-white/50">Create or join a party for a shared adventure</p>
                  </div>
                </div>

                {selectedAdventure ? (
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-white/5">
                    <span className="text-2xl">{selectedAdventure.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{selectedAdventure.name}</div>
                      <div className="text-xs text-white/40">{selectedAdventure.difficulty} · {selectedAdventure.distanceKm} km</div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-3 rounded-xl bg-white/5 text-center">
                    <p className="text-xs text-white/50">Select an adventure first</p>
                    <Button size="sm" variant="secondary" icon="Compass" onClick={() => setScreen('adventures')} className="mt-2">
                      Browse Adventures
                    </Button>
                  </div>
                )}

                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  icon="Plus"
                  onClick={handleCreate}
                  disabled={!selectedAdventure || mp.loading}
                >
                  Create Party
                </Button>
              </GlassCard>

              <GlassCard className="p-5">
                <SectionTitle icon="Key" accent="text-nova-300">Join with Code</SectionTitle>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                    placeholder="ENTER CODE"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-lg font-black tracking-widest placeholder:text-white/20 outline-none focus:border-nova-400/50"
                    aria-label="Party code"
                  />
                  <Button
                    variant="secondary"
                    icon="LogIn"
                    onClick={handleJoin}
                    disabled={joinCode.trim().length !== 6 || mp.loading}
                  >
                    Join
                  </Button>
                </div>
                {mp.error && (
                  <p className="text-xs text-rose-300 mt-2">{mp.error}</p>
                )}
              </GlassCard>
            </>
          )}

          {mp.party && (
            <>
              <GlassCard className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-black text-white">Party Lobby</h2>
                    <p className="text-xs text-white/50">{mp.party.adventureName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40">Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${mp.party.status === 'active' ? 'bg-nova-400/20 text-nova-300' : 'bg-gold-400/20 text-gold-300'}`}>
                      {mp.party.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className="flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">Party Code</div>
                    <div className="text-2xl font-black text-white tracking-widest">{mp.party.code}</div>
                  </div>
                  <Button size="sm" variant="ghost" icon={copied ? 'Check' : 'Copy'} onClick={handleCopyCode}>
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </GlassCard>

              <div>
                <SectionTitle icon="Users" accent="text-plasma-300">
                  Members ({mp.party.members.length})
                </SectionTitle>
                <div className="mt-2 flex flex-col gap-2">
                  {mp.party.members.map((m) => (
                    <GlassCard key={m.id} className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-plasma-400 to-nova-400 flex items-center justify-center text-lg flex-shrink-0">
                        {m.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-white truncate">{m.username}</span>
                          {m.isLeader && (
                            <span className="text-xs">👑</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/40">Lv {m.level}</span>
                          <span className={`text-xs ${m.status === 'connected' ? 'text-nova-300' : 'text-white/30'}`}>
                            {m.status === 'connected' ? 'Online' : 'Away'}
                          </span>
                        </div>
                      </div>
                      {m.progress > 0 && (
                        <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                          <span className="text-xs font-bold text-white">{Math.round(m.progress)}%</span>
                          <span className="text-[9px] text-white/40">{m.coinsCollected} coins</span>
                        </div>
                      )}
                    </GlassCard>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                {mp.party.leaderId === profile.playerId && mp.party.status === 'lobby' && (
                  <Button variant="primary" size="lg" fullWidth icon="Play" onClick={handleStart}>
                    Start Adventure Together
                  </Button>
                )}
                <Button variant="danger" size="lg" fullWidth icon="LogOut" onClick={handleLeave}>
                  Leave Party
                </Button>
              </div>
            </>
          )}

          {mp.loading && (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
