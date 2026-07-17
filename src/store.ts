import { create } from 'zustand';
import { generateAdventure, type Adventure, type Difficulty, type AdventureType } from './data';

export type AdventureHistoryEntry = {
  id: string;
  adventureId: string;
  adventureName: string;
  type: AdventureType;
  emoji: string;
  difficulty: Difficulty;
  distance: number;
  time: number;
  xpEarned: number;
  coinsEarned: number;
  gemsEarned: number;
  treasuresFound: number;
  maxCombo: number;
  players: string[];
  challengesCompleted: string[];
  completedAt: number;
  isFavorite: boolean;
};

export type Screen =
  | 'landing' | 'onboarding' | 'home' | 'adventures' | 'adventure-detail'
  | 'adventure-map' | 'quests' | 'achievements' | 'daily-rewards' | 'profile'
  | 'challenges' | 'community' | 'friends' | 'party' | 'shop' | 'settings'
  | 'history';

type StoreState = {
  currentScreen: Screen;
  selectedAdventure: string | null;
  selectedAdventureObj: Adventure | null;
  adventureHistory: AdventureHistoryEntry[];
  claimedChallenges: string[];
  completedQuests: string[];
  lastDailyRewardDay: number | null;
  lastDailyRewardDate: string | null;
  dailyRewardStreak: number;
  ownedItems: string[];
  questProgress: Record<string, number>;

  setScreen: (s: Screen) => void;
  setSelectedAdventure: (id: string) => void;
  setSelectedAdventureObj: (a: Adventure) => void;
  recordAdventureComplete: (entry: Omit<AdventureHistoryEntry, 'id' | 'completedAt' | 'isFavorite'>) => void;
  toggleFavorite: (historyId: string) => void;
  repeatAdventure: (historyId: string) => Adventure | null;
  recordChallengeComplete: (challengeId: string) => void;
  claimQuest: (questId: string) => void;
  claimDailyReward: (day: number) => void;
  buyItem: (itemId: string, price: number) => boolean;
  updateQuestProgress: (metric: string, amount: number) => void;
  resetLocalState: () => void;
};

export const useStore = create<StoreState>()((set, get) => ({
  currentScreen: 'landing',
  selectedAdventure: null,
  selectedAdventureObj: null,
  adventureHistory: [],
  claimedChallenges: [],
  completedQuests: [],
  lastDailyRewardDay: null,
  lastDailyRewardDate: null,
  dailyRewardStreak: 0,
  ownedItems: [],
  questProgress: {},

  setScreen: (s) => set({ currentScreen: s }),
  setSelectedAdventure: (id) => set({ selectedAdventure: id }),
  setSelectedAdventureObj: (a) => set({ selectedAdventureObj: a }),

  recordAdventureComplete: (entry) => set((state) => {
    const historyEntry: AdventureHistoryEntry = {
      ...entry,
      id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      completedAt: Date.now(),
      isFavorite: false
    };
    const questProgress = { ...state.questProgress };
    questProgress.distance = (questProgress.distance || 0) + entry.distance;
    questProgress.adventures = (questProgress.adventures || 0) + 1;
    questProgress.treasures = (questProgress.treasures || 0) + entry.treasuresFound;
    return {
      adventureHistory: [historyEntry, ...state.adventureHistory].slice(0, 100),
      questProgress
    };
  }),

  toggleFavorite: (historyId) => set((state) => ({
    adventureHistory: state.adventureHistory.map(h =>
      h.id === historyId ? { ...h, isFavorite: !h.isFavorite } : h
    )
  })),

  repeatAdventure: (historyId) => {
    const entry = get().adventureHistory.find(h => h.id === historyId);
    if (!entry) return null;
    const adventure = generateAdventure({
      type: entry.type,
      difficulty: entry.difficulty,
      seed: Date.now() + Math.floor(Math.random() * 100000)
    });
    return { ...adventure, title: entry.adventureName, emoji: entry.emoji };
  },

  recordChallengeComplete: (challengeId) => set((state) => {
    if (state.claimedChallenges.includes(challengeId)) return {};
    return {
      claimedChallenges: [...state.claimedChallenges, challengeId],
      questProgress: {
        ...state.questProgress,
        challenges: (state.questProgress.challenges || 0) + 1
      }
    };
  }),

  claimQuest: (questId) => set((state) => {
    if (state.completedQuests.includes(questId)) return {};
    return { completedQuests: [...state.completedQuests, questId] };
  }),

  claimDailyReward: (day) => set((state) => ({
    lastDailyRewardDay: day,
    lastDailyRewardDate: new Date().toISOString().split('T')[0],
    dailyRewardStreak: state.dailyRewardStreak + 1
  })),

  buyItem: (itemId, price) => {
    let ok = false;
    set((state) => {
      if (state.ownedItems.includes(itemId)) return {};
      ok = true;
      return { ownedItems: [...state.ownedItems, itemId] };
    });
    return ok;
  },

  updateQuestProgress: (metric, amount) => set((state) => ({
    questProgress: { ...state.questProgress, [metric]: (state.questProgress[metric] || 0) + amount }
  })),

  resetLocalState: () => set({
    adventureHistory: [],
    claimedChallenges: [],
    completedQuests: [],
    lastDailyRewardDay: null,
    lastDailyRewardDate: null,
    dailyRewardStreak: 0,
    ownedItems: [],
    questProgress: {},
    currentScreen: 'landing'
  })
}));
