import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { DAILY_REWARDS } from '../data/gameData';

type Row = { user_id: string; last_claim_date: string | null; current_streak: number; total_claimed: number };

export function useDailyRewards() {
  const [streak, setStreak] = useState(0);
  const [lastClaim, setLastClaim] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('daily_rewards').select('*').maybeSingle();
    if (error) { setError(error.message); setLoading(false); return; }
    const r = data as Row | null;
    if (r) { setStreak(r.current_streak); setLastClaim(r.last_claim_date); }
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const today = new Date().toISOString().slice(0, 10);
  const canClaim = lastClaim !== today;

  const claim = useCallback(async () => {
    if (!canClaim) throw new Error('Already claimed today');
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newStreak = lastClaim === yesterday ? streak + 1 : 1;
    const reward = DAILY_REWARDS[(newStreak - 1) % DAILY_REWARDS.length];

    const { data: existing } = await supabase.from('daily_rewards').select('user_id, total_claimed').maybeSingle();
    if (existing) {
      const ex = existing as Row;
      const { error } = await supabase.from('daily_rewards').update({
        last_claim_date: today, current_streak: newStreak, total_claimed: (ex.total_claimed ?? 0) + 1, updated_at: new Date().toISOString(),
      }).eq('user_id', ex.user_id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('daily_rewards').insert({
        last_claim_date: today, current_streak: newStreak, total_claimed: 1,
      });
      if (error) throw error;
    }

    if (reward.reward.coins || reward.reward.xp) {
      const { data: p } = await supabase.from('profiles').select('id, coins, xp').maybeSingle();
      const prof = p as any;
      if (prof) {
        const patch: any = {};
        if (reward.reward.coins) patch.coins = (prof.coins ?? 0) + reward.reward.coins;
        if (reward.reward.xp) patch.xp = (prof.xp ?? 0) + (reward.reward.xp ?? 0);
        await supabase.from('profiles').update(patch).eq('id', prof.id);
      }
    }

    setStreak(newStreak);
    setLastClaim(today);
    return reward;
  }, [canClaim, lastClaim, streak, today]);

  return { streak, lastClaim, canClaim, loading, error, claim, reload: load };
}
