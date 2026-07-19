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

  const recordAdventureCompletion = useCallback(async (_adventureId: string, distanceM: number) => {
    for (const c of CHALLENGES) {
      let delta = 0;
      if (c.type === 'adventure_count') delta = 1;
      else if (c.type === 'distance') delta = distanceM;
      if (delta === 0) continue;
      const cur = progress[c.id] ?? 0;
      const newProg = Math.min(cur + delta, c.target);
      const { error } = await supabase.from('challenges').upsert({
        challenge_id: c.id, progress: newProg,
        status: newProg >= c.target ? 'completed' : 'active',
        completed_at: newProg >= c.target ? new Date().toISOString() : null,
      }, { onConflict: 'challenge_id' });
      if (error) console.error('challenge upsert error', error.message);
    }
    await load();
  }, [progress, load]);

  return { challenges, loading, error, recordAdventureCompletion, reload: load };
}
