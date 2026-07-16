import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { LatLng } from '../lib/map-utils';

// ============================================================
// useMultiplayer — real-time party management via Supabase
// Creates/joins parties, syncs live positions, handles
// reconnects, tracks member progress.
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const partyIdRef = useRef<string | null>(null);
  const positionChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const memberChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const lastPositionUpdateRef = useRef<number>(0);

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

      // Add self as member
      await supabase.from('nuvra_party_members').insert({
        party_id: data.id,
        player_id: playerId,
        username,
        avatar,
        level,
        is_leader: true,
        status: 'connected',
      });

      partyIdRef.current = data.id;
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
        .eq('status', 'lobby')
        .maybeSingle();

      if (partyError) throw partyError;
      if (!partyData) {
        setError('Party not found or already started');
        return false;
      }

      // Check member count
      const { count } = await supabase
        .from('nuvra_party_members')
        .select('*', { count: 'exact', head: true })
        .eq('party_id', partyData.id)
        .neq('status', 'left');

      if (count != null && count >= partyData.max_players) {
        setError('Party is full');
        return false;
      }

      // Add self as member
      await supabase.from('nuvra_party_members').insert({
        party_id: partyData.id,
        player_id: playerId,
        username,
        avatar,
        level,
        is_leader: false,
        status: 'connected',
      });

      // Fetch all members
      const { data: members } = await supabase
        .from('nuvra_party_members')
        .select('*')
        .eq('party_id', partyData.id)
        .neq('status', 'left');

      partyIdRef.current = partyData.id;
      setParty({
        id: partyData.id,
        code: partyData.code,
        adventureId: partyData.adventure_id,
        adventureName: partyData.adventure_name,
        leaderId: partyData.leader_id,
        status: partyData.status,
        members: (members ?? []).map((m: Record<string, unknown>) => ({
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
          position: null,
          heading: 0,
          lastSeen: Date.now(),
        })),
      });

      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to join party');
      return false;
    } finally {
      setLoading(false);
    }
  }, [playerId, username, avatar, level]);

  // Leave the party
  const leaveParty = useCallback(async () => {
    if (!partyIdRef.current) return;
    try {
      await supabase
        .from('nuvra_party_members')
        .update({ status: 'left' })
        .eq('party_id', partyIdRef.current)
        .eq('player_id', playerId);

      // If leader, disband party
      if (party?.leaderId === playerId) {
        await supabase
          .from('nuvra_parties')
          .update({ status: 'disbanded' })
          .eq('id', partyIdRef.current);
      }

      // Clean up positions
      await supabase
        .from('nuvra_player_positions')
        .delete()
        .eq('party_id', partyIdRef.current)
        .eq('player_id', playerId);
    } catch {
      // Best-effort cleanup
    }
    partyIdRef.current = null;
    setParty(null);
  }, [playerId, party]);

  // Start the adventure
  const startAdventure = useCallback(async () => {
    if (!partyIdRef.current) return;
    try {
      await supabase
        .from('nuvra_parties')
        .update({ status: 'active' })
        .eq('id', partyIdRef.current);

      setParty((p) => p ? { ...p, status: 'active' } : null);
    } catch {
      // Best-effort
    }
  }, []);

  // Update own position
  const updatePosition = useCallback((pos: LatLng, heading: number, speed: number) => {
    if (!partyIdRef.current) return;
    const now = Date.now();
    // Throttle to 1 update per second
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

  // Subscribe to real-time updates
  useEffect(() => {
    if (!partyIdRef.current) return;
    const partyId = partyIdRef.current;

    // Subscribe to position changes
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

    // Subscribe to member changes
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

          if (existingIdx >= 0) {
            const members = [...p.members];
            members[existingIdx] = memberData;
            return { ...p, members };
          }
          return { ...p, members: [...p.members, memberData] };
        });
      })
      .subscribe();

    memberChannelRef.current = memberChannel;

    // Periodically fetch positions for members we haven't seen
    const posInterval = window.setInterval(async () => {
      const { data: positions } = await supabase
        .from('nuvra_player_positions')
        .select('*')
        .eq('party_id', partyId)
        .neq('player_id', playerId);

      if (positions && positions.length > 0) {
        setParty((p) => {
          if (!p) return p;
          return {
            ...p,
            members: p.members.map((m) => {
              const pos = positions.find((pp) => pp.player_id === m.id);
              if (!pos) return m;
              return {
                ...m,
                position: { lat: pos.lat, lng: pos.lng },
                heading: pos.heading,
                lastSeen: Date.now(),
              };
            }),
          };
        });
      }
    }, 3000);

    return () => {
      window.clearInterval(posInterval);
      posChannel.unsubscribe();
      memberChannel.unsubscribe();
    };
  }, [playerId]);

  return {
    party,
    loading,
    error,
    createParty,
    joinParty,
    leaveParty,
    startAdventure,
    updatePosition,
    updateProgress,
  };
}
