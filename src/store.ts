import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateAdventure, getLevelInfo, type Adventure, type Difficulty, type AdventureType } from './data';

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

export type Profile = {
  username: string;
  playerId: string;
  createdAt: number;
  xp: number;
  coins: number;
  gems: number;
  totalDistance: number;
  totalSteps: number;
  totalAdventures: number;
  totalChallenges: number;
  totalTreasures: number;
  walkingStreak: number;
  lastWalkDate: string | null;
  unlockedAchievements: string[];
  completedQuests: string[];
  claimedChallenges: string[];
  lastDailyRewardDay: number | null;
  lastDailyRewardDate: string | null;
  dailyRewardStreak: number;
  ownedItems: string[];
  avatarEmoji: string;
  avatarColor: string;
};

export type QuestProgress = Record<string, number>;
export type Screen =
  | 'landing' | 'onboarding' | 'home' | 'adventures' | 'adventure-detail'
  | 'adventure-map' | 'quests' | 'achievements' | 'daily-rewards' | 'profile'
  | 'challenges' | 'community' | 'friends' | 'party' | 'shop' | 'settings'
  | 'history';

type StoreState = {
  hasOnboarded: boolean;
  currentScreen: Screen;
  selectedAdventure: string | null;
  selectedAdventureObj: Adventure | null;
  profile: Profile;
  adventureHistory: AdventureHistoryEntry[];
  questProgress: QuestProgress;
  dailyQuestsResetAt: string | null;
  weeklyQuestsResetAt: string | null;

  setScreen: (s: Screen) => void;
  setSelectedAdventure: (id: string) => void;
  setSelectedAdventureObj: (a: Adventure) => void;
  completeOnboarding: () => void;
  setProfile: (partial: Partial<Profile>) => void;
  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  spendGems: (amount: number) => boolean;
  recordAdventureComplete: (entry: Omit<AdventureHistoryEntry, 'id' | 'completedAt' | 'isFavorite'>) => void;
  toggleFavorite: (historyId: string) => void;
  repeatAdventure: (historyId: string) => Adventure | null;
  recordChallengeComplete: (challengeId: string, xp: number, coins: number) => void;
  claimQuest: (questId: string, xp: number, coins: number) => void;
  claimDailyReward: (day: number, coins: number, gems: number, xp: number) => void;
  buyItem: (itemId: string, price: number) => boolean;
  updateQuestProgress: (metric: string, amount: number) => void;
  resetProgress: () => void;
};

