import { useState, useCallback } from 'react';
import { Icon, GlassCard, Button, SectionTitle, Spinner, EmptyState } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { useMultiplayer } from '../hooks/useMultiplayer';
import { useFriends } from '../hooks/useFriends';
import { getLevelInfo } from '../data';

export function Party(): React.ReactElement {
  const { profile, selectedAdventure, setScreen } = useStore();
  const level = getLevelInfo(profile.xp).level;
  const mp = useMultiplayer(profile.playerId, profile.username, profile.avatar.emoji, level);
  const friends = useFriends(profile.playerId);

  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showInviteSheet, setShowInviteSheet] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [confirmTransfer, setConfirmTransfer] = useState<string | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!selectedAdventure) return;
    const code = await mp.createParty(selectedAdventure.id, selectedAdventure.name);
    if (code) showToast('Party created!', 'success');
  }, [selectedAdventure, mp, showToast]);

  const handleJoin = useCallback(async () => {
    if (joinCode.trim().length !== 6) return;
    const success = await mp.joinParty(joinCode.trim());
    if (success) showToast('Joined party!', 'success');
  }, [joinCode, mp, showToast]);

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

  const handleInvite = useCallback(async (friendId: string) => {
    const result = await mp.invitePlayer(friendId);
    showToast(result.message, result.success ? 'success' : 'error');
  }, [mp, showToast]);

  const handleRemoveMember = useCallback(async (memberId: string) => {
    const result = await mp.removeMember(memberId);
    showToast(result.message, result.success ? 'success' : 'error');
    setConfirmRemove(null);
  }, [mp, showToast]);

  const handleTransferHost = useCallback(async (memberId: string) => {
    const result = await mp.transferHost(memberId);
    showToast(result.message, result.success ? 'success' : 'error');
    setConfirmTransfer(null);
  }, [mp, showToast]);

  const isLeader = mp.party?.leaderId === profile.playerId;

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#a78bfa" />
      <div className="relative z-10">
        <TopBar showBack showCurrencies title="Adventure Party" />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-5">
          {/* Toast */}
          {toast && (
            <div className={`glass-strong rounded-xl px-4 py-2.5 flex items-center gap-2 animate-[fade-in_0.2s_ease-out] ${
              toast.type === 'success' ? 'text-nova-300' : 'text-rose-300'
            }`}>
              <Icon name={toast.type === 'success' ? 'Check' : 'AlertCircle'} size={14} />
              <span className="text-xs font-semibold">{toast.message}</span>
            </div>
          )}

          {/* Incoming invites */}
          {mp.incomingInvites.length > 0 && (
            <div>
              <SectionTitle icon="Mail" accent="text-gold-300">Invitations</SectionTitle>
              <div className="mt-2 flex flex-col gap-2">
                {mp.incomingInvites.map((inv) => (
                  <GlassCard key={inv.id} className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-ember-400 flex items-center justify-center text-lg flex-shrink-0">
                      {inv.fromAvatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{inv.fromUsername}</div>
                      <div className="text-xs text-white/40 truncate">{inv.adventureName}</div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button size="sm" variant="primary" icon="Check" onClick={() => mp.acceptInvite(inv.id, inv.partyId)}>
                        Join
                      </Button>
                      <Button size="sm" variant="ghost" icon="X" onClick={() => mp.declineInvite(inv.id)}>
                        Decline
                      </Button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          )}

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
                <div className="flex items-center justify-between mb-2">
                  <SectionTitle icon="Users" accent="text-plasma-300">
                    Members ({mp.party.members.length})
                  </SectionTitle>
                  {isLeader && (
                    <Button size="sm" variant="secondary" icon="UserPlus" onClick={() => setShowInviteSheet(true)}>
                      Invite
                    </Button>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {mp.party.members.map((m) => (
                    <GlassCard key={m.id} className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-plasma-400 to-nova-400 flex items-center justify-center text-lg flex-shrink-0">
                        {m.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-white truncate">{m.username}</span>
                          {m.isLeader && <span className="text-xs">👑</span>}
                          {m.id === profile.playerId && (
                            <span className="text-[10px] text-nova-300 font-bold">You</span>
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
                      {isLeader && m.id !== profile.playerId && (
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => setConfirmTransfer(m.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-gold-300 transition-colors"
                            aria-label={`Transfer host to ${m.username}`}
                          >
                            <Icon name="Crown" size={14} />
                          </button>
                          <button
                            onClick={() => setConfirmRemove(m.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-rose-300 transition-colors"
                            aria-label={`Remove ${m.username}`}
                          >
                            <Icon name="UserMinus" size={14} />
                          </button>
                        </div>
                      )}
                    </GlassCard>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-2">
                {isLeader && mp.party.status === 'lobby' && (
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

      {/* Invite friends sheet */}
      {showInviteSheet && (
        <div className="fixed inset-0 z-[2000] flex items-end" onClick={() => setShowInviteSheet(false)}>
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md mx-auto glass-strong rounded-t-3xl p-5 pb-8 max-h-[70vh] overflow-y-auto animate-[slide-up_0.25s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-black text-white">Invite Friends</h3>
              <button onClick={() => setShowInviteSheet(false)} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/60">
                <Icon name="X" size={16} />
              </button>
            </div>
            {friends.friends.length === 0 ? (
              <EmptyState
                icon="Users"
                title="No friends to invite"
                desc="Add friends first, then invite them to your party."
                action={<Button size="sm" variant="secondary" icon="Search" onClick={() => { setShowInviteSheet(false); setScreen('friends'); }}>Find Friends</Button>}
              />
            ) : (
              <div className="flex flex-col gap-2">
                {friends.friends.map((f) => (
                  <div key={f.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-plasma-400 to-nova-400 flex items-center justify-center text-base flex-shrink-0">
                      {f.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{f.username}</div>
                      <div className="text-xs text-white/40">Level {f.level}</div>
                    </div>
                    <Button size="sm" variant="secondary" icon="Send" onClick={() => handleInvite(f.id)}>
                      Invite
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm remove member */}
      {confirmRemove && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center" onClick={() => setConfirmRemove(null)}>
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" />
          <div className="relative glass-strong rounded-2xl p-5 max-w-xs mx-4 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center mx-auto mb-3">
              <Icon name="UserMinus" size={24} className="text-rose-300" />
            </div>
            <h3 className="text-sm font-black text-white mb-1">Remove member?</h3>
            <p className="text-xs text-white/50 mb-4">They will be removed from the party immediately.</p>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" fullWidth onClick={() => setConfirmRemove(null)}>Cancel</Button>
              <Button size="sm" variant="danger" fullWidth icon="Check" onClick={() => handleRemoveMember(confirmRemove)}>Remove</Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm transfer host */}
      {confirmTransfer && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center" onClick={() => setConfirmTransfer(null)}>
          <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" />
          <div className="relative glass-strong rounded-2xl p-5 max-w-xs mx-4 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-gold-500/20 flex items-center justify-center mx-auto mb-3">
              <Icon name="Crown" size={24} className="text-gold-300" />
            </div>
            <h3 className="text-sm font-black text-white mb-1">Transfer host?</h3>
            <p className="text-xs text-white/50 mb-4">You will no longer be the party leader.</p>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" fullWidth onClick={() => setConfirmTransfer(null)}>Cancel</Button>
              <Button size="sm" variant="primary" fullWidth icon="Check" onClick={() => handleTransferHost(confirmTransfer)}>Transfer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
