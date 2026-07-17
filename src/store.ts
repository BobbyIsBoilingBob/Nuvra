import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Screen, AdventurePreferences, AdventureType } from './data';
import { getLevelInfo, ADVENTURES, type LevelInfo, type Adventure } from './data';

export interface AvatarConfig { emoji: string; color: string }

export interface QuestProgress { questId: string; progress: number; claimed: boolean; dateAssigned: string }

export interface AchievementProgress { achievementId: string; unlocked: boolean; dateUnlocked: string | null; progress: number }

export interface DailyRewardState { lastClaimDate: string | null; currentStreak: number; claimedToday: boolean }

export interface PlayerStats {
  totalDistance: number; totalAdventures: number; totalChallenges: number;
  totalCoinsEarned: number; totalXpEarned: number; multiplayerAdventures: number;
  friendsAdded: number; longestStreak: number; treasuresFound: number;
}

export interface AdventureHistoryEntry {
  id: string; adventureId: string; adventureName: string; emoji: string;
  type: AdventureType; distance: number; time: number; xpEarned: number;
  coinsEarned: number; gemsEarned: number; treasuresFound: number; maxCombo: number;
  challengesCompleted: number; completedAt: number; players: string[]; isFavorite: boolean;
}

export interface Profile {
  playerId: string; username: string; avatar: AvatarConfig;
  xp: number; coins: number; gems: number;
  preferences: AdventurePreferences; createdAt: number;
}

interface StoreState {
  screen: Screen; prevScreen: Screen | null;
  profile: Profile; onboardingComplete: boolean;
  selectedAdventureId: string | null; selectedAdventure: Adventure | null;
  generatedAdventures: Adventure[];
  adventureHistory: AdventureHistoryEntry[];
  recentAdventureTypes: AdventureType[];

  questProgress: QuestProgress[]; achievementProgress: AchievementProgress[];
  dailyReward: DailyRewardState; stats: PlayerStats;
  lastWalkDate: string | null; walkingStreak: number;

  setScreen: (s: Screen) => void;
  setProfile: (p: Partial<Profile>) => void;
  completeOnboarding: (username: string, avatar: AvatarConfig) => void;
  setSelectedAdventure: (id: string | null) => void;
  setSelectedAdventureObj: (a: Adventure | null) => void;
  addGeneratedAdventure: (a: Adventure) => void;

  addXp: (amount: number) => void;
  addCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  spendGems: (amount: number) => boolean;

  recordDistance: (meters: number) => void;
  recordAdventureComplete: (adventure: Adventure, xp: number, coins: number, gems: number, isMultiplayer: boolean, players: string[], distance: number, time: number, treasures: number, maxCombo: number, challengesCompleted: number) => void;
  recordChallengeComplete: (challengeId: string, xp: number, coins: number) => void;
  recordTreasureFound: (coins: number) => void;
  recordFriendAdded: () => void;

  updateQuestProgress: (category: string, amount: number) => void;
  claimQuest: (questId: string) => void;
  checkAchievements: () => string[];

  claimDailyReward: (coins: number, gems: number, xp: number) => void;
  checkDailyReward: () => void;

  toggleFavorite: (historyId: string) => void;
  repeatAdventure: (historyId: string) => Adventure | null;

  resetProgress: () => void;
}

function todayStr(): string { return new Date().toISOString().split('T')[0] }
function daysBetween(d1: string, d2: string): number {
  return Math.round((new Date(d2).getTime() - new Date(d1).getTime()) / 86400000);
}

const defaultProfile: Profile = {
  playerId: `player-${Math.random().toString(36).slice(2, 10)}`,
  username: 'Explorer', avatar: { emoji: '🧭', color: '#3dd4ff' },
  xp: 0, coins: 0, gems: 0,
  preferences: { length: '20-30', style: 'explorer', difficulty: 'Easy', rewardPriority: 'balanced' },
  createdAt: Date.now(),
};

const defaultStats: PlayerStats = {
  totalDistance: 0, totalAdventures: 0, totalChallenges: 0,
  totalCoinsEarned: 0, totalXpEarned: 0, multiplayerAdventures: 0,
  friendsAdded: 0, longestStreak: 0, treasuresFound: 0,
};

