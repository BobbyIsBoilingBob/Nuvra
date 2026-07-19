import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface RewardEntry {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  earnedAt: string | null;
}

type Row = { id: string; title: string; description: string | null; icon: string | null; earned_at: string | null };

export function useRewards() {
  const [rewards, setRewards] = useState<RewardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('rewards').select('*').order('earned_at', { ascending: false });
    if (error) { setRewards([]); setError(null); setLoading(false); return; }
    setRewards((data as Row[]).map((r) => ({ id: r.id, title: r.title, description: r.description ?? '', icon: r.icon, earnedAt: r.earned_at })));
    setError(null); setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { rewards, loading, error, reload: load };
}
