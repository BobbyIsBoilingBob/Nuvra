import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateAdventure, type Adventure, type Difficulty, type AdventureType } from './data';
import type { AdventurePreferences } from './adventure-model';
import type { InventoryCategory } from './cosmetics';

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
  | 'home' | 'adventures' | 'adventure-detail' | 'adventure-map'
  | 'quests' | 'achievements' | 'daily-rewards' | 'profile'
  | 'challenges' | 'community' | 'friends' | 'party' | 'shop' | 'settings' | 'history';

export type Profile = {
  username: string;
  avatar: { emoji: string; color: string };
  level: number;
  xp: number;
  coins: number;
  gems: number;
  totalDistance: number;
  friends: number;
  streak: number;
  equippedTrail: string | null;
  equippedPet: string | null;
  equippedTheme: string | null;
  equippedStickers: string[];
  equippedBadges: string[];
};

export type OwnedItemEntry = { id: string; category: InventoryCategory; unlockedAt: number; favourite: boolean };

type StoreState = {
  currentScreen: Screen;
  previousScreen: Screen | null;
  selectedAdventure: string | null;
  selectedAdventureObj: Adventure | null;
  adventureHistory: AdventureHistoryEntry[];
  favoriteAdventures: string[];
  claimedChallenges: string[];
  completedQuests: string[];
  lastDailyRewardDay: number | null;
  lastDailyRewardDate: string | null;
  dailyRewardStreak: number;
  ownedItems: string[];
  ownedItemEntries: OwnedItemEntry[];
  questProgress: Record<string, number>;
  recentlyViewedProfiles: { id: string; username: string; avatar_emoji: string; avatar_color: string; level: number; viewedAt: number }[];
  profile: Profile;
  aiPrefs: AdventurePreferences;
  onboardingComplete: boolean;

  setScreen: (s: Screen) => void;
  goBack: () => void;
  setSelectedAdventure: (id: string) => void;
  setSelectedAdventureObj: (a: Adventure) => void;
  recordAdventureComplete: (entry: Omit<AdventureHistoryEntry, 'id' | 'completedAt' | 'isFavorite'>) => void;
  toggleFavorite: (historyId: string) => void;
  toggleFavoriteAdventure: (adventureId: string) => void;
  repeatAdventure: (historyId: string) => Adventure | null;
  recordChallengeComplete: (challengeId: string) => void;
  claimQuest: (questId: string) => void;
  claimDailyReward: (day: number) => void;
  buyItem: (itemId: string) => boolean;
  updateQuestProgress: (metric: string, amount: number) => void;
  addRecentlyViewedProfile: (p: { id: string; username: string; avatar_emoji: string; avatar_color: string; level: number }) => void;
  resetLocalState: () => void;
  setProfile: (p: Partial<Profile>) => void;
  completeOnboarding: () => void;
  setAiPrefs: (prefs: Partial<AdventurePreferences>) => void;
  addAdventure: (a: Adventure) => void;
  equipTrail: (id: string | null) => void;
  equipPet: (id: string | null) => void;
  equipTheme: (id: string | null) => void;
  toggleSticker: (id: string) => void;
  toggleBadge: (id: string) => void;
  toggleFavourite: (itemId: string) => void;
  isOwned: (itemId: string) => boolean;
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentScreen: 'home',
      previousScreen: null,
      selectedAdventure: null,
      selectedAdventureObj: null,
      adventureHistory: [],
      favoriteAdventures: [],
      claimedChallenges: [],
      completedQuests: [],
      lastDailyRewardDay: null,
      lastDailyRewardDate: null,
      dailyRewardStreak: 0,
      ownedItems: [],
      ownedItemEntries: [],
      questProgress: {},
      recentlyViewedProfiles: [],
      profile: {
        username: 'Explorer',
        avatar: { emoji: '🧭', color: '#00c4ff' },
        level: 1, xp: 0, coins: 1000, gems: 0,
        totalDistance: 0, friends: 0, streak: 0,
        equippedTrail: null, equippedPet: null, equippedTheme: null,
        equippedStickers: [], equippedBadges: [],
      },
      aiPrefs: { length: '20-30', difficulty: 'Easy', style: 'explorer', rewardPriority: 'balanced' },
      onboardingComplete: false,

      setScreen: (s) => set((state) => ({ previousScreen: state.currentScreen, currentScreen: s })),
      goBack: () => set((state) => ({ currentScreen: state.previousScreen ?? 'home' })),
      setSelectedAdventure: (id) => set({ selectedAdventure: id }),
      setSelectedAdventureObj: (a) => set({ selectedAdventureObj: a }),

      recordAdventureComplete: (entry) => set((state) => {
        const historyEntry: AdventureHistoryEntry = {
          ...entry, id: `h_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          completedAt: Date.now(), isFavorite: false
        };
        const questProgress = { ...state.questProgress };
        questProgress.distance = (questProgress.distance || 0) + entry.distance;
        questProgress.adventures = (questProgress.adventures || 0) + 1;
        questProgress.treasures = (questProgress.treasures || 0) + entry.treasuresFound;
        return { adventureHistory: [historyEntry, ...state.adventureHistory].slice(0, 100), questProgress };
      }),

      toggleFavorite: (historyId) => set((state) => ({
        adventureHistory: state.adventureHistory.map(h => h.id === historyId ? { ...h, isFavorite: !h.isFavorite } : h)
      })),

      toggleFavoriteAdventure: (adventureId) => set((state) => ({
        favoriteAdventures: state.favoriteAdventures.includes(adventureId)
          ? state.favoriteAdventures.filter(id => id !== adventureId)
          : [...state.favoriteAdventures, adventureId]
      })),

      repeatAdventure: (historyId) => {
        const entry = get().adventureHistory.find(h => h.id === historyId);
        if (!entry) return null;
        return generateAdventure({ type: entry.type, difficulty: entry.difficulty, seed: Date.now() + Math.floor(Math.random() * 100000) });
      },

      recordChallengeComplete: (challengeId) => set((state) => {
        if (state.claimedChallenges.includes(challengeId)) return {};
        return {
          claimedChallenges: [...state.claimedChallenges, challengeId],
          questProgress: { ...state.questProgress, challenges: (state.questProgress.challenges || 0) + 1 }
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

      buyItem: (itemId) => {
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

      addRecentlyViewedProfile: (p) => set((state) => {
        const filtered = state.recentlyViewedProfiles.filter(x => x.id !== p.id);
        return { recentlyViewedProfiles: [{ ...p, viewedAt: Date.now() }, ...filtered].slice(0, 10) };
      }),

      resetLocalState: () => set({
        adventureHistory: [], favoriteAdventures: [], claimedChallenges: [], completedQuests: [],
        lastDailyRewardDay: null, lastDailyRewardDate: null, dailyRewardStreak: 0,
        ownedItems: [], ownedItemEntries: [], questProgress: {}, recentlyViewedProfiles: [], currentScreen: 'home'
      }),

      setProfile: (p) => set((state) => ({ profile: { ...state.profile, ...p } })),
      completeOnboarding: () => set({ onboardingComplete: true }),
      setAiPrefs: (prefs) => set((state) => ({ aiPrefs: { ...state.aiPrefs, ...prefs } })),
      addAdventure: (a) => set((state) => ({ selectedAdventureObj: a })),
      equipTrail: (id) => set((state) => ({ profile: { ...state.profile, equippedTrail: id } })),
      equipPet: (id) => set((state) => ({ profile: { ...state.profile, equippedPet: id } })),
      equipTheme: (id) => set((state) => ({ profile: { ...state.profile, equippedTheme: id } })),
      toggleSticker: (id) => set((state) => {
        const has = state.profile.equippedStickers.includes(id);
        return { profile: { ...state.profile, equippedStickers: has ? state.profile.equippedStickers.filter(s => s !== id) : [...state.profile.equippedStickers, id] } };
      }),
      toggleBadge: (id) => set((state) => {
        const has = state.profile.equippedBadges.includes(id);
        return { profile: { ...state.profile, equippedBadges: has ? state.profile.equippedBadges.filter(b => b !== id) : [...state.profile.equippedBadges, id] } };
      }),
      toggleFavourite: (itemId) => set((state) => ({
        ownedItemEntries: state.ownedItemEntries.map(e => e.id === itemId ? { ...e, favourite: !e.favourite } : e),
      })),
      isOwned: (itemId) => get().ownedItems.includes(itemId),
    }),
    { name: 'zeviqo-local' }
  )
);