export const useStore = create<StoreState>()(
  persist(
    (set, _get) => ({
      screen: 'landing', prevScreen: null,
      profile: defaultProfile, onboardingComplete: false,
      selectedAdventureId: null, selectedAdventure: null,
      generatedAdventures: [], adventureHistory: [], recentAdventureTypes: [],
      questProgress: [], achievementProgress: [],
      dailyReward: { lastClaimDate: null, currentStreak: 0, claimedToday: false },
      stats: defaultStats, lastWalkDate: null, walkingStreak: 0,

      setScreen: (s) => set((state) => ({ screen: s, prevScreen: state.screen })),
      setProfile: (p) => set((state) => ({ profile: { ...state.profile, ...p } })),
      completeOnboarding: (username, avatar) =>
        set((state) => ({ profile: { ...state.profile, username, avatar }, onboardingComplete: true, screen: 'home' as Screen })),
      setSelectedAdventure: (id) => set({ selectedAdventureId: id }),
      setSelectedAdventureObj: (a) => set({ selectedAdventure: a }),
      addGeneratedAdventure: (a) => set((state) => ({
        generatedAdventures: [a, ...state.generatedAdventures].slice(0, 20),
      })),

      addXp: (amount) => set((state) => ({
        profile: { ...state.profile, xp: state.profile.xp + amount },
        stats: { ...state.stats, totalXpEarned: state.stats.totalXpEarned + amount },
      })),
      addCoins: (amount) => set((state) => ({
        profile: { ...state.profile, coins: state.profile.coins + amount },
        stats: { ...state.stats, totalCoinsEarned: state.stats.totalCoinsEarned + amount },
      })),
      addGems: (amount) => set((state) => ({ profile: { ...state.profile, gems: state.profile.gems + amount } })),
      spendCoins: (amount) => {
        let ok = false;
        set((state) => {
          if (state.profile.coins < amount) return {};
          ok = true;
          return { profile: { ...state.profile, coins: state.profile.coins - amount } };
        });
        return ok;
      },
      spendGems: (amount) => {
        let ok = false;
        set((state) => {
          if (state.profile.gems < amount) return {};
          ok = true;
          return { profile: { ...state.profile, gems: state.profile.gems - amount } };
        });
        return ok;
      },

      recordDistance: (meters) => {
        set((state) => {
          const today = todayStr();
          let newStreak = state.walkingStreak;
          if (state.lastWalkDate !== today) {
            if (state.lastWalkDate && daysBetween(state.lastWalkDate, today) === 1) newStreak = state.walkingStreak + 1;
            else newStreak = 1;
          }
          return {
            stats: { ...state.stats, totalDistance: state.stats.totalDistance + meters, longestStreak: Math.max(state.stats.longestStreak, newStreak) },
            lastWalkDate: today, walkingStreak: newStreak,
          };
        });
      },

      recordAdventureComplete: (adventure, xp, coins, gems, isMultiplayer, players, distance, time, treasures, maxCombo, challengesCompleted) => {
        set((state) => {
          const historyEntry: AdventureHistoryEntry = {
            id: `hist-${Date.now()}`, adventureId: adventure.id,
            adventureName: adventure.name, emoji: adventure.emoji, type: adventure.type,
            distance, time, xpEarned: xp, coinsEarned: coins, gemsEarned: gems,
            treasuresFound: treasures, maxCombo, challengesCompleted,
            completedAt: Date.now(),
            players: players.length > 0 ? players : [state.profile.username],
            isFavorite: false,
          };
          return {
            profile: { ...state.profile, xp: state.profile.xp + xp, coins: state.profile.coins + coins, gems: state.profile.gems + gems },
            stats: {
              ...state.stats, totalAdventures: state.stats.totalAdventures + 1,
              totalXpEarned: state.stats.totalXpEarned + xp,
              totalCoinsEarned: state.stats.totalCoinsEarned + coins,
              multiplayerAdventures: state.stats.multiplayerAdventures + (isMultiplayer ? 1 : 0),
              treasuresFound: state.stats.treasuresFound + treasures,
            },
            adventureHistory: [historyEntry, ...state.adventureHistory].slice(0, 100),
            recentAdventureTypes: [adventure.type, ...state.recentAdventureTypes.filter(t => t !== adventure.type)].slice(0, 5),
          };
        });
      },

      recordChallengeComplete: (challengeId, xp, coins) => {
        set((state) => ({
          profile: { ...state.profile, xp: state.profile.xp + xp, coins: state.profile.coins + coins },
          stats: { ...state.stats, totalChallenges: state.stats.totalChallenges + 1, totalXpEarned: state.stats.totalXpEarned + xp, totalCoinsEarned: state.stats.totalCoinsEarned + coins },
        }));
      },

      recordTreasureFound: (coins) => {
        set((state) => ({
          profile: { ...state.profile, coins: state.profile.coins + coins },
          stats: { ...state.stats, treasuresFound: state.stats.treasuresFound + 1, totalCoinsEarned: state.stats.totalCoinsEarned + coins },
        }));
      },

      recordFriendAdded: () => {
        set((state) => ({ stats: { ...state.stats, friendsAdded: state.stats.friendsAdded + 1 } }));
      },

      updateQuestProgress: (_category, _amount) => {},

      claimQuest: (questId) => {
        set((state) => ({ questProgress: state.questProgress.map(q => q.questId === questId ? { ...q, claimed: true } : q) }));
      },

      checkAchievements: () => {
        let newlyUnlocked: string[] = [];
        set((state) => {
          const stats = state.stats;
          const checks: Record<string, number> = {
            'dist-1km': stats.totalDistance >= 1000 ? 1 : 0, 'dist-10km': stats.totalDistance >= 10000 ? 1 : 0,
            'dist-50km': stats.totalDistance >= 50000 ? 1 : 0, 'dist-100km': stats.totalDistance >= 100000 ? 1 : 0,
            'dist-500km': stats.totalDistance >= 500000 ? 1 : 0,
            'adv-1': stats.totalAdventures >= 1 ? 1 : 0, 'adv-10': stats.totalAdventures >= 10 ? 1 : 0,
            'adv-50': stats.totalAdventures >= 50 ? 1 : 0, 'adv-100': stats.totalAdventures >= 100 ? 1 : 0,
            'streak-3': state.walkingStreak >= 3 ? 1 : 0, 'streak-7': state.walkingStreak >= 7 ? 1 : 0,
            'streak-30': state.walkingStreak >= 30 ? 1 : 0, 'streak-100': state.walkingStreak >= 100 ? 1 : 0,
            'friends-1': stats.friendsAdded >= 1 ? 1 : 0, 'friends-5': stats.friendsAdded >= 5 ? 1 : 0,
            'friends-20': stats.friendsAdded >= 20 ? 1 : 0,
            'mp-1': stats.multiplayerAdventures >= 1 ? 1 : 0, 'mp-10': stats.multiplayerAdventures >= 10 ? 1 : 0,
            'mp-25': stats.multiplayerAdventures >= 25 ? 1 : 0,
            'coins-500': stats.totalCoinsEarned >= 500 ? 1 : 0, 'coins-5000': stats.totalCoinsEarned >= 5000 ? 1 : 0,
            'coins-25000': stats.totalCoinsEarned >= 25000 ? 1 : 0,
            'xp-1000': stats.totalXpEarned >= 1000 ? 1 : 0, 'xp-10000': stats.totalXpEarned >= 10000 ? 1 : 0,
            'xp-50000': stats.totalXpEarned >= 50000 ? 1 : 0,
            'chal-5': stats.totalChallenges >= 5 ? 1 : 0, 'chal-25': stats.totalChallenges >= 25 ? 1 : 0,
            'chal-100': stats.totalChallenges >= 100 ? 1 : 0,
          };
          const existing = new Map(state.achievementProgress.map(a => [a.achievementId, a]));
          const updated: AchievementProgress[] = [];
          const unlocked: string[] = [];
          for (const [id, value] of Object.entries(checks)) {
            const current = existing.get(id);
            if (current && current.unlocked) updated.push(current);
            else if (value >= 1) { unlocked.push(id); updated.push({ achievementId: id, unlocked: true, dateUnlocked: todayStr(), progress: 1 }); }
            else if (current) updated.push(current);
          }
          newlyUnlocked = unlocked;
          return { achievementProgress: updated };
        });
        return newlyUnlocked;
      },

      claimDailyReward: (coins, gems, xp) => {
        set((state) => {
          if (state.dailyReward.claimedToday) return {};
          const today = todayStr();
          let newStreak = state.dailyReward.currentStreak;
          if (state.dailyReward.lastClaimDate) {
            const diff = daysBetween(state.dailyReward.lastClaimDate, today);
            if (diff === 1) newStreak = state.dailyReward.currentStreak + 1;
            else if (diff > 1) newStreak = 1;
          } else newStreak = 1;
          if (newStreak > 7) newStreak = 1;
          return {
            profile: { ...state.profile, coins: state.profile.coins + coins, gems: state.profile.gems + gems, xp: state.profile.xp + xp },
            stats: { ...state.stats, totalCoinsEarned: state.stats.totalCoinsEarned + coins, totalXpEarned: state.stats.totalXpEarned + xp },
            dailyReward: { lastClaimDate: today, currentStreak: newStreak, claimedToday: true },
          };
        });
      },

      checkDailyReward: () => {
        set((state) => {
          const today = todayStr();
          if (state.dailyReward.lastClaimDate === today && state.dailyReward.claimedToday) return {};
          if (state.dailyReward.lastClaimDate !== today) return { dailyReward: { ...state.dailyReward, claimedToday: false } };
          return {};
        });
      },

      toggleFavorite: (historyId) => {
        set((state) => ({
          adventureHistory: state.adventureHistory.map(h =>
            h.id === historyId ? { ...h, isFavorite: !h.isFavorite } : h
          ),
        }));
      },

      repeatAdventure: (historyId) => {
        const state = _get();
        const entry = state.adventureHistory.find(h => h.id === historyId);
        if (!entry) return null;
        const original = ADVENTURES.find(a => a.id === entry.adventureId) ??
          state.generatedAdventures.find(a => a.id === entry.adventureId);
        if (original) return original;
        return {
          id: `repeat-${entry.adventureId}`, name: entry.adventureName, emoji: entry.emoji,
          difficulty: 'Medium' as const, distanceKm: entry.distance / 1000,
          durationMin: Math.round(entry.time / 60), theme: 'mystery', terrain: 'Unknown',
          type: entry.type, description: `Repeat of ${entry.adventureName}`,
          xpReward: entry.xpEarned, coinReward: entry.coinsEarned, gemReward: entry.gemsEarned,
          caloriesEstimate: Math.round(entry.distance / 1000 * 50), tags: ['repeat'],
          objectives: [{ id: 'obj1', label: `Walk ${(entry.distance / 1000).toFixed(1)} km`, icon: 'Footprints', target: Math.round(entry.distance), unit: 'm', type: 'distance' as const }],
          isGenerated: true, createdAt: Date.now(),
        } as Adventure;
      },

      resetProgress: () => set({
        profile: { ...defaultProfile, playerId: `player-${Math.random().toString(36).slice(2, 10)}` },
        questProgress: [], achievementProgress: [],
        dailyReward: { lastClaimDate: null, currentStreak: 0, claimedToday: false },
        stats: { ...defaultStats }, lastWalkDate: null, walkingStreak: 0,
        screen: 'landing', onboardingComplete: false,
        generatedAdventures: [], adventureHistory: [], recentAdventureTypes: [],
        selectedAdventureId: null, selectedAdventure: null,
      }),
    }),
    {
      name: 'zeviqo-save',
      partialize: (state) => ({
        profile: state.profile, onboardingComplete: state.onboardingComplete,
        questProgress: state.questProgress, achievementProgress: state.achievementProgress,
        dailyReward: state.dailyReward, stats: state.stats,
        lastWalkDate: state.lastWalkDate, walkingStreak: state.walkingStreak,
        generatedAdventures: state.generatedAdventures,
        adventureHistory: state.adventureHistory,
        recentAdventureTypes: state.recentAdventureTypes,
      }),
    },
  ),
);
