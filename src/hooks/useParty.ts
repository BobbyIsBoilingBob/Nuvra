import { useEffect, useState, useCallback } from 'react';
import { supabase, type PartyData, type PartyMember } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export function useParty() {
  const { user } = useAuth();
  const [party, setParty] = useState<PartyData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadParty = useCallback(async () => {
    if (!user) return;
    const { data: memberRow } = await supabase.from('party_members').select('party_id').eq('user_id', user.id).maybeSingle();
    if (!memberRow) { setParty(null); return; }
    const { data: partyRow } = await supabase.from('parties').select('*').eq('id', memberRow.party_id).maybeSingle();
    if (!partyRow) { setParty(null); return; }
    const { data: members } = await supabase.from('party_members')
      .select('id, party_id, user_id, role, joined_at, profile:profiles(*)').eq('party_id', partyRow.id);
    setParty({ ...partyRow, members: (members as unknown as PartyMember[]) ?? [] } as PartyData);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    loadParty().finally(() => setLoading(false));
    const channel = supabase.channel('party-realtime');
    channel
      .on('postgres_changes', { event: '*', schema: 'public', table: 'party_members', filter: `user_id=eq.${user.id}` }, loadParty)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parties' }, loadParty)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, loadParty]);

  const createParty = useCallback(async (name: string, adventureId: string | null) => {
    if (!user) return { error: 'Not signed in' };
    const { data: partyRow, error } = await supabase.from('parties').insert({
      name, leader_id: user.id, adventure_id: adventureId, status: 'active',
    }).select().maybeSingle();
    if (error || !partyRow) return { error: error?.message ?? 'Failed to create party' };
    await supabase.from('party_members').insert({ party_id: partyRow.id, user_id: user.id, role: 'leader' });
    loadParty();
    return { error: null, partyId: partyRow.id };
  }, [user, loadParty]);

  const joinParty = useCallback(async (partyId: string) => {
    if (!user) return { error: 'Not signed in' };
    const { error } = await supabase.from('party_members').insert({ party_id: partyId, user_id: user.id, role: 'member' });
    if (error) return { error: error.message };
    loadParty();
    return { error: null };
  }, [user, loadParty]);

  const leaveParty = useCallback(async () => {
    if (!user || !party) return { error: 'No party' };
    await supabase.from('party_members').delete().eq('user_id', user.id).eq('party_id', party.id);
    if (party.leader_id === user.id) await supabase.from('parties').update({ status: 'disbanded' }).eq('id', party.id);
    setParty(null);
    return { error: null };
  }, [user, party]);

  return { party, loading, createParty, joinParty, leaveParty, reload: loadParty };
}
