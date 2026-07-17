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
  soundEnabled: true, hapticsEnabled: true, voiceEnabled: false, mapStyle: 'standard', highContrast: false,
};

export function loadSettings(): AppSettings {
  try { const s = localStorage.getItem('zeviqo-settings'); if (s) return { ...DEFAULT_SETTINGS, ...JSON.parse(s) }; } catch { /* */ }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try { localStorage.setItem('zeviqo-settings', JSON.stringify(settings)); } catch { /* */ }
}
