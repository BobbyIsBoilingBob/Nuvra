import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { LatLng } from '../lib/map-utils';

// ============================================================
// useMultiplayer — real-time party management via Supabase
// Create/join parties, invite friends, sync live positions,
// remove members, transfer host, auto-reconnect.
// ============================================================

export interface PartyMember {
  id: string;
  username: string;
  avatar: string;
  level: number;
  isLeader: boolean;
  status: string;
  progress: number;
  coinsCollected: number;
  treasuresCollected: number;
  challengesCompleted: number;
  position: LatLng | null;
  heading: number;
  lastSeen: number;
}

export interface PartyInvite {
  id: string;
  partyId: string;
  partyCode: string;
  adventureName: string;
  fromId: string;
  fromUsername: string;
  fromAvatar: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
}

export interface Party {
  id: string;
  code: string;
  adventureId: string;
  adventureName: string;
  leaderId: string;
  status: string;
  members: PartyMember[];
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function useMultiplayer(playerId: string, username: string, avatar: string, level: number) {
  const [party, setParty] = useState<Party | null>(null);
  const [incomingInvites, setIncomingInvites] = useState<PartyInvite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const partyIdRef = useRef<string | null>(null);
  const positionChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const memberChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const inviteChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastPositionUpdateRef = useRef<number>(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLeaderRef = useRef<boolean>(false);

  // Fetch full party data from DB
  const fetchParty = useCallback(async (pid: string): Promise<Party | null> => {
    try {
      const { data: partyData, error: pErr } = await supabase
        .from('nuvra_parties')
        .select('*')
        .eq('id', pid)
        .maybeSingle();
      if (pErr || !partyData) return null;

      const { data: members } = await supabase
        .from('nuvra_party_members')
        .select('*')
        .eq('party_id', pid)
        .neq('status', 'left');

      const { data: positions } = await supabase
        .from('nuvra_player_positions')
        .select('*')
        .eq('party_id', pid);

      const posMap = new Map((positions ?? []).map((p: Record<string, unknown>) => [p.player_id as string, p]));

      return {
        id: partyData.id,
        code: partyData.code,
        adventureId: partyData.adventure_id,
        adventureName: partyData.adventure_name,
        leaderId: partyData.leader_id,
        status: partyData.status,
        members: (members ?? []).map((m: Record<string, unknown>) => {
          const pos = posMap.get(m.player_id as string) as Record<string, unknown> | undefined;
          return {
            id: m.player_id as string,
            username: m.username as string,
            avatar: m.avatar as string,
            level: m.level as number,
            isLeader: m.is_leader as boolean,
            status: m.status as string,
            progress: m.progress as number,
            coinsCollected: m.coins_collected as number,
            treasuresCollected: m.treasures_collected as number,
            challengesCompleted: m.challenges_completed as number,
            position: pos ? { lat: pos.lat as number, lng: pos.lng as number } : null,
            heading: (pos?.heading as number) ?? 0,
            lastSeen: Date.now(),
          };
        }),
      };
    } catch {
      return null;
    }
  }, []);

  // Create a party
  const createParty = useCallback(async (adventureId: string, adventureName: string): Promise<string | null> => {
    setLoading(true);
    setError(null);
    try {
      const code = generateCode();
      const { data, error: insertError } = await supabase
        .from('nuvra_parties')
        .insert({
          adventure_id: adventureId,
          adventure_name: adventureName,
          leader_id: playerId,
          code,
          status: 'lobby',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await supabase.from('nuvra_party_members').insert({
        party_id: data.id,
        player_id: playerId,
        username,
        avatar,
        level,
        is_leader: true,
        status: 'connected',
      });

      // Set online status
      await supabase.from('nuvra_player_status').upsert({
        player_id: playerId,
        status: 'online',
      }, { onConflict: 'player_id' });

      partyIdRef.current = data.id;
      isLeaderRef.current = true;
      setParty({
        id: data.id,
        code,
        adventureId,
        adventureName,
        leaderId: playerId,
        status: 'lobby',
        members: [{
          id: playerId,
          username,
          avatar,
          level,
          isLeader: true,
          status: 'connected',
          progress: 0,
          coinsCollected: 0,
          treasuresCollected: 0,
          challengesCompleted: 0,
          position: null,
          heading: 0,
          lastSeen: Date.now(),
        }],
      });

      return code;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create party');
      return null;
    } finally {
      setLoading(false);
    }
  }, [playerId, username, avatar, level]);

  // Join a party by code
  const joinParty = useCallback(async (code: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { data: partyData, error: partyError } = await supabase
        .from('nuvra_parties')
        .select('*')
        .eq('code', code.toUpperCase())
        .in('status', ['lobby', 'active'])
        .maybeSingle();

      if (partyError) throw partyError;
      if (!partyData) {
        setError('Party not found or already disbanded');
        return false;
      }

      const { count } = await supabase
        .from('nuvra_party_members')
        .select('*', { count: 'exact', head: true })
        .eq('party_id', partyData.id)
        .neq('status', 'left');

      if (count != null && count >= partyData.max_players) {
        setError('Party is full');
        return false;
      }

      // Check if already a member
      const { data: existing } = await supabase
        .from('nuvra_party_members')
        .select('id')
        .eq('party_id', partyData.id)
        .eq('player_id', playerId)
        .neq('status', 'left')
        .maybeSingle();

      if (existing) {
        // Re-join existing membership
        await supabase
          .from('nuvra_party_members')
          .update({ status: 'connected' })
          .eq('party_id', partyData.id)
          .eq('player_id', playerId);
      } else {
        await supabase.from('nuvra_party_members').insert({
          party_id: partyData.id,
          player_id: playerId,
          username,
          avatar,
          level,
          is_leader: false,
          status: 'connected',
        });
      }

      partyIdRef.current = partyData.id;
      isLeaderRef.current = partyData.leader_id === playerId;

      const fullParty = await fetchParty(partyData.id);
      if (fullParty) setParty(fullParty);

      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to join party');
      return false;
    } finally {
      setLoading(false);
    }
  }, [playerId, username, avatar, level, fetchParty]);

  // Leave the party
  const leaveParty = useCallback(async () => {
    if (!partyIdRef.current) return;
    const pid = partyIdRef.current;
    try {
      await supabase
        .from('nuvra_party_members')
        .update({ status: 'left' })
        .eq('party_id', pid)
        .eq('player_id', playerId);

      await supabase
        .from('nuvra_player_positions')
        .delete()
        .eq('party_id', pid)
        .eq('player_id', playerId);

      // If leader, promote the next connected member or disband
      if (isLeaderRef.current) {
        const { data: remaining } = await supabase
          .from('nuvra_party_members')
          .select('player_id')
          .eq('party_id', pid)
          .eq('status', 'connected')
          .neq('player_id', playerId)
          .limit(1);

        if (remaining && remaining.length > 0) {
          // Transfer leadership to the next member
          await supabase
            .from('nuvra_party_members')
            .update({ is_leader: true })
            .eq('party_id', pid)
            .eq('player_id', remaining[0].player_id);
          await supabase
            .from('nuvra_parties')
            .update({ leader_id: remaining[0].player_id })
            .eq('id', pid);
        } else {
          await supabase
            .from('nuvra_parties')
            .update({ status: 'disbanded' })
            .eq('id', pid);
        }
      }

      // Set status to offline
      await supabase.from('nuvra_player_status').upsert({
        player_id: playerId,
        status: 'offline',
      }, { onConflict: 'player_id' });
    } catch {
      // Best-effort cleanup
    }
    partyIdRef.current = null;
    isLeaderRef.current = false;
    setParty(null);
  }, [playerId]);

  // Invite a friend to the party
  const invitePlayer = useCallback(async (toPlayerId: string): Promise<{ success: boolean; message: string }> => {
    if (!partyIdRef.current) {
      return { success: false, message: 'You are not in a party.' };
    }
    if (toPlayerId === playerId) {
      return { success: false, message: "You can't invite yourself." };
    }

    try {
      const { error: err } = await supabase
        .from('nuvra_party_invites')
        .insert({
          party_id: partyIdRef.current,
          from_player_id: playerId,
          to_player_id: toPlayerId,
          status: 'pending',
        });

      if (err) {
        if (err.code === '23505') {
          return { success: false, message: 'You have already invited this player.' };
        }
        throw err;
      }

      // Notify the recipient
      await supabase.from('nuvra_notifications').insert({
        player_id: toPlayerId,
        type: 'party_invite',
        title: 'Party invitation',
        message: `invited you to join: ${party?.adventureName ?? 'an adventure'}`,
        from_player_id: playerId,
        metadata: { party_id: partyIdRef.current, party_code: party?.code },
      });

      return { success: true, message: 'Invitation sent!' };
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : 'Failed to send invitation' };
    }
  }, [playerId, party]);

  // Accept a party invite
  const acceptInvite = useCallback(async (inviteId: string, partyId: string): Promise<boolean> => {
    try {
      await supabase
        .from('nuvra_party_invites')
        .update({ status: 'accepted' })
        .eq('id', inviteId);

      setIncomingInvites((prev) => prev.filter((i) => i.id !== inviteId));

      // Join the party
      const { data: partyData } = await supabase
        .from('nuvra_parties')
        .select('code')
        .eq('id', partyId)
        .maybeSingle();

      if (partyData) {
        return await joinParty(partyData.code);
      }
      return false;
    } catch {
      return false;
    }
  }, [joinParty]);

  // Decline a party invite
  const declineInvite = useCallback(async (inviteId: string): Promise<void> => {
    try {
      await supabase
        .from('nuvra_party_invites')
        .update({ status: 'declined' })
        .eq('id', inviteId);
      setIncomingInvites((prev) => prev.filter((i) => i.id !== inviteId));
    } catch {
      // Best-effort
    }
  }, []);

  // Remove a party member (leader only)
  const removeMember = useCallback(async (memberId: string): Promise<{ success: boolean; message: string }> => {
    if (!partyIdRef.current || !isLeaderRef.current) {
      return { success: false, message: 'Only the party leader can remove members.' };
    }
    if (memberId === playerId) {
      return { success: false, message: 'Use "Leave Party" to remove yourself.' };
    }
    try {
      await supabase
        .from('nuvra_party_members')
        .update({ status: 'left' })
        .eq('party_id', partyIdRef.current)
        .eq('player_id', memberId);

      await supabase
        .from('nuvra_player_positions')
        .delete()
        .eq('party_id', partyIdRef.current)
        .eq('player_id', memberId);

      // Notify the removed member
      await supabase.from('nuvra_notifications').insert({
        player_id: memberId,
        type: 'party_leave',
        title: 'Removed from party',
        message: 'You were removed from the party',
        from_player_id: playerId,
      });

      setParty((p) => p ? { ...p, members: p.members.filter((m) => m.id !== memberId) } : null);
      return { success: true, message: 'Member removed' };
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : 'Failed to remove member' };
    }
  }, [playerId]);

  // Transfer host to another member
  const transferHost = useCallback(async (newLeaderId: string): Promise<{ success: boolean; message: string }> => {
    if (!partyIdRef.current || !isLeaderRef.current) {
      return { success: false, message: 'Only the party leader can transfer host.' };
    }
    if (newLeaderId === playerId) {
      return { success: false, message: 'You are already the host.' };
    }
    try {
      await supabase
        .from('nuvra_party_members')
        .update({ is_leader: false })
        .eq('party_id', partyIdRef.current)
        .eq('player_id', playerId);
      await supabase
        .from('nuvra_party_members')
        .update({ is_leader: true })
        .eq('party_id', partyIdRef.current)
        .eq('player_id', newLeaderId);
      await supabase
        .from('nuvra_parties')
        .update({ leader_id: newLeaderId })
        .eq('id', partyIdRef.current);

      isLeaderRef.current = false;
      setParty((p) => p ? {
        ...p,
        leaderId: newLeaderId,
        members: p.members.map((m) => ({ ...m, isLeader: m.id === newLeaderId })),
      } : null);

      return { success: true, message: 'Host transferred!' };
    } catch (e) {
      return { success: false, message: e instanceof Error ? e.message : 'Failed to transfer host' };
    }
  }, [playerId]);

  // Start the adventure
  const startAdventure = useCallback(async () => {
    if (!partyIdRef.current) return;
    try {
      await supabase
        .from('nuvra_parties')
        .update({ status: 'active' })
        .eq('id', partyIdRef.current);

      // Update all members' status
      await supabase
        .from('nuvra_player_status')
        .upsert({
          player_id: playerId,
          status: 'in_adventure',
        }, { onConflict: 'player_id' });

      setParty((p) => p ? { ...p, status: 'active' } : null);
    } catch {
      // Best-effort
    }
  }, [playerId]);

  // Update own position (throttled to 1/sec)
  const updatePosition = useCallback((pos: LatLng, heading: number, speed: number) => {
    if (!partyIdRef.current) return;
    const now = Date.now();
    if (now - lastPositionUpdateRef.current < 1000) return;
    lastPositionUpdateRef.current = now;

    supabase
      .from('nuvra_player_positions')
      .upsert({
        party_id: partyIdRef.current,
        player_id: playerId,
        lat: pos.lat,
        lng: pos.lng,
        heading,
        speed,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'party_id,player_id' })
      .then(() => {});
  }, [playerId]);

  // Update own progress
  const updateProgress = useCallback((progress: number, coins: number, treasures: number, challenges: number) => {
    if (!partyIdRef.current) return;
    supabase
      .from('nuvra_party_members')
      .update({
        progress,
        coins_collected: coins,
        treasures_collected: treasures,
        challenges_completed: challenges,
      })
      .eq('party_id', partyIdRef.current)
      .eq('player_id', playerId)
      .then(() => {});
  }, [playerId]);

  // Subscribe to real-time updates — keyed on partyId state, not ref
  useEffect(() => {
    if (!partyIdRef.current) return;
    const partyId = partyIdRef.current;

    const posChannel = supabase
      .channel(`positions:${partyId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'nuvra_player_positions',
        filter: `party_id=eq.${partyId}`,
      }, (payload) => {
        const data = payload.new as Record<string, unknown>;
        if (!data || data.player_id === playerId) return;

        setParty((p) => {
          if (!p) return p;
          return {
            ...p,
            members: p.members.map((m) =>
              m.id === data.player_id
                ? {
                    ...m,
                    position: { lat: data.lat as number, lng: data.lng as number },
                    heading: data.heading as number,
                    lastSeen: Date.now(),
                  }
                : m,
            ),
          };
        });
      })
      .subscribe();

    positionChannelRef.current = posChannel;

    const memberChannel = supabase
      .channel(`members:${partyId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'nuvra_party_members',
        filter: `party_id=eq.${partyId}`,
      }, (payload) => {
        const data = payload.new as Record<string, unknown>;
        if (!data) return;

        setParty((p) => {
          if (!p) return p;
          if (payload.eventType === 'DELETE') return p;

          const existingIdx = p.members.findIndex((m) => m.id === data.player_id);
          const memberData: PartyMember = {
            id: data.player_id as string,
            username: data.username as string,
            avatar: data.avatar as string,
            level: data.level as number,
            isLeader: data.is_leader as boolean,
            status: data.status as string,
            progress: data.progress as number,
            coinsCollected: data.coins_collected as number,
            treasuresCollected: data.treasures_collected as number,
            challengesCompleted: data.challenges_completed as number,
            position: existingIdx >= 0 ? p.members[existingIdx].position : null,
            heading: existingIdx >= 0 ? p.members[existingIdx].heading : 0,
            lastSeen: Date.now(),
          };

          // If member left, remove them
          if (data.status === 'left') {
            return { ...p, members: p.members.filter((m) => m.id !== data.player_id) };
          }

          if (existingIdx >= 0) {
            const members = [...p.members];
            members[existingIdx] = memberData;
            // Update leader if changed
            return {
              ...p,
              members,
              leaderId: data.is_leader ? data.player_id as string : p.leaderId,
            };
          }
          return { ...p, members: [...p.members, memberData] };
        });
      })
      .subscribe();

    memberChannelRef.current = memberChannel;

    // Periodically fetch positions as a fallback for real-time gaps
    const posInterval = window.setInterval(async () => {
      if (!partyIdRef.current) return;
      const { data: positions } = await supabase
        .from('nuvra_player_positions')
        .select('*')
        .eq('party_id', partyIdRef.current)
        .neq('player_id', playerId);

      if (positions && positions.length > 0) {
        setParty((p) => {
          if (!p) return p;
          return {
            ...p,
            members: p.members.map((m) => {
              const pos = positions.find((pp: Record<string, unknown>) => pp.player_id === m.id);
              if (!pos) return m;
              return {
                ...m,
                position: { lat: pos.lat as number, lng: pos.lng as number },
                heading: pos.heading as number,
                lastSeen: Date.now(),
              };
            }),
          };
        });
      }
    }, 3000);

    // Reconnect check — verify party still exists
    const reconnectInterval = window.setInterval(async () => {
      if (!partyIdRef.current) return;
      const { data: p } = await supabase
        .from('nuvra_parties')
        .select('status')
        .eq('id', partyIdRef.current)
        .maybeSingle();

      if (!p || p.status === 'disbanded') {
        // Party was disbanded — clean up
        partyIdRef.current = null;
        isLeaderRef.current = false;
        setParty(null);
      }
    }, 10000);

    return () => {
      window.clearInterval(posInterval);
      window.clearInterval(reconnectInterval);
      posChannel.unsubscribe();
      memberChannel.unsubscribe();
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, [playerId, party?.id]);

  // Subscribe to incoming party invites
  useEffect(() => {
    const inviteChannel = supabase
      .channel(`invites:${playerId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'nuvra_party_invites',
        filter: `to_player_id=eq.${playerId}`,
      }, async (payload) => {
        const data = payload.new as Record<string, unknown>;
        if (!data) return;

        // Fetch party and sender info
        const [partyRes, senderRes] = await Promise.all([
          supabase.from('nuvra_parties').select('code, adventure_name').eq('id', data.party_id as string).maybeSingle(),
          supabase.from('nuvra_players').select('username, avatar').eq('id', data.from_player_id as string).maybeSingle(),
        ]);

        setIncomingInvites((prev) => [
          ...prev,
          {
            id: data.id as string,
            partyId: data.party_id as string,
            partyCode: partyRes.data?.code ?? '',
            adventureName: partyRes.data?.adventure_name ?? '',
            fromId: data.from_player_id as string,
            fromUsername: senderRes.data?.username ?? 'Unknown',
            fromAvatar: senderRes.data?.avatar ?? '🧭',
            status: 'pending',
            createdAt: Date.now(),
          },
        ]);
      })
      .subscribe();

    inviteChannelRef.current = inviteChannel;

    // Load existing pending invites on mount
    (async () => {
      const { data: invites } = await supabase
        .from('nuvra_party_invites')
        .select('*')
        .eq('to_player_id', playerId)
        .eq('status', 'pending');

      if (!invites || invites.length === 0) return;

      const partyIds = [...new Set(invites.map((i: Record<string, unknown>) => i.party_id as string))];
      const senderIds = [...new Set(invites.map((i: Record<string, unknown>) => i.from_player_id as string))];

      const [partiesRes, sendersRes] = await Promise.all([
        supabase.from('nuvra_parties').select('id, code, adventure_name').in('id', partyIds),
        supabase.from('nuvra_players').select('id, username, avatar').in('id', senderIds),
      ]);

      const partyMap = new Map((partiesRes.data ?? []).map((p: Record<string, unknown>) => [p.id as string, p]));
      const senderMap = new Map((sendersRes.data ?? []).map((s: Record<string, unknown>) => [s.id as string, s]));

      setIncomingInvites(
        invites.map((inv: Record<string, unknown>) => {
          const p = partyMap.get(inv.party_id as string) as Record<string, unknown> | undefined;
          const s = senderMap.get(inv.from_player_id as string) as Record<string, unknown> | undefined;
          return {
            id: inv.id as string,
            partyId: inv.party_id as string,
            partyCode: (p?.code as string) ?? '',
            adventureName: (p?.adventure_name as string) ?? '',
            fromId: inv.from_player_id as string,
            fromUsername: (s?.username as string) ?? 'Unknown',
            fromAvatar: (s?.avatar as string) ?? '🧭',
            status: 'pending',
            createdAt: new Date(inv.created_at as string).getTime(),
          };
        }),
      );
    })();

    return () => {
      inviteChannel.unsubscribe();
    };
  }, [playerId]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      positionChannelRef.current?.unsubscribe();
      memberChannelRef.current?.unsubscribe();
      inviteChannelRef.current?.unsubscribe();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, []);

  return {
    party,
    incomingInvites,
    loading,
    error,
    createParty,
    joinParty,
    leaveParty,
    startAdventure,
    updatePosition,
    updateProgress,
    invitePlayer,
    acceptInvite,
    declineInvite,
    removeMember,
    transferHost,
  };
}
