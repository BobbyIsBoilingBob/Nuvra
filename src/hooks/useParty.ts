import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

type Party = { id: string; name: string; leader_id: string; adventure_id: string | null; status: string };
type Member = { id: string; user_id: string; role: string; username: string; avatar_emoji: string; avatar_color: string };

export function useParty() {
  const [party, setParty] = useState<Party | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const me = user?.id ?? '';
    const { data: myMemberships } = await supabase.from('party_members').select('party_id').eq('user_id', me);
    const partyIds = (myMemberships as any[])?.map(m => m.party_id) ?? [];
    if (!partyIds.length) { setParty(null); setMembers([]); setLoading(false); return; }
    const { data: parties } = await supabase.from('parties').select('*').in('id', partyIds);
    const p = (parties as Party[])?.[0] ?? null;
    setParty(p);
    if (p) {
      const { data: mems } = await supabase.from('party_members').select('id, user_id, role').eq('party_id', p.id);
      const memRows = (mems as any[]) ?? [];
      const uids = memRows.map(m => m.user_id);
      const { data: profs } = await supabase.from('profiles').select('id, username, avatar_emoji, avatar_color').in('id', uids);
      const pmap = new Map((profs ?? []).map((x: any) => [x.id, x]));
      setMembers(memRows.map(m => ({ id: m.id, user_id: m.user_id, role: m.role, ...pmap.get(m.user_id) } as Member)));
    } else {
      setMembers([]);
    }
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (name: string, adventureId?: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    const { data, error } = await supabase.from('parties').insert({ name, adventure_id: adventureId ?? null, leader_id: user.id, status: 'active' }).select().single();
    if (error) throw error;
    const p = data as Party;
    const { error: e2 } = await supabase.from('party_members').insert({ party_id: p.id, user_id: user.id, role: 'leader' });
    if (e2) throw e2;
    await load();
    return p;
  }, [load]);

  const invite = useCallback(async (userId: string) => {
    if (!party) throw new Error('No party');
    const { error } = await supabase.from('party_members').insert({ party_id: party.id, user_id: userId, role: 'member' });
    if (error) throw error;
    await load();
  }, [party, load]);

  const leave = useCallback(async () => {
    if (!party) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('party_members').delete().eq('party_id', party.id).eq('user_id', user?.id ?? '');
    if (error) throw error;
    await load();
  }, [party, load]);

  return { party, members, loading, error, create, invite, leave, reload: load };
}
