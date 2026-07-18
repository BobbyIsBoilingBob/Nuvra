import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

interface AvatarState {
  emoji: string;
  color: string;
}

export function useCustomise() {
  const { user, refreshProfile } = useAuth();
  const [avatar, setAvatar] = useState<AvatarState>({ emoji: '🧭', color: '#1c7af5' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('profiles')
      .select('avatar_emoji, avatar_color')
      .eq('id', user.id)
      .maybeSingle();
    if (error) { setError(error.message); setLoading(false); return; }
    setAvatar({
      emoji: data?.avatar_emoji ?? '🧭',
      color: data?.avatar_color ?? '#1c7af5',
    });
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (newAvatar: AvatarState): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not signed in' };
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_emoji: newAvatar.emoji, avatar_color: newAvatar.color })
      .eq('id', user.id);
    setSaving(false);
    if (error) { setError(error.message); return { error: error.message }; }
    setAvatar(newAvatar);
    await refreshProfile();
    return { error: null };
  }, [user, refreshProfile]);

  return { avatar, loading, saving, error, save, reload: load };
}
