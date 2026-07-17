import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Adventure } from './data';

export type Screen =
  | 'home' | 'adventures' | 'adventure-detail' | 'adventure-map'
  | 'quests' | 'achievements' | 'daily-rewards' | 'profile'
  | 'challenges' | 'community' | 'friends' | 'party' | 'shop' | 'settings' | 'history'
  | 'ai-generator' | 'adventure-preview' | 'creator' | 'customise' | 'inventory' | 'rewards' | 'seasonal' | 'onboarding';

export type HistoryEntry = {
  id: string;
  adventureId: string;
  adventureName: string;
  emoji: string;
  type: string;
  difficulty: string;
  distance: number;
  time: number;
  xpEarned: number;
  coinsEarned: number;
  gemsEarned: number;
  treasuresFound: number;
  maxCombo: number;
  completedAt: string;
  isFavorite: boolean;
};

type StoreState = {
  currentScreen: Screen;
  previousScreen: Screen | null;
  selectedAdventureId: string | null;
  selectedAdventureObj: Adventure | null;
  history: HistoryEntry[];
  favoriteAdventures: string[];
  completedChallenges: string[];
  completedQuests: string[];
  lastDailyRewardDay: number | null;
  lastDailyRewardDate: string | null;
  dailyRewardStreak: number;
  ownedItems: string[];
  questProgress: Record<string, number>;

  setScreen: (s: Screen) => void;
  goBack: () => void;
  setSelectedAdventure: (id: string) => void;
  setSelectedAdventureObj: (a: Adventure) => void;
  recordAdventureComplete: (entry: Omit<HistoryEntry, 'id' | 'completedAt' | 'isFavorite'>) => void;
  toggleHistoryFavorite: (id: string) => void;
  toggleFavoriteAdventure: (adventureId: string) => void;
  recordChallengeComplete: (challengeId: string) => void;
  claimQuest: (questId: string) => void;
  claimDailyReward: (day: number) => void;
  buyItem: (itemId: string) => boolean;
  updateQuestProgress: (metric: string, amount: number) => void;
  resetLocalState: () => void;
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentScreen: 'home',
      previousScreen: null,
      selectedAdventureId: null,
      selectedAdventureObj: null,
      history: [],
      favoriteAdventures: [],
      completedChallenges: [],
      completedQuests: [],
      lastDailyRewardDay: null,
      lastDailyRewardDate: null,
      dailyRewardStreak: 0,
      ownedItems: [],
      questProgress: {},

      setScreen: (s) => set((state) => ({ previousScreen: state.currentScreen, currentScreen: s })),
      goBack: () => set((state) => ({ currentScreen: state.previousScreen ?? 'home', previousScreen: null })),
      setSelectedAdventure: (id) => set({ selectedAdventureId: id }),
      setSelectedAdventureObj: (a) => set({ selectedAdventureObj: a }),
      recordAdventureComplete: (entry) => set((state) => ({
        history: [{
          ...entry,
          id: `h-${Date.now()}`,
          completedAt: new Date().toISOString(),
          isFavorite: false,
        }, ...state.history].slice(0, 100),
      })),
      toggleHistoryFavorite: (id) => set((state) => ({
        history: state.history.map(h => h.id === id ? { ...h, isFavorite: !h.isFavorite } : h),
      })),
      toggleFavoriteAdventure: (adventureId) => set((state) => {
        const has = state.favoriteAdventures.includes(adventureId);
        return { favoriteAdventures: has ? state.favoriteAdventures.filter(a => a !== adventureId) : [...state.favoriteAdventures, adventureId] };
      }),
      recordChallengeComplete: (challengeId) => set((state) => ({
        completedChallenges: state.completedChallenges.includes(challengeId) ? state.completedChallenges : [...state.completedChallenges, challengeId],
      })),
      claimQuest: (questId) => set((state) => ({
        completedQuests: state.completedQuests.includes(questId) ? state.completedQuests : [...state.completedQuests, questId],
      })),
      claimDailyReward: (day) => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const lastDate = state.lastDailyRewardDate;
        const newStreak = lastDate === today ? state.dailyRewardStreak : lastDate === yesterday ? state.dailyRewardStreak + 1 : 1;
        return { lastDailyRewardDay: day, lastDailyRewardDate: today, dailyRewardStreak: newStreak };
      }),
      buyItem: (itemId) => {
        const state = get();
        if (state.ownedItems.includes(itemId)) return false;
        set({ ownedItems: [...state.ownedItems, itemId] });
        return true;
      },
      updateQuestProgress: (metric, amount) => set((state) => ({
        questProgress: { ...state.questProgress, [metric]: (state.questProgress[metric] ?? 0) + amount },
      })),
      resetLocalState: () => set({
        history: [], favoriteAdventures: [], completedChallenges: [], completedQuests: [],
        lastDailyRewardDay: null, lastDailyRewardDate: null, dailyRewardStreak: 0,
        ownedItems: [], questProgress: {}, currentScreen: 'home',
      }),
    }),
    { name: 'zeviqo-store' },
  ),
);
