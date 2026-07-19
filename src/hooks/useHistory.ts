import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store';
import type { Adventure } from '../types';

export interface HistoryItem {
  id: string;
  adventure: Adventure | null;
  completedAt: string;
  xpEarned: number;
  coinsEarned: number;
}

type Row = { id: string; adventure_id: string; completed_at: string; xp_earned: number; coins_earned: number };

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const storeHistory = useStore((s) => s.history);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('adventure_history').select('*').order('completed_at', { ascending: false });
    if (error) {
      const local: HistoryItem[] = storeHistory.map((h) => ({ id: h.id, adventure: null, completedAt: h.completedAt, xpEarned: h.xp, coinsEarned: h.coins }));
      setHistory(local); setError(null); setLoading(false); return;
    }
    const rows = (data as Row[]) ?? [];
    const ids = rows.map((r) => r.adventure_id);
    let advMap = new Map<string, Adventure>();
    if (ids.length) {
      const { data: advs } = await supabase.from('adventures').select('*').in('id', ids);
      (advs as any[])?.forEach((a) => advMap.set(a.id, a as Adventure));
    }
    setHistory(rows.map((r) => ({ id: r.id, adventure: advMap.get(r.adventure_id) ?? null, completedAt: r.completed_at, xpEarned: r.xp_earned ?? 0, coinsEarned: r.coins_earned ?? 0 })));
    setError(null); setLoading(false);
  }, [storeHistory]);

  useEffect(() => { load(); }, [load]);

  return { history, loading, error, reload: load };
}
