import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Adventure } from '../types';

export interface CommunityPost {
  id: string;
  username: string;
  avatarColor: string | null;
  createdAt: string;
  adventure: Adventure | null;
  caption: string | null;
  likes: number;
  liked: boolean;
  comments: number;
}

type Row = { id: string; user_id: string; adventure_id: string | null; caption: string | null; likes: number; liked: boolean; created_at: string; username: string; avatar_color: string | null };

export function useCommunity() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('community_posts').select('*').order('created_at', { ascending: false }).limit(50);
    if (error) { setPosts([]); setError(null); setLoading(false); return; }
    const rows = (data as Row[]) ?? [];
    const advIds = rows.map((r) => r.adventure_id).filter(Boolean) as string[];
    let advMap = new Map<string, Adventure>();
    if (advIds.length) {
      const { data: advs } = await supabase.from('adventures').select('*').in('id', advIds);
      (advs as any[])?.forEach((a) => advMap.set(a.id, a as Adventure));
    }
    setPosts(rows.map((r) => ({ id: r.id, username: r.username ?? 'Adventurer', avatarColor: r.avatar_color, createdAt: r.created_at, adventure: r.adventure_id ? advMap.get(r.adventure_id) ?? null : null, caption: r.caption, likes: r.likes ?? 0, liked: !!r.liked, comments: 0 })));
    setError(null); setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const like = useCallback(async (id: string) => {
    setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p)));
    try { await supabase.rpc('toggle_like', { post_id: id }); } catch { /* ignore */ }
  }, []);

  return { posts, loading, error, like, refresh: load };
}
