import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import type { PartyInfo } from '../types';

export function useParty() {
  const { user } = useAuth();
  const [party, setParty] = useState<PartyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data: memberRow, error: mErr } = await supabase
      .from('party_members')
      .select('party_id')
      .eq('user_id', user.id)
      .maybeSingle();
    if (mErr) { setError(mErr.message); setLoading(false); return; }
    if (!memberRow) { setParty(null); setLoading(false); return; }

    const { data: partyRow, error: pErr } = await supabase
      .from('parties')
      .select('id, name, leader_id, status')
      .eq('id', memberRow.party_id)
      .maybeSingle();
    if (pErr) { setError(pErr.message); setLoading(false); return; }
    if (!partyRow) { setParty(null); setLoading(false); return; }

    const { data: members } = await supabase
      .from('party_members')
      .select('user_id, role')
      .eq('party_id', partyRow.id);
    let memberProfiles: any[] = [];
    const memberUserIds = (members ?? []).map((m: any) => m.user_id).filter(Boolean);
    if (memberUserIds.length > 0) {
      const { data: pRes } = await supabase.from('profiles').select('id, username').in('id', memberUserIds);
      memberProfiles = pRes ?? [];
    }
    setParty({
      id: partyRow.id,
      name: partyRow.name,
      leaderId: partyRow.leader_id,
      status: partyRow.status,
      members: (members ?? []).map((m: any) => {
        const prof = memberProfiles.find((p: any) => p.id === m.user_id);
        return { userId: m.user_id, username: prof?.username ?? 'Unknown', role: m.role };
      }),
    });
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const createParty = useCallback(async (name: string, adventureId?: string): Promise<{ error: string | null; partyId?: string }> => {
    if (!user) return { error: 'Not signed in' };
    if (!name.trim()) return { error: 'Party name is required' };
    const { data: partyRow, error: pErr } = await supabase
      .from('parties')
      .insert({ name: name.trim(), leader_id: user.id, adventure_id: adventureId ?? null, status: 'active' })
      .select('id')
      .single();
    if (pErr) return { error: pErr.message };
    const { error: mErr } = await supabase
      .from('party_members')
      .insert({ party_id: partyRow.id, user_id: user.id, role: 'leader' });
    if (mErr) return { error: mErr.message };
    await load();
    return { error: null, partyId: partyRow.id };
  }, [user, load]);

  const inviteFriend = useCallback(async (friendId: string): Promise<{ error: string | null }> => {
    if (!user || !party) return { error: 'No active party' };
    const { error } = await supabase.from('party_members').insert({
      party_id: party.id, user_id: friendId, role: 'member',
    });
    if (error) return { error: error.message };
    await supabase.from('notifications').insert({
      user_id: friendId, type: 'party_invite', title: 'Party invite',
      message: `You've been invited to join "${party.name}".`, actor_id: user.id,
    });
    await load();
    return { error: null };
  }, [user, party, load]);

  const leaveParty = useCallback(async (): Promise<{ error: string | null }> => {
    if (!user || !party) return { error: 'No active party' };
    const { error } = await supabase.from('party_members')
      .delete()
      .eq('party_id', party.id)
      .eq('user_id', user.id);
    if (error) return { error: error.message };
    const { data: remaining } = await supabase.from('party_members')
      .select('user_id')
      .eq('party_id', party.id);
    if (!remaining || remaining.length === 0) {
      await supabase.from('parties').delete().eq('id', party.id);
    } else if (party.leaderId === user.id && remaining.length > 0) {
      const newLeaderId = remaining[0].user_id;
      await supabase.from('parties').update({ leader_id: newLeaderId }).eq('id', party.id);
      await supabase.from('party_members').update({ role: 'leader' }).eq('party_id', party.id).eq('user_id', newLeaderId);
    }
    await load();
    return { error: null };
  }, [user, party, load]);

  return { party, loading, error, load, createParty, inviteFriend, leaveParty };
}