const defaultProfile: Profile = {
  username: 'Explorer',
  playerId: Math.random().toString(36).substring(2, 10).toUpperCase(),
  createdAt: Date.now(),
  xp: 0,
  coins: 500,
  gems: 0,
  totalDistance: 0,
  totalSteps: 0,
  totalAdventures: 0,
  totalChallenges: 0,
  totalTreasures: 0,
  walkingStreak: 0,
  lastWalkDate: null,
  unlockedAchievements: [],
  completedQuests: [],
  claimedChallenges: [],
  lastDailyRewardDay: null,
  lastDailyRewardDate: null,
  dailyRewardStreak: 0,
  ownedItems: [],
  avatarEmoji: '🧭',
  avatarColor: '#00c4ff'
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      hasOnboarded: false,
      currentScreen: 'landing',
      selectedAdventure: null,
      selectedAdventureObj: null,
      profile: defaultProfile,
      adventureHistory: [],
      questProgress: {},
      dailyQuestsResetAt: null,
      weeklyQuestsResetAt: null,

      setScreen: (s) => set({ currentScreen: s }),
      setSelectedAdventure: (id) => set({ selectedAdventure: id }),
      setSelectedAdventureObj: (a) => set({ selectedAdventureObj: a }),
      completeOnboarding: () => set({ hasOnboarded: true, currentScreen: 'home' }),

      setProfile: (partial) => set((state) => ({ profile: { ...state.profile, ...partial } })),

      addXp: (amount) => set((state) => ({ profile: { ...state.profile, xp: state.profile.xp + amount } })),
      addCoins: (amount) => set((state) => ({ profile: { ...state.profile, coins: state.profile.coins + amount } })),
      addGems: (amount) => set((state) => ({ profile: { ...state.profile, gems: state.profile.gems + amount } })),

      spendCoins: (amount) => {
        let ok = false;
        set((state) => {
          if (state.profile.coins >= amount) {
            ok = true;
            return { profile: { ...state.profile, coins: state.profile.coins - amount } };
          }
          return {};
        });
        return ok;
      },

      spendGems: (amount) => {
        let ok = false;
        set((state) => {
          if (state.profile.gems >= amount) {
            ok = true;
            return { profile: { ...state.profile, gems: state.profile.gems - amount } };
          }
          return {};
        });
        return ok;
      },

      recordAdventureComplete: (entry) => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        let newStreak = state.profile.walkingStreak;
        if (state.profile.lastWalkDate === yesterday) newStreak += 1;
        else if (state.profile.lastWalkDate !== today) newStreak = 1;
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
        questProgress.streak = newStreak;
        return {
          adventureHistory: [historyEntry, ...state.adventureHistory].slice(0, 100),
          profile: {
            ...state.profile,
            xp: state.profile.xp + entry.xpEarned,
            coins: state.profile.coins + entry.coinsEarned,
            gems: state.profile.gems + entry.gemsEarned,
            totalDistance: state.profile.totalDistance + entry.distance,
            totalAdventures: state.profile.totalAdventures + 1,
            totalTreasures: state.profile.totalTreasures + entry.treasuresFound,
            walkingStreak: newStreak,
            lastWalkDate: today
          },
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

      recordChallengeComplete: (challengeId, xp, coins) => set((state) => {
        if (state.profile.claimedChallenges.includes(challengeId)) return {};
        return {
          profile: {
            ...state.profile,
            xp: state.profile.xp + xp,
            coins: state.profile.coins + coins,
            totalChallenges: state.profile.totalChallenges + 1,
            claimedChallenges: [...state.profile.claimedChallenges, challengeId]
          },
          questProgress: {
            ...state.questProgress,
            challenges: (state.questProgress.challenges || 0) + 1
          }
        };
      }),

      claimQuest: (questId, xp, coins) => set((state) => {
        if (state.profile.completedQuests.includes(questId)) return {};
        return {
          profile: {
            ...state.profile,
            xp: state.profile.xp + xp,
            coins: state.profile.coins + coins,
            completedQuests: [...state.profile.completedQuests, questId]
          }
        };
      }),

      claimDailyReward: (day, coins, gems, xp) => set((state) => ({
        profile: {
          ...state.profile,
          coins: state.profile.coins + coins,
          gems: state.profile.gems + gems,
          xp: state.profile.xp + xp,
          lastDailyRewardDay: day,
          lastDailyRewardDate: new Date().toISOString().split('T')[0],
          dailyRewardStreak: state.profile.dailyRewardStreak + 1
        }
      })),

      buyItem: (itemId, price) => {
        let ok = false;
        set((state) => {
          if (state.profile.ownedItems.includes(itemId)) return {};
          if (state.profile.coins < price) return {};
          ok = true;
          return {
            profile: {
              ...state.profile,
              coins: state.profile.coins - price,
              ownedItems: [...state.profile.ownedItems, itemId]
            }
          };
        });
        return ok;
      },

      updateQuestProgress: (metric, amount) => set((state) => ({
        questProgress: {
          ...state.questProgress,
          [metric]: (state.questProgress[metric] || 0) + amount
        }
      })),

      resetProgress: () => set({
        profile: { ...defaultProfile, playerId: Math.random().toString(36).substring(2, 10).toUpperCase(), createdAt: Date.now() },
        adventureHistory: [],
        questProgress: {},
        hasOnboarded: false,
        currentScreen: 'landing'
      })
    }),
    { name: 'zeviqo-save' }
  )
);

export { getLevelInfo };
