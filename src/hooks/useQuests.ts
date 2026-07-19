import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store';

export interface QuestEntry {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  expiresAt: string | null;
  rewardCoins: number;
  rewardXp: number;
  rewardItem: string | null;
}

type Row = { id: string; title: string; description: string | null; completed: boolean; expires_at: string | null; reward_coins: number; reward_xp: number; reward_item: string | null };

function fromRow(r: Row): QuestEntry {
  return { id: r.id, title: r.title, description: r.description ?? '', completed: !!r.completed, expiresAt: r.expires_at, rewardCoins: r.reward_coins ?? 50, rewardXp: r.reward_xp ?? 100, rewardItem: r.reward_item };
}

export function useQuests() {
  const [quests, setQuests] = useState<QuestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const addXp = useStore((s) => s.addXp);
  const addCoins = useStore((s) => s.addCoins);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('quests').select('*').order('created_at', { ascending: false });
    if (error) { setError(error.message); setQuests([]); setLoading(false); return; }
    setQuests((data as Row[]).map(fromRow)); setError(null); setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const completeQuest = useCallback(async (id: string) => {
    const { error } = await supabase.from('quests').update({ completed: true }).eq('id', id);
    if (error) throw error;
    const q = quests.find((x) => x.id === id);
    if (q) { addXp(q.rewardXp); addCoins(q.rewardCoins); }
    setQuests((qs) => qs.map((q) => (q.id === id ? { ...q, completed: true } : q)));
  }, [quests, addXp, addCoins]);

  return { quests, loading, error, refresh: load, completeQuest };
}
