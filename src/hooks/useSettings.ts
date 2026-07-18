import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import type { UserSettings } from '../types';

const DEFAULT_SETTINGS: UserSettings = {
  notifications: true,
  mapPreference: 'standard',
  privacy: 'public',
};

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', user.id)
      .maybeSingle();
    if (error) { setError(error.message); setLoading(false); return; }
    if (data?.settings && typeof data.settings === 'object') {
      const s = data.settings as Partial<UserSettings>;
      setSettings({
        notifications: s.notifications ?? true,
        mapPreference: s.mapPreference ?? 'standard',
        privacy: s.privacy ?? 'public',
      });
    } else {
      setSettings(DEFAULT_SETTINGS);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (newSettings: UserSettings): Promise<{ error: string | null }> => {
    if (!user) return { error: 'Not signed in' };
    setSaving(true);
    setError(null);
    const { error } = await supabase
      .from('profiles')
      .update({ settings: newSettings as any })
      .eq('id', user.id);
    setSaving(false);
    if (error) { setError(error.message); return { error: error.message }; }
    setSettings(newSettings);
    return { error: null };
  }, [user]);

  return { settings, loading, saving, error, save, reload: load };
}
