import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { SeasonalProgress } from '../types';

type Row = {
  season_id: string; season_name: string;
  adventures_completed: number; distance_walked: number;
  target_adventures: number; target_distance: number;
  reward_claimed: boolean;
};

const SEASON_ID = 'summer-2026';

function toProgress(r: Row): SeasonalProgress {
  return {
    seasonId: r.season_id, seasonName: r.season_name,
    adventuresCompleted: r.adventures_completed, distanceWalked: r.distance_walked,
    targetAdventures: r.target_adventures, targetDistance: r.target_distance,
    rewardClaimed: r.reward_claimed,
  };
}

export function useSeasonal() {
  const [progress, setProgress] = useState<SeasonalProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('seasonal_progress').select('*').eq('season_id', SEASON_ID).maybeSingle();
    if (error) { setError(error.message); setLoading(false); return; }
    const r = data as Row | null;
    if (r) {
      setProgress(toProgress(r));
    } else {
      const { data: ins, error: ie } = await supabase.from('seasonal_progress').insert({ season_id: SEASON_ID }).select('*').maybeSingle();
      if (ie) { setError(ie.message); setLoading(false); return; }
      const ir = ins as Row | null;
      if (ir) setProgress(toProgress(ir));
    }
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const recordProgress = useCallback(async (distanceM: number) => {
    if (!progress) return;
    const next: SeasonalProgress = {
      ...progress,
      adventuresCompleted: progress.adventuresCompleted + 1,
      distanceWalked: progress.distanceWalked + distanceM,
    };
    setProgress(next);
    const { error } = await supabase.from('seasonal_progress').update({
      adventures_completed: next.adventuresCompleted,
      distance_walked: next.distanceWalked,
      updated_at: new Date().toISOString(),
    }).eq('season_id', SEASON_ID);
    if (error) throw error;
  }, [progress]);

  const claimReward = useCallback(async () => {
    if (!progress || progress.rewardClaimed) return;
    const { error } = await supabase.from('seasonal_progress').update({ reward_claimed: true }).eq('season_id', SEASON_ID);
    if (error) throw error;
    setProgress({ ...progress, rewardClaimed: true });
  }, [progress]);

  return { progress, loading, error, recordProgress, claimReward, reload: load };
}
