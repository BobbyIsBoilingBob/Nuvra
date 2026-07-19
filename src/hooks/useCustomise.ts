import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { AVATAR_EMOJIS, AVATAR_COLORS } from '../data/gameData';

export function useCustomise() {
  const [emoji, setEmoji] = useState(AVATAR_EMOJIS[0]);
  const [color, setColor] = useState(AVATAR_COLORS[0]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('avatar_emoji, avatar_color').maybeSingle();
    const p = data as any;
    if (p) { setEmoji(p.avatar_emoji ?? AVATAR_EMOJIS[0]); setColor(p.avatar_color ?? AVATAR_COLORS[0]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (e: string, c: string) => {
    setEmoji(e); setColor(c);
    const { data: p } = await supabase.from('profiles').select('id').maybeSingle();
    const { error } = await supabase.from('profiles').update({ avatar_emoji: e, avatar_color: c }).eq('id', (p as any)?.id);
    if (error) throw error;
  }, []);

  return { emoji, color, loading, save, reload: load, emojis: AVATAR_EMOJIS, colors: AVATAR_COLORS };
}
