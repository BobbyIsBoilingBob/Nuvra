import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Screen, AdventurePreferences } from './data';
import { getLevelInfo, type LevelInfo } from './data';

export interface AvatarConfig {
  emoji: string;
  color: string;
}

export interface QuestProgress {
  questId: string;
  progress: number;
  claimed: boolean;
  dateAssigned: string;
}

export interface AchievementProgress {
  achievementId: string;
  unlocked: boolean;
  dateUnlocked: string | null;
  progress: number;
}

export interface DailyRewardState {
  lastClaimDate: string | null;
  currentStreak: number;
  claimedToday: boolean;
}

export interface PlayerStats {
  totalDistance: number;
  totalAdventures: number;
  totalChallenges: number;
  totalCoinsEarned: number;
  totalXpEarned: number;
  multiplayerAdventures: number;
  friendsAdded: number;
  longestStreak: number;
  treasuresFound: number;
}

export interface Profile {
  playerId: string;
  username: string;
  avatar: AvatarConfig;
  xp: number;
  coins: number;
  gems: number;
  preferences: AdventurePreferences;
  createdAt: number;
}

interface StoreState {
  screen: Screen;
  prevScreen: Screen | null;
  profile: Profile;
  onboardingComplete: boolean;
  selectedAdventureId: string | null;

  // Progression
  questProgress: QuestProgress[];
  achievementProgress: AchievementProgress[];
  dailyReward: DailyRewardState;
  stats: PlayerStats;
  lastWalkDate: string | null;
  walkingStreak: number;

  // Actions
  setScreen: (s: Screen) => void;
  setProfile: (p: Partial<Profile>) => void;
  completeOnboarding: (username: string, avatar: AvatarConfig) => void;
  setSelectedAdventure: (id: string | null) => void;

  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  spendGems: (amount: number) => boolean;

  recordDistance: (meters: number) => void;
  recordAdventureComplete: (adventureId: string, xp: number, coins: number, gems: number, isMultiplayer: boolean) => void;
  recordChallengeComplete: (challengeId: string, xp: number, coins: number) => void;
  recordTreasureFound: (coins: number) => void;
  recordFriendAdded: () => void;

  updateQuestProgress: (category: string, amount: number) => void;
  claimQuest: (questId: string) => void;
  checkAchievements: () => string[];
  claimAchievement: (achievementId: string) => void;

  claimDailyReward: (coins: number, gems: number, xp: number) => void;
  checkDailyReward: () => void;

