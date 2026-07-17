import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase, type PartyData, type PartyMember } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export function useParty() {
  const { user } = useAuth();
  const [party, setParty] = useState<PartyData | null>(null);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const loadParty = useCallback(async () => {
    if (!user) return;
    const { data: membership } = await supabase
      .from('party_members')
      .select('party_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (!membership) { setParty(null); setLoading(false); return; }

    const { data: partyRow } = await supabase
      .from('parties')
      .select('*')
      .eq('id', membership.party_id)
      .maybeSingle();
    if (!partyRow) { setParty(null); setLoading(false); return; }

    const { data: members } = await supabase
      .from('party_members')
      .select('id, party_id, user_id, role, joined_at, profile:profiles!user_id(*)')
      .eq('party_id', membership.party_id);
    const typedMembers = (members as unknown as PartyMember[]) ?? [];

    setParty({ ...(partyRow as PartyData), members: typedMembers });
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    loadParty();

    const channel = supabase
      .channel('party-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'party_members', filter: `user_id=eq.${user.id}` }, () => { if (mounted) loadParty(); })
      .subscribe();
    channelRef.current = channel;

    return () => { mounted = false; if (channelRef.current) supabase.removeChannel(channelRef.current); };
  }, [user, loadParty]);

  const createParty = useCallback(async (name: string): Promise<{ error: string | null; partyId: string | null }> => {
    if (!user) return { error: 'Not signed in.', partyId: null };
    const { data, error } = await supabase.from('parties').insert({ name, leader_id: user.id }).select().maybeSingle();
    if (error || !data) return { error: error?.message ?? 'Failed to create party.', partyId: null };
    const partyId = data.id;
    const { error: memberErr } = await supabase.from('party_members').insert({ party_id: partyId, user_id: user.id, role: 'leader' });
    if (memberErr) return { error: memberErr.message, partyId: null };
    await loadParty();
    return { error: null, partyId };
  }, [user, loadParty]);

  const joinParty = useCallback(async (partyId: string): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not signed in.' };
    const { error } = await supabase.from('party_members').insert({ party_id: partyId, user_id: user.id, role: 'member' });
    if (error) return { error: error.message };
    await loadParty();
    return { error: null };
  }, [user, loadParty]);

  const leaveParty = useCallback(async (): Promise<{ error: string | null }> => {
    if (!user || !party) return { error: 'Not in a party.' };
    await supabase.from('party_members').delete().eq('party_id', party.id).eq('user_id', user.id);
    if (party.leader_id === user.id) {
      const remaining = party.members.filter(m => m.user_id !== user.id);
      if (remaining.length === 0) {
        await supabase.from('parties').delete().eq('id', party.id);
      } else {
        await supabase.from('party_members').update({ role: 'leader' }).eq('id', remaining[0].id);
        await supabase.from('parties').update({ leader_id: remaining[0].user_id }).eq('id', party.id);
      }
    }
    setParty(null);
    return { error: null };
  }, [user, party]);

  return { party, loading, createParty, joinParty, leaveParty, loadParty };
}
