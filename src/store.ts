import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Screen, InventoryItem, HistoryEntry, Adventure, Profile } from './types';

const TOP_LEVEL: Screen[] = ['home', 'adventures', 'rewards', 'shop', 'profile'];

interface AppState {
  stack: Screen[];
  screen: Screen;
  navigate: (s: Screen) => void;
  goBack: () => boolean;
  resetTo: (s: Screen) => void;

  pendingScreen: Screen | null;
  setPendingScreen: (s: Screen | null) => void;
  navigateToAuth: (returnTo?: Screen) => void;
  returnAfterAuth: () => void;

  activeAdventureId: string | null;
  setActiveAdventure: (id: string | null) => void;

  customAdventures: Adventure[];
  setCustomAdventures: (a: Adventure[]) => void;
  addCustomAdventure: (adv: Adventure) => void;
  updateCustomAdventure: (adv: Adventure) => void;
  removeCustomAdventure: (id: string) => void;

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

  cachedProfile: Profile | null;
  setCachedProfile: (p: Profile | null) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      stack: ['home'],
      screen: 'home',
      navigate: (s) => set((state) => {
        if (TOP_LEVEL.includes(s)) return { screen: s, stack: [s] };
        if (state.stack[state.stack.length - 1] === s) return { screen: s };
        return { screen: s, stack: [...state.stack, s] };
      }),
      goBack: () => {
        const { stack } = get();
        if (stack.length <= 1) { set({ screen: 'home', stack: ['home'] }); return false; }
        const next = stack[stack.length - 2];
        set({ screen: next, stack: stack.slice(0, -1) });
        return true;
      },
      resetTo: (s) => set({ screen: s, stack: [s] }),

      pendingScreen: null,
      setPendingScreen: (s) => set({ pendingScreen: s }),
      navigateToAuth: (returnTo?: Screen) => set((state) => {
        const pending = returnTo ?? state.screen;
        if (state.stack[state.stack.length - 1] === 'auth') return { pendingScreen: pending };
        return { screen: 'auth', stack: [...state.stack, 'auth'], pendingScreen: pending };
      }),
      returnAfterAuth: () => {
        const { pendingScreen } = get();
        if (pendingScreen) {
          set({ screen: pendingScreen, stack: [pendingScreen], pendingScreen: null });
        } else {
          set({ screen: 'home', stack: ['home'], pendingScreen: null });
        }
      },

      activeAdventureId: null,
      setActiveAdventure: (id) => set({ activeAdventureId: id }),

      customAdventures: [],
      setCustomAdventures: (a) => set({ customAdventures: a }),
      addCustomAdventure: (adv) => set((s) => ({ customAdventures: [adv, ...s.customAdventures] })),
      updateCustomAdventure: (adv) => set((s) => ({ customAdventures: s.customAdventures.map((a) => a.id === adv.id ? adv : a) })),
      removeCustomAdventure: (id) => set((s) => ({ customAdventures: s.customAdventures.filter((a) => a.id !== id) })),

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
        if (existing) return { inventory: s.inventory.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i) };
        return { inventory: [...s.inventory, item] };
      }),

      history: [],
      addHistory: (entry) => set((s) => ({ history: [entry, ...s.history] })),

      claimedAdventureIds: [],
      markAdventureClaimed: (adventureId) => set((s) => ({
        claimedAdventureIds: s.claimedAdventureIds.includes(adventureId) ? s.claimedAdventureIds : [...s.claimedAdventureIds, adventureId],
      })),
      hasClaimedAdventure: (adventureId) => get().claimedAdventureIds.includes(adventureId),

      unlockedAchievements: [],
      unlockAchievement: (id) => set((s) => ({
        unlockedAchievements: s.unlockedAchievements.includes(id) ? s.unlockedAchievements : [...s.unlockedAchievements, id],
      })),

      dailyStreak: 0,
      setDailyStreak: (n) => set({ dailyStreak: n }),

      onboarded: false,
      setOnboarded: (v) => set({ onboarded: v }),

      cachedProfile: null,
      setCachedProfile: (p) => set({ cachedProfile: p }),
    }),
    {
      name: 'zeviqo-store',
      partialize: (state) => ({
        level: state.level, xp: state.xp, coins: state.coins,
        inventory: state.inventory, history: state.history,
        claimedAdventureIds: state.claimedAdventureIds,
        unlockedAchievements: state.unlockedAchievements,
        dailyStreak: state.dailyStreak, onboarded: state.onboarded,
        customAdventures: state.customAdventures,
        cachedProfile: state.cachedProfile,
      }),
    },
  ),
);
