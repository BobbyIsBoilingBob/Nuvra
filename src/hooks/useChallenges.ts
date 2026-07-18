import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useStore } from '../store';
import type { Challenge } from '../types';

export function useChallenges() {
  const { user } = useAuth();
  const addXp = useStore((s) => s.addXp);
  const addCoins = useStore((s) => s.addCoins);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) { setError(error.message); setChallenges([]); }
    else setChallenges((data ?? []).map((r: any) => ({
      id: r.id, title: r.title, description: r.description ?? '',
      progress: r.progress ?? 0, target: r.target ?? 0,
      reward: { xp: r.reward_xp ?? 0, coins: r.reward_coins ?? 0 },
      type: r.type, status: r.status,
    })));
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const recordAdventureCompletion = useCallback(async (distanceMeters: number) => {
    if (!user) return;
    const active = challenges.filter((c) => c.status === 'active');
    for (const c of active) {
      let newProgress = c.progress;
      if (c.type === 'adventure_count') newProgress = c.progress + 1;
      else if (c.type === 'distance') newProgress = c.progress + distanceMeters;
      else continue;

      const completed = newProgress >= c.target;
      const { error } = await supabase
        .from('challenges')
        .update({ progress: newProgress, status: completed ? 'completed' : 'active', completed_at: completed ? new Date().toISOString() : null })
        .eq('id', c.id).eq('user_id', user.id);

      if (!error && completed) {
        addXp(c.reward.xp);
        addCoins(c.reward.coins);
      }
    }
    await load();
  }, [user, challenges, addXp, addCoins, load]);

  return { challenges, loading, error, load, recordAdventureCompletion };
}
