import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppSettings = {
  vibration: boolean;
  sound: boolean;
  notifications: boolean;
  gpsTracking: boolean;
  reduceMotion: boolean;
};

type SettingsStore = {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
};

const defaultSettings: AppSettings = {
  vibration: true,
  sound: true,
  notifications: true,
  gpsTracking: true,
  reduceMotion: false
};

export const useSettings = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSetting: (key, value) =>
        set((state) => ({ settings: { ...state.settings, [key]: value } })),
      resetSettings: () => set({ settings: defaultSettings })
    }),
    { name: 'zeviqo-settings' }
  )
);

export function vibrate(pattern: number | number[]) {
  const { settings } = useSettings.getState();
  if (settings.vibration && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}
