import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

type Entry = { id: string; username: string; avatar_emoji: string; avatar_color: string; xp: number; level: number; distance_walked: number; completed_adventures: number };

export function useLeaderboard() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('id, username, avatar_emoji, avatar_color, xp, level, distance_walked, completed_adventures').order('xp', { ascending: false }).limit(50);
    if (error) { setError(error.message); setLoading(false); return; }
    setEntries((data as Entry[]) ?? []); setError(null); setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  return { entries, loading, error, reload: load };
}
