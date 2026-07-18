import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';
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
      .select('id, username, xp, level, avatar')
      .order('xp', { ascending: false })
      .limit(50);

    if (error) {
      setError(error.message);
      setEntries([]);
    } else if (data) {
      setEntries(data.map((p: any) => ({
        id: p.id,
        username: p.username ?? 'Adventurer',
        xp: p.xp ?? 0,
        level: p.level ?? 1,
        avatar: p.avatar ?? undefined,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { entries, loading, error, reload: load };
}
