export function vibrate(pattern: number | number[]): void {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

export type AppSettings = {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  voiceEnabled: boolean;
  mapStyle: 'standard' | 'satellite' | 'terrain';
  highContrast: boolean;
};

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  voiceEnabled: false,
  mapStyle: 'standard',
  highContrast: false,
};

export function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem('zeviqo-settings');
    if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch { /* ignore */ }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try { localStorage.setItem('zeviqo-settings', JSON.stringify(settings)); } catch { /* ignore */ }
}
