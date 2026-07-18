import { useState, useEffect, useCallback } from 'react';

export type AppSettings = {
  sound: boolean;
  voiceGuidance: boolean;
  haptics: boolean;
  notifications: boolean;
  arMode: boolean;
  metricUnits: boolean;
};

const DEFAULTS: AppSettings = {
  sound: true,
  voiceGuidance: false,
  haptics: true,
  notifications: true,
  arMode: false,
  metricUnits: true,
};

const KEY = 'zeviqo-settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(settings));
  }, [settings]);

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  return { settings, update };
}