  resetProgress: () => void;
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

const defaultProfile: Profile = {
  playerId: `player-${Math.random().toString(36).slice(2, 10)}`,
  username: 'Explorer',
  avatar: { emoji: '🧭', color: '#33ffd6' },
  xp: 0,
  coins: 0,
  gems: 0,
  preferences: {
    length: '20-30',
    style: 'explorer',
    difficulty: 'Easy',
    rewardPriority: 'balanced',
  },
  createdAt: Date.now(),
};

const defaultStats: PlayerStats = {
  totalDistance: 0,
  totalAdventures: 0,
  totalChallenges: 0,
  totalCoinsEarned: 0,
  totalXpEarned: 0,
  multiplayerAdventures: 0,
  friendsAdded: 0,
  longestStreak: 0,
  treasuresFound: 0,
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      screen: 'landing',
      prevScreen: null,
      profile: defaultProfile,
      onboardingComplete: false,
      selectedAdventureId: null,
      questProgress: [],
      achievementProgress: [],
      dailyReward: { lastClaimDate: null, currentStreak: 0, claimedToday: false },
      stats: defaultStats,
      lastWalkDate: null,
      walkingStreak: 0,

      setScreen: (s) => set((state) => ({ screen: s, prevScreen: state.screen })),
      setProfile: (p) => set((state) => ({ profile: { ...state.profile, ...p } })),
      completeOnboarding: (username, avatar) =>
        set({ profile: { ...get().profile, username, avatar }, onboardingComplete: true, screen: 'home' }),
      setSelectedAdventure: (id) => set({ selectedAdventureId: id }),

      addXp: (amount) =>
        set((state) => ({
          profile: { ...state.profile, xp: state.profile.xp + amount },
          stats: { ...state.stats, totalXpEarned: state.stats.totalXpEarned + amount },
        })),

      addCoins: (amount) =>
        set((state) => ({
          profile: { ...state.profile, coins: state.profile.coins + amount },
          stats: { ...state.stats, totalCoinsEarned: state.stats.totalCoinsEarned + amount },
        })),

      addGems: (amount) =>
        set((state) => ({ profile: { ...state.profile, gems: state.profile.gems + amount } })),

      spendCoins: (amount) => {
        const { profile } = get();
        if (profile.coins < amount) return false;
        set({ profile: { ...profile, coins: profile.coins - amount } });
        return true;
      },

      spendGems: (amount) => {
        const { profile } = get();
        if (profile.gems < amount) return false;
        set({ profile: { ...profile, gems: profile.gems - amount } });
        return true;
      },

      recordDistance: (meters) => {
        const state = get();
        const today = todayStr();
        let newStreak = state.walkingStreak;

        if (state.lastWalkDate !== today) {
          if (state.lastWalkDate && daysBetween(state.lastWalkDate, today) === 1) {
            newStreak = state.walkingStreak + 1;
          } else if (!state.lastWalkDate) {
            newStreak = 1;
          } else {
            newStreak = 1;
          }
        }

        set({
          stats: {
            ...state.stats,
            totalDistance: state.stats.totalDistance + meters,
            longestStreak: Math.max(state.stats.longestStreak, newStreak),
          },
          lastWalkDate: today,
          walkingStreak: newStreak,
        });

        get().updateQuestProgress('distance', meters);
        get().updateQuestProgress('streak', newStreak);
        get().checkAchievements();
      },

      recordAdventureComplete: (adventureId, xp, coins, gems, isMultiplayer) => {
        const state = get();
        set({
          profile: {
            ...state.profile,
            xp: state.profile.xp + xp,
            coins: state.profile.coins + coins,
            gems: state.profile.gems + gems,
          },
          stats: {
            ...state.stats,
            totalAdventures: state.stats.totalAdventures + 1,
            totalXpEarned: state.stats.totalXpEarned + xp,
            totalCoinsEarned: state.stats.totalCoinsEarned + coins,
            multiplayerAdventures: state.stats.multiplayerAdventures + (isMultiplayer ? 1 : 0),
          },
        });
        get().updateQuestProgress('adventures', 1);
        if (isMultiplayer) get().updateQuestProgress('multiplayer', 1);
        get().updateQuestProgress('xp', xp);
        get().updateQuestProgress('coins', coins);
        get().checkAchievements();
      },

      recordChallengeComplete: (challengeId, xp, coins) => {
        const state = get();
        set({
          profile: { ...state.profile, xp: state.profile.xp + xp, coins: state.profile.coins + coins },
          stats: {
            ...state.stats,
            totalChallenges: state.stats.totalChallenges + 1,
            totalXpEarned: state.stats.totalXpEarned + xp,
            totalCoinsEarned: state.stats.totalCoinsEarned + coins,
          },
        });
        get().updateQuestProgress('challenges', 1);
        get().updateQuestProgress('xp', xp);
        get().updateQuestProgress('coins', coins);
        get().checkAchievements();
      },

      recordTreasureFound: (coins) => {
        const state = get();
        set({
          profile: { ...state.profile, coins: state.profile.coins + coins },
          stats: {
            ...state.stats,
            treasuresFound: state.stats.treasuresFound + 1,
            totalCoinsEarned: state.stats.totalCoinsEarned + coins,
          },
        });
        get().updateQuestProgress('coins', coins);
        get().checkAchievements();
      },

      recordFriendAdded: () => {
        const state = get();
        set({ stats: { ...state.stats, friendsAdded: state.stats.friendsAdded + 1 } });
        get().updateQuestProgress('friends', 1);
        get().checkAchievements();
      },

      updateQuestProgress: (category, amount) => {
        const state = get();
        const today = todayStr();
        const updated = state.questProgress.map((qp) => {
          if (qp.claimed) return qp;
          return qp;
        });
        set({ questProgress: updated });
      },

      claimQuest: (questId) => {
        const state = get();
        const qp = state.questProgress.find((q) => q.questId === questId);
        if (!qp || qp.claimed) return;
        set({
          questProgress: state.questProgress.map((q) =>
            q.questId === questId ? { ...q, claimed: true } : q,
          ),
        });
      },

      checkAchievements: () => {
        const state = get();
        const stats = state.stats;
        const newlyUnlocked: string[] = [];

        const checks: Record<string, number> = {
          'dist-1km': stats.totalDistance >= 1000 ? 1 : 0,
          'dist-10km': stats.totalDistance >= 10000 ? 1 : 0,
          'dist-50km': stats.totalDistance >= 50000 ? 1 : 0,
          'dist-100km': stats.totalDistance >= 100000 ? 1 : 0,
          'dist-500km': stats.totalDistance >= 500000 ? 1 : 0,
          'adv-1': stats.totalAdventures >= 1 ? 1 : 0,
          'adv-10': stats.totalAdventures >= 10 ? 1 : 0,
          'adv-50': stats.totalAdventures >= 50 ? 1 : 0,
          'adv-100': stats.totalAdventures >= 100 ? 1 : 0,
          'streak-3': state.walkingStreak >= 3 ? 1 : 0,
          'streak-7': state.walkingStreak >= 7 ? 1 : 0,
          'streak-30': state.walkingStreak >= 30 ? 1 : 0,
          'streak-100': state.walkingStreak >= 100 ? 1 : 0,
          'friends-1': stats.friendsAdded >= 1 ? 1 : 0,
          'friends-5': stats.friendsAdded >= 5 ? 1 : 0,
          'friends-20': stats.friendsAdded >= 20 ? 1 : 0,
          'mp-1': stats.multiplayerAdventures >= 1 ? 1 : 0,
          'mp-10': stats.multiplayerAdventures >= 10 ? 1 : 0,
          'mp-25': stats.multiplayerAdventures >= 25 ? 1 : 0,
          'coins-500': stats.totalCoinsEarned >= 500 ? 1 : 0,
          'coins-5000': stats.totalCoinsEarned >= 5000 ? 1 : 0,
          'coins-25000': stats.totalCoinsEarned >= 25000 ? 1 : 0,
          'xp-1000': stats.totalXpEarned >= 1000 ? 1 : 0,
          'xp-10000': stats.totalXpEarned >= 10000 ? 1 : 0,
          'xp-50000': stats.totalXpEarned >= 50000 ? 1 : 0,
          'chal-5': stats.totalChallenges >= 5 ? 1 : 0,
          'chal-25': stats.totalChallenges >= 25 ? 1 : 0,
          'chal-100': stats.totalChallenges >= 100 ? 1 : 0,
        };

        const existing = new Map(state.achievementProgress.map((a) => [a.achievementId, a]));
        const updatedProgress: AchievementProgress[] = [];

        for (const [id, value] of Object.entries(checks)) {
          const current = existing.get(id);
          if (current && current.unlocked) {
            updatedProgress.push(current);
          } else if (value >= 1) {
            newlyUnlocked.push(id);
            updatedProgress.push({
              achievementId: id,
              unlocked: true,
              dateUnlocked: todayStr(),
              progress: 1,
            });
          } else if (current) {
            updatedProgress.push(current);
          }
        }

        set({ achievementProgress: updatedProgress });
        return newlyUnlocked;
      },

      claimAchievement: (achievementId) => {
        // Achievement rewards are auto-granted on unlock
      },

      claimDailyReward: (coins, gems, xp) => {
        const state = get();
        if (state.dailyReward.claimedToday) return;

        const today = todayStr();
        let newStreak = state.dailyReward.currentStreak;

        if (state.dailyReward.lastClaimDate) {
          const diff = daysBetween(state.dailyReward.lastClaimDate, today);
          if (diff === 1) {
            newStreak = state.dailyReward.currentStreak + 1;
          } else if (diff > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        if (newStreak > 7) newStreak = 1;

        set({
          profile: {
            ...state.profile,
            coins: state.profile.coins + coins,
            gems: state.profile.gems + gems,
            xp: state.profile.xp + xp,
          },
          stats: {
            ...state.stats,
            totalCoinsEarned: state.stats.totalCoinsEarned + coins,
            totalXpEarned: state.stats.totalXpEarned + xp,
          },
          dailyReward: {
            lastClaimDate: today,
            currentStreak: newStreak,
            claimedToday: true,
          },
        });
        get().checkAchievements();
      },

      checkDailyReward: () => {
        const state = get();
        const today = todayStr();
        if (state.dailyReward.lastClaimDate === today && state.dailyReward.claimedToday) return;
        if (state.dailyReward.lastClaimDate !== today) {
          set({ dailyReward: { ...state.dailyReward, claimedToday: false } });
        }
      },

      resetProgress: () => {
        set({
          profile: { ...defaultProfile, playerId: `player-${Math.random().toString(36).slice(2, 10)}` },
          questProgress: [],
          achievementProgress: [],
          dailyReward: { lastClaimDate: null, currentStreak: 0, claimedToday: false },
          stats: { ...defaultStats },
          lastWalkDate: null,
          walkingStreak: 0,
          screen: 'landing',
          onboardingComplete: false,
        });
      },
    }),
    {
      name: 'nuvra-save',
      partialize: (state) => ({
        profile: state.profile,
        onboardingComplete: state.onboardingComplete,
        questProgress: state.questProgress,
        achievementProgress: state.achievementProgress,
        dailyReward: state.dailyReward,
        stats: state.stats,
        lastWalkDate: state.lastWalkDate,
        walkingStreak: state.walkingStreak,
      }),
    },
  ),
);
