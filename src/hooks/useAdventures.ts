import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Adventure } from '../types';

type DbRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  difficulty: string;
  distance_km: number;
  duration_min: number;
  start_lat: number | null;
  start_lng: number | null;
  image_url: string | null;
  tags: string[] | null;
  waypoints: any;
  reward_xp: number;
  reward_coins: number;
  reward_item: string | null;
  ai_generated: boolean;
  created_at: string;
  completed_at: string | null;
};

function fromDb(r: DbRow): Adventure {
  return {
    id: r.id,
    title: r.title,
    description: r.description ?? '',
    difficulty: (r.difficulty as Adventure['difficulty']) ?? 'easy',
    durationMin: r.duration_min,
    distanceKm: r.distance_km,
    startLat: r.start_lat ?? 0,
    startLng: r.start_lng ?? 0,
    imageUrl: r.image_url ?? '',
    tags: r.tags ?? [],
    quests: Array.isArray(r.waypoints) ? r.waypoints : [],
    rewards: { xp: r.reward_xp, coins: r.reward_coins, items: r.reward_item ? [r.reward_item] : [] },
    creator: r.ai_generated ? 'Zeviqo AI' : undefined,
    aiGenerated: r.ai_generated,
  };
}

export function useAdventures() {
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('adventures').select('*').order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setAdventures((data as DbRow[]).map(fromDb));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (a: Adventure) => {
    const { data, error } = await supabase.from('adventures').insert({
      title: a.title,
      description: a.description,
      difficulty: a.difficulty,
      distance_km: a.distanceKm,
      duration_min: a.durationMin,
      start_lat: a.startLat,
      start_lng: a.startLng,
      image_url: a.imageUrl,
      tags: a.tags,
      waypoints: a.quests,
      reward_xp: a.rewards.xp,
      reward_coins: a.rewards.coins,
      reward_item: a.rewards.items?.[0] ?? null,
      ai_generated: !!a.aiGenerated,
    }).select().single();
    if (error) throw error;
    await load();
    return data;
  }, [load]);

  const remove = useCallback(async (id: string) => {
    const { error } = await supabase.from('adventures').delete().eq('id', id);
    if (error) throw error;
    await load();
  }, [load]);

  return { adventures, loading, error, reload: load, save, remove };
}
