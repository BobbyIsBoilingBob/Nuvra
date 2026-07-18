import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useStore } from '../store';
import type { SeasonalProgress } from '../types';

const CURRENT_SEASON_ID = 'summer-2026';
const CURRENT_SEASON_NAME = 'Summer Walking Festival';

export function useSeasonal() {
  const { user } = useAuth();
  const addXp = useStore((s) => s.addXp);
  const addCoins = useStore((s) => s.addCoins);
  const [progress, setProgress] = useState<SeasonalProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('seasonal_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('season_id', CURRENT_SEASON_ID)
      .maybeSingle();
    if (error) { setError(error.message); setLoading(false); return; }
    if (data) {
      setProgress({
        seasonId: data.season_id,
        seasonName: data.season_name,
        adventuresCompleted: data.adventures_completed ?? 0,
        distanceWalked: data.distance_walked ?? 0,
        targetAdventures: data.target_adventures ?? 5,
        targetDistance: data.target_distance ?? 50000,
        rewardClaimed: data.reward_claimed ?? false,
      });
    } else {
      const { data: newRow, error: insErr } = await supabase
        .from('seasonal_progress')
        .insert({
          user_id: user.id,
          season_id: CURRENT_SEASON_ID,
          season_name: CURRENT_SEASON_NAME,
        })
        .select('*')
        .maybeSingle();
      if (insErr) { setError(insErr.message); setLoading(false); return; }
      if (newRow) {
        setProgress({
          seasonId: newRow.season_id,
          seasonName: newRow.season_name,
          adventuresCompleted: newRow.adventures_completed,
          distanceWalked: newRow.distance_walked,
          targetAdventures: newRow.target_adventures,
          targetDistance: newRow.target_distance,
          rewardClaimed: newRow.reward_claimed,
        });
      }
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const recordAdventure = useCallback(async (distanceMeters: number) => {
    if (!user) return;
    const current = progress ?? {
      seasonId: CURRENT_SEASON_ID, seasonName: CURRENT_SEASON_NAME,
      adventuresCompleted: 0, distanceWalked: 0,
      targetAdventures: 5, targetDistance: 50000, rewardClaimed: false,
    };
    const newAdv = current.adventuresCompleted + 1;
    const newDist = current.distanceWalked + distanceMeters;
    const { error } = await supabase
      .from('seasonal_progress')
      .upsert({
        user_id: user.id,
        season_id: CURRENT_SEASON_ID,
        season_name: CURRENT_SEASON_NAME,
        adventures_completed: newAdv,
        distance_walked: newDist,
        target_adventures: current.targetAdventures,
        target_distance: current.targetDistance,
        reward_claimed: current.rewardClaimed,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,season_id' });
    if (error) { setError(error.message); return; }
    setProgress({ ...current, adventuresCompleted: newAdv, distanceWalked: newDist });
  }, [user, progress]);

  const claimReward = useCallback(async (): Promise<{ error: string | null }> => {
    if (!user || !progress) return { error: 'Not signed in' };
    if (progress.rewardClaimed) return { error: 'Reward already claimed' };
    if (progress.adventuresCompleted < progress.targetAdventures) return { error: 'Complete all adventures first' };
    setClaiming(true);
    const { error } = await supabase
      .from('seasonal_progress')
      .update({ reward_claimed: true, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('season_id', CURRENT_SEASON_ID);
    if (error) { setClaiming(false); return { error: error.message }; }
    addXp(500);
    addCoins(1000);
    setProgress({ ...progress, rewardClaimed: true });
    setClaiming(false);
    return { error: null };
  }, [user, progress, addXp, addCoins]);

  return { progress, loading, error, claiming, load, recordAdventure, claimReward };
}
