import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { UserSettings } from '../types';

const DEFAULT: UserSettings = {
  notifications: true, mapPreference: 'standard', privacy: 'friends',
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('settings').maybeSingle();
    const s = (data as any)?.settings;
    setSettings({ ...DEFAULT, ...(s ?? {}) });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = useCallback(async (patch: Partial<UserSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    const { data: p } = await supabase.from('profiles').select('id').maybeSingle();
    const { error } = await supabase.from('profiles').update({ settings: next }).eq('id', (p as any)?.id);
    if (error) throw error;
  }, [settings]);

  return { settings, loading, update, reload: load };
}
