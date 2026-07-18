import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Screen, InventoryItem, HistoryEntry } from './types';

interface AppState {
  screen: Screen;
  setScreen: (s: Screen) => void;

  activeAdventureId: string | null;
  setActiveAdventure: (id: string | null) => void;

  level: number;
  xp: number;
  coins: number;
  addXp: (n: number) => void;
  addCoins: (n: number) => void;
  spendCoins: (n: number) => boolean;

  inventory: InventoryItem[];
  addItem: (item: InventoryItem) => void;

  history: HistoryEntry[];
  addHistory: (entry: HistoryEntry) => void;

  claimedAdventureIds: string[];
  markAdventureClaimed: (adventureId: string) => void;
  hasClaimedAdventure: (adventureId: string) => boolean;

  unlockedAchievements: string[];
  unlockAchievement: (id: string) => void;

  dailyStreak: number;
  setDailyStreak: (n: number) => void;

  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      screen: 'home',
      setScreen: (s) => set({ screen: s }),

      activeAdventureId: null,
      setActiveAdventure: (id) => set({ activeAdventureId: id }),

      level: 1,
      xp: 0,
      coins: 0,
      addXp: (n) => set((s) => {
        const newXp = s.xp + n;
        const newLevel = Math.floor(newXp / 500) + 1;
        return { xp: newXp, level: Math.max(s.level, newLevel) };
      }),
      addCoins: (n) => set((s) => ({ coins: s.coins + n })),
      spendCoins: (n) => {
        const c = get().coins;
        if (c < n) return false;
        set({ coins: c - n });
        return true;
      },

      inventory: [],
      addItem: (item) => set((s) => {
        const existing = s.inventory.find((i) => i.id === item.id);
        if (existing) {
          return { inventory: s.inventory.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i) };
        }
        return { inventory: [...s.inventory, item] };
      }),

      history: [],
      addHistory: (entry) => set((s) => ({ history: [entry, ...s.history] })),

      claimedAdventureIds: [],
      markAdventureClaimed: (adventureId) => set((s) => ({
        claimedAdventureIds: s.claimedAdventureIds.includes(adventureId)
          ? s.claimedAdventureIds
          : [...s.claimedAdventureIds, adventureId],
      })),
      hasClaimedAdventure: (adventureId) => get().claimedAdventureIds.includes(adventureId),

      unlockedAchievements: [],
      unlockAchievement: (id) => set((s) => ({
        unlockedAchievements: s.unlockedAchievements.includes(id)
          ? s.unlockedAchievements
          : [...s.unlockedAchievements, id],
      })),

      dailyStreak: 0,
      setDailyStreak: (n) => set({ dailyStreak: n }),

      onboarded: false,
      setOnboarded: (v) => set({ onboarded: v }),
    }),
    { name: 'zeviqo-store' },
  ),
);
