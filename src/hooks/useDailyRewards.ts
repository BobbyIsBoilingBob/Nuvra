import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useStore } from '../store';

interface DailyRewardState {
  lastClaimDate: string | null;
  currentStreak: number;
  totalClaimed: number;
}

export function useDailyRewards() {
  const { user } = useAuth();
  const addCoins = useStore((s) => s.addCoins);
  const addXp = useStore((s) => s.addXp);
  const addItem = useStore((s) => s.addItem);
  const [state, setState] = useState<DailyRewardState>({ lastClaimDate: null, currentStreak: 0, totalClaimed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('daily_rewards')
      .select('last_claim_date, current_streak, total_claimed')
      .eq('user_id', user.id)
      .maybeSingle();
    if (error) { setError(error.message); setLoading(false); return; }
    if (data) {
      setState({
        lastClaimDate: data.last_claim_date,
        currentStreak: data.current_streak ?? 0,
        totalClaimed: data.total_claimed ?? 0,
      });
    } else {
      setState({ lastClaimDate: null, currentStreak: 0, totalClaimed: 0 });
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const canClaim = !state.lastClaimDate || state.lastClaimDate !== today;

  const claim = useCallback(async (reward: { coins?: number; xp?: number; item?: string }): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not signed in' };
    if (!canClaim) return { error: 'Already claimed today' };
    setClaiming(true);
    setError(null);

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newStreak = state.lastClaimDate === yesterday ? state.currentStreak + 1 : 1;

    const { error: upsertError } = await supabase
      .from('daily_rewards')
      .upsert({
        user_id: user.id,
        last_claim_date: today,
        current_streak: newStreak,
        total_claimed: state.totalClaimed + 1,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (upsertError) {
      setError(upsertError.message);
      setClaiming(false);
      return { error: upsertError.message };
    }

    if (reward.coins) addCoins(reward.coins);
    if (reward.xp) addXp(reward.xp);
    if (reward.item) addItem({ id: reward.item, name: reward.item, type: 'consumable', quantity: 1 });

    setState({ lastClaimDate: today, currentStreak: newStreak, totalClaimed: state.totalClaimed + 1 });
    setClaiming(false);
    return { error: null };
  }, [user, canClaim, state, today, addCoins, addXp, addItem]);

  return { ...state, loading, error, claiming, canClaim, claim, reload: load };
}
