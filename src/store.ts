import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { InventoryCategory } from './cosmetics';

export type ScreenName = 'auth' | 'home' | 'adventures' | 'adventureDetail' | 'adventureMap' | 'quests' | 'achievements' | 'dailyRewards' | 'profile' | 'challenges' | 'community' | 'friends' | 'party' | 'shop' | 'settings' | 'history' | 'aiGenerator' | 'adventurePreview' | 'creator' | 'customise' | 'inventory' | 'rewards' | 'seasonal' | 'onboarding';
export type HistoryEntry = { id: string; adventureName: string; distance: number; duration: number; xp: number; rating: number | null; completedAt: string };
export type QuestProgress = { [questId: string]: { progress: number; completed: boolean } };

type State = {
  screen: ScreenName; activeAdventureId: string | null; questProgress: QuestProgress;
  ownedItems: string[]; equipped: Partial<Record<InventoryCategory, string>>; history: HistoryEntry[];
  favorites: string[]; challengeProgress: Record<string, number>; dailyRewardClaimed: boolean;
  lastRewardDate: string | null; claimedAdventureIds: string[];
  setScreen: (s: ScreenName) => void; setActiveAdventure: (id: string | null) => void;
  updateQuest: (questId: string, progress: number, completed?: boolean) => void;
  buyItem: (itemId: string) => boolean; equipItem: (category: InventoryCategory, itemId: string) => void;
  addHistory: (entry: HistoryEntry) => void; toggleFavorite: (adventureId: string) => void;
  updateChallenge: (challengeId: string, progress: number) => void; claimDailyReward: () => void;
  markAdventureClaimed: (adventureId: string) => void; hasClaimedAdventure: (adventureId: string) => boolean;
  resetProgress: () => void;
};

export const useStore = create<State>()(persist((set, get) => ({
  screen: 'home', activeAdventureId: null, questProgress: {}, ownedItems: [], equipped: {}, history: [], favorites: [], challengeProgress: {}, dailyRewardClaimed: false, lastRewardDate: null, claimedAdventureIds: [],
  setScreen: (s) => set({ screen: s }),
  setActiveAdventure: (id) => set({ activeAdventureId: id }),
  updateQuest: (questId, progress, completed) => set((state) => ({ questProgress: { ...state.questProgress, [questId]: { progress, completed: completed ?? state.questProgress[questId]?.completed ?? false } } })),
  buyItem: (itemId) => { if (get().ownedItems.includes(itemId)) return false; set((state) => ({ ownedItems: [...state.ownedItems, itemId] })); return true; },
  equipItem: (category, itemId) => set((state) => ({ equipped: { ...state.equipped, [category]: itemId } })),
  addHistory: (entry) => set((state) => ({ history: [...state.history, entry] })),
  toggleFavorite: (adventureId) => set((state) => ({ favorites: state.favorites.includes(adventureId) ? state.favorites.filter((f) => f !== adventureId) : [...state.favorites, adventureId] })),
  updateChallenge: (challengeId, progress) => set((state) => ({ challengeProgress: { ...state.challengeProgress, [challengeId]: progress } })),
  claimDailyReward: () => set({ dailyRewardClaimed: true, lastRewardDate: new Date().toDateString() }),
  markAdventureClaimed: (adventureId) => set((state) => ({ claimedAdventureIds: state.claimedAdventureIds.includes(adventureId) ? state.claimedAdventureIds : [...state.claimedAdventureIds, adventureId] })),
  hasClaimedAdventure: (adventureId) => get().claimedAdventureIds.includes(adventureId),
  resetProgress: () => set({ questProgress: {}, history: [], challengeProgress: {}, dailyRewardClaimed: false, lastRewardDate: null, claimedAdventureIds: [] }),
}), { name: 'zeviqo-store' }));
