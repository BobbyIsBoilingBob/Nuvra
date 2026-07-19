import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { CHALLENGES } from '../data/gameData';
import type { Challenge } from '../types';

type Row = { challenge_id: string; progress: number; status: string; completed_at: string | null };

export function useChallenges() {
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('challenges').select('*');
    if (error) { setError(error.message); setLoading(false); return; }
    const map: Record<string, number> = {};
    (data as Row[]).forEach(r => { map[r.challenge_id] = r.progress; });
    setProgress(map);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const challenges: Challenge[] = CHALLENGES.map(c => ({
    ...c, progress: progress[c.id] ?? 0,
    status: (progress[c.id] ?? 0) >= c.target ? 'completed' : 'active',
  }));

  const recordAdventureCompletion = useCallback(async (adventureId: string, distanceM: number) => {
    const updates: { id: string; delta: number }[] = [];
    CHALLENGES.forEach(c => {
      if (c.type === 'adventure_count') updates.push({ id: c.id, delta: 1 });
      if (c.type === 'distance') updates.push({ id: c.id, delta: distanceM });
    });
    for (const u of updates) {
      const cur = progress[u.id] ?? 0;
      const newProg = Math.min(cur + u.delta, CHALLENGES.find(c => c.id === u.id)?.target ?? newProg_safe(u.id, cur + u.delta));
      const { error } = await supabase.from('challenges').upsert({
        challenge_id: u.id, progress: newProg, status: newProg >= (CHALLENGES.find(c => c.id === u.id)?.target ?? 0) ? 'completed' : 'active',
        completed_at: newProg >= (CHALLENGES.find(c => c.id === u.id)?.target ?? 0) ? new Date().toISOString() : null,
      }, { onConflict: 'challenge_id' });
      if (error) console.error('challenge upsert error', error.message);
    }
    await load();
  }, [progress, load]);

  return { challenges, loading, error, recordAdventureCompletion, reload: load };
}

function newProg_safe(_id: string, v: number): number { return v; }
