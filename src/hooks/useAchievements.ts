import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store';
import { ACHIEVEMENTS } from '../data/gameData';
import type { Achievement } from '../types';

type Row = { achievement_id: string; unlocked_at: string };

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const unlockedIds = useStore((s) => s.unlockedAchievements);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('user_achievements').select('achievement_id, unlocked_at');
    const unlockedMap = new Map<string, string>();
    if (!error && data) (data as Row[]).forEach((r) => unlockedMap.set(r.achievement_id, r.unlocked_at));
    const list: Achievement[] = ACHIEVEMENTS.map((a) => {
      const unlocked = unlockedMap.has(a.id) || unlockedIds.includes(a.id);
      return { ...a, unlocked, unlockedAt: unlockedMap.get(a.id) };
    });
    setAchievements(list); setError(error ? error.message : null); setLoading(false);
  }, [unlockedIds]);

  useEffect(() => { load(); }, [load]);

  return { achievements, loading, error, reload: load };
}
