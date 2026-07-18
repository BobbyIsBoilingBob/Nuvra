import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import type { Adventure } from '../types';

function dbRowToAdventure(r: any): Adventure {
  const waypoints: any[] = Array.isArray(r.waypoints) ? r.waypoints : [];
  const quests = waypoints.map((w: any, i: number) => ({
    id: `q-${i}`,
    type: (w.type === 'distance' ? 'distance' : w.type === 'challenge' ? 'challenge' : 'checkpoint') as 'distance' | 'checkpoint' | 'challenge',
    title: w.title ?? `Checkpoint ${i + 1}`,
    description: w.description ?? '',
    target: w.target,
    lat: w.lat,
    lng: w.lng,
    adventureId: r.id,
    adventureTitle: r.title,
  }));
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? '',
    difficulty: (r.difficulty === 'hard' ? 'hard' : r.difficulty === 'medium' ? 'medium' : 'easy') as 'easy' | 'medium' | 'hard',
    durationMin: r.duration_min ?? 30,
    distanceKm: r.distance_km ?? 0,
    startLat: r.start_lat ?? 51.5074,
    startLng: r.start_lng ?? -0.1278,
    quests,
    rewards: { xp: r.reward_xp ?? 0, coins: r.reward_coins ?? 0, items: r.reward_item ? [r.reward_item] : [] },
    imageUrl: r.image_url ?? undefined,
    tags: Array.isArray(r.tags) ? r.tags : [],
    creator: r.ai_generated ? 'Zeviqo AI' : undefined,
    aiGenerated: !!r.ai_generated,
  };
}

export function useAdventures() {
  const { user } = useAuth();
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('adventures')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) { setError(error.message); setAdventures([]); }
    else setAdventures((data ?? []).map(dbRowToAdventure));
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const createAdventure = useCallback(async (adv: Adventure): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not signed in' };
    const waypoints = adv.quests.map((q) => ({
      type: q.type, title: q.title, description: q.description,
      target: q.target, lat: q.lat, lng: q.lng,
    }));
    const { error } = await supabase.from('adventures').insert({
      user_id: user.id,
      title: adv.title,
      description: adv.description,
      difficulty: adv.difficulty,
      distance_km: adv.distanceKm,
      duration_min: adv.durationMin,
      start_lat: adv.startLat,
      start_lng: adv.startLng,
      waypoints,
      reward_xp: adv.rewards.xp,
      reward_coins: adv.rewards.coins,
      reward_item: adv.rewards.items?.[0] ?? null,
      tags: adv.tags,
      image_url: adv.imageUrl,
      ai_generated: adv.aiGenerated ?? false,
      type: 'exploration',
      status: 'active',
    });
    if (error) return { error: error.message };
    await load();
    return { error: null };
  }, [user, load]);

  const updateAdventure = useCallback(async (adv: Adventure): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not signed in' };
    const waypoints = adv.quests.map((q) => ({
      type: q.type, title: q.title, description: q.description,
      target: q.target, lat: q.lat, lng: q.lng,
    }));
    const { error } = await supabase.from('adventures').update({
      title: adv.title,
      description: adv.description,
      difficulty: adv.difficulty,
      distance_km: adv.distanceKm,
      duration_min: adv.durationMin,
      start_lat: adv.startLat,
      start_lng: adv.startLng,
      waypoints,
      reward_xp: adv.rewards.xp,
      reward_coins: adv.rewards.coins,
      reward_item: adv.rewards.items?.[0] ?? null,
      tags: adv.tags,
      image_url: adv.imageUrl,
    }).eq('id', adv.id).eq('user_id', user.id);
    if (error) return { error: error.message };
    await load();
    return { error: null };
  }, [user, load]);

  const deleteAdventure = useCallback(async (id: string): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not signed in' };
    const { error } = await supabase.from('adventures').delete().eq('id', id).eq('user_id', user.id);
    if (error) return { error: error.message };
    await load();
    return { error: null };
  }, [user, load]);

  return { adventures, loading, error, load, createAdventure, updateAdventure, deleteAdventure };
}
