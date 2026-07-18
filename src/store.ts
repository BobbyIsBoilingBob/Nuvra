import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Adventure } from './data';
import { supabase } from './lib/supabase';
import type { QuestProgressRow, OwnedItemRow, AdventureHistoryRow } from './lib/supabase';

export type Screen =
  | 'home' | 'adventures' | 'adventure-detail' | 'adventure-map'
  | 'quests' | 'achievements' | 'daily-rewards' | 'profile'
  | 'challenges' | 'community' | 'friends' | 'party' | 'shop' | 'settings' | 'history'
  | 'ai-generator' | 'adventure-preview' | 'creator' | 'customise' | 'inventory' | 'rewards' | 'seasonal' | 'onboarding';

type StoreState = {
  currentScreen: Screen; previousScreen: Screen | null;
  selectedAdventureId: string | null; selectedAdventureObj: Adventure | null;
  setScreen: (s: Screen) => void; goBack: () => void;
  setSelectedAdventure: (id: string) => void; setSelectedAdventureObj: (a: Adventure) => void;

  questProgress: Record<string, number>; claimedQuests: string[];
  setQuestProgress: (metric: string, value: number) => void;
  addQuestProgress: (metric: string, amount: number) => void;
  claimQuest: (questId: string) => void;
  syncQuestProgressFromDb: (rows: QuestProgressRow[]) => void;

  ownedItems: string[]; equippedItems: Record<string, string>;
  buyItem: (itemId: string) => boolean;
  equipItem: (category: string, itemId: string) => void;
  syncOwnedItemsFromDb: (rows: OwnedItemRow[]) => void;

  history: AdventureHistoryRow[];
  recordAdventureComplete: (entry: Omit<AdventureHistoryRow, 'id' | 'user_id' | 'completed_at' | 'is_favorite'>) => Promise<void>;
  syncHistoryFromDb: (rows: AdventureHistoryRow[]) => void;
  toggleHistoryFavorite: (id: string, userId: string) => Promise<void>;

  favoriteAdventures: string[];
  toggleFavoriteAdventure: (adventureId: string) => void;

  completedChallenges: string[];
  recordChallengeComplete: (challengeId: string) => void;

  lastDailyRewardDay: number | null; lastDailyRewardDate: string | null; dailyRewardStreak: number;
  claimDailyReward: (day: number) => void;
  resetLocalState: () => void;
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentScreen: 'home', previousScreen: null, selectedAdventureId: null, selectedAdventureObj: null,
      setScreen: (s) => set((state) => ({ previousScreen: state.currentScreen, currentScreen: s })),
      goBack: () => set((state) => ({ currentScreen: state.previousScreen ?? 'home', previousScreen: null })),
      setSelectedAdventure: (id) => set({ selectedAdventureId: id }),
      setSelectedAdventureObj: (a) => set({ selectedAdventureObj: a }),

      questProgress: {}, claimedQuests: [],
      setQuestProgress: (metric, value) => set((state) => ({ questProgress: { ...state.questProgress, [metric]: value } })),
      addQuestProgress: (metric, amount) => set((state) => ({ questProgress: { ...state.questProgress, [metric]: (state.questProgress[metric] ?? 0) + amount } })),
      claimQuest: (questId) => set((state) => ({ claimedQuests: state.claimedQuests.includes(questId) ? state.claimedQuests : [...state.claimedQuests, questId] })),
      syncQuestProgressFromDb: (rows) => {
        const progress: Record<string, number> = {}; const claimed: string[] = [];
        for (const row of rows) { progress[row.quest_id] = row.progress; if (row.claimed) claimed.push(row.quest_id); }
        set((state) => ({ questProgress: { ...progress, ...state.questProgress }, claimedQuests: [...new Set([...claimed, ...state.claimedQuests])] }));
      },

      ownedItems: [], equippedItems: {},
      buyItem: (itemId) => { const state = get(); if (state.ownedItems.includes(itemId)) return false; set({ ownedItems: [...state.ownedItems, itemId] }); return true; },
      equipItem: (category, itemId) => set((state) => ({ equippedItems: { ...state.equippedItems, [category]: itemId } })),
      syncOwnedItemsFromDb: (rows) => {
        const owned = rows.map(r => r.item_id); const equipped: Record<string, string> = {};
        for (const r of rows) { if (r.equipped) equipped[r.item_id] = r.item_id; }
        set((state) => ({ ownedItems: [...new Set([...owned, ...state.ownedItems])], equippedItems: { ...equipped, ...state.equippedItems } }));
      },

      history: [],
      recordAdventureComplete: async (entry) => {
        const { data, error } = await supabase.from('adventure_history').insert({
          adventure_id: entry.adventure_id, adventure_name: entry.adventure_name, emoji: entry.emoji,
          type: entry.type, difficulty: entry.difficulty, distance: entry.distance, duration: entry.duration,
          xp_earned: entry.xp_earned, coins_earned: entry.coins_earned, gems_earned: entry.gems_earned,
          treasures_found: entry.treasures_found, max_combo: entry.max_combo,
        }).select().maybeSingle();
        if (!error && data) set((state) => ({ history: [data as AdventureHistoryRow, ...state.history].slice(0, 100) }));
      },
      syncHistoryFromDb: (rows) => set({ history: rows }),
      toggleHistoryFavorite: async (id, userId) => {
        const item = get().history.find(h => h.id === id); if (!item) return;
        const newVal = !item.is_favorite;
        set((state) => ({ history: state.history.map(h => h.id === id ? { ...h, is_favorite: newVal } : h) }));
        await supabase.from('adventure_history').update({ is_favorite: newVal }).eq('id', id).eq('user_id', userId);
      },

      favoriteAdventures: [],
      toggleFavoriteAdventure: (adventureId) => set((state) => {
        const has = state.favoriteAdventures.includes(adventureId);
        return { favoriteAdventures: has ? state.favoriteAdventures.filter(a => a !== adventureId) : [...state.favoriteAdventures, adventureId] };
      }),

      completedChallenges: [],
      recordChallengeComplete: (challengeId) => set((state) => ({ completedChallenges: state.completedChallenges.includes(challengeId) ? state.completedChallenges : [...state.completedChallenges, challengeId] })),

      lastDailyRewardDay: null, lastDailyRewardDate: null, dailyRewardStreak: 0,
      claimDailyReward: (day) => set((state) => {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const lastDate = state.lastDailyRewardDate;
        const newStreak = lastDate === today ? state.dailyRewardStreak : lastDate === yesterday ? state.dailyRewardStreak + 1 : 1;
        return { lastDailyRewardDay: day, lastDailyRewardDate: today, dailyRewardStreak: newStreak };
      }),

      resetLocalState: () => set({
        history: [], favoriteAdventures: [], completedChallenges: [], claimedQuests: [],
        questProgress: {}, ownedItems: [], equippedItems: {},
        lastDailyRewardDay: null, lastDailyRewardDate: null, dailyRewardStreak: 0, currentScreen: 'home',
      }),
    }),
    { name: 'zeviqo-store' },
  ),
);
