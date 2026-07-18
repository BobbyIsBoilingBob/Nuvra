import { useState, useEffect, useCallback } from 'react';
import { supabase, type PartyData, type PartyMember } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export function useParty() {
  const { session } = useAuth(); const uid = session?.user?.id;
  const [party, setParty] = useState<PartyData | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!uid) return; const { data: memberData } = await supabase.from('party_members').select('party_id').eq('user_id', uid).limit(1);
    if (!memberData || memberData.length === 0) { setParty(null); setLoading(false); return; }
    const partyId = memberData[0].party_id; const { data: partyRow } = await supabase.from('parties').select('*').eq('id', partyId).single();
    const { data: members } = await supabase.from('party_members').select('*, profile:profiles(*)').eq('party_id', partyId);
    if (partyRow && members) setParty({ ...partyRow, members: (members as unknown as PartyMember[]) }); setLoading(false);
  }, [uid]);
  useEffect(() => { load(); }, [load]);
  const createParty = useCallback(async (name: string, _adventureId: string | null) => { if (!uid) return; const { data: partyRow } = await supabase.from('parties').insert({ name, leader_id: uid, status: 'active' }).select().single(); if (partyRow) { await supabase.from('party_members').insert({ party_id: partyRow.id, user_id: uid, role: 'leader' }); await load(); } }, [uid, load]);
  const leaveParty = useCallback(async () => { if (!uid || !party) return; await supabase.from('party_members').delete().eq('user_id', uid).eq('party_id', party.id); if (party.leader_id === uid) await supabase.from('parties').update({ status: 'disbanded' }).eq('id', party.id); setParty(null); }, [uid, party]);
  return { party, loading, createParty, leaveParty, refresh: load };
}
