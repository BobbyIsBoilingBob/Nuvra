import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { LeaderboardEntry } from '../types';

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, xp, level, avatar_emoji')
      .order('xp', { ascending: false })
      .limit(50);
    if (error) { setError(error.message); setEntries([]); }
    else setEntries((data ?? []).map((p: any) => ({
      id: p.id, username: p.username ?? 'Adventurer',
      xp: p.xp ?? 0, level: p.level ?? 1, avatar: p.avatar_emoji ?? undefined,
    })));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  return { entries, loading, error, reload: load };
}
