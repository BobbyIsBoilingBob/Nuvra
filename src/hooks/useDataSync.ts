import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import { useStore } from '../store';
import { QUESTS } from '../data';

export function useDataSync() {
  const { user } = useAuth();
  const store = useStore();
  const syncedRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load all persisted data from DB on mount
  useEffect(() => {
    if (!user || syncedRef.current) return;
    syncedRef.current = true;

    (async () => {
      // Load quest progress
      const { data: qpRows } = await supabase.from('quest_progress').select('*').eq('user_id', user.id);
      if (qpRows) {
        const progress: Record<string, number> = {};
        const claimed: string[] = [];
        for (const row of qpRows as any[]) {
          // Map quest_id back to metric
          const quest = QUESTS.find(q => q.id === row.quest_id);
          if (quest) {
            progress[quest.metric] = Math.max(progress[quest.metric] ?? 0, row.progress);
            if (row.claimed) claimed.push(quest.id);
          }
        }
        // Merge with local state (take max)
        const merged = { ...progress, ...store.questProgress };
        for (const k in merged) {
          merged[k] = Math.max(progress[k] ?? 0, store.questProgress[k] ?? 0);
        }
        store.setQuestProgress('__merge__', 0); // trigger
        // Use the store's internal set
        useStore.setState({ questProgress: merged, claimedQuests: [...new Set([...claimed, ...store.claimedQuests])] });
      }

      // Load owned items
      const { data: oiRows } = await supabase.from('owned_items').select('*').eq('user_id', user.id);
      if (oiRows) {
        store.syncOwnedItemsFromDb(oiRows as any[]);
      }

      // Load adventure history
      const { data: ahRows } = await supabase.from('adventure_history').select('*').eq('user_id', user.id).order('completed_at', { ascending: false }).limit(100);
      if (ahRows) {
        store.syncHistoryFromDb(ahRows as any[]);
      }
    })();
  }, [user]);

  // Debounced sync of quest progress to DB
  const syncQuestProgress = useCallback(() => {
    if (!user) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const { questProgress, claimedQuests } = useStore.getState();
      for (const quest of QUESTS) {
        const progress = questProgress[quest.metric] ?? 0;
        const claimed = claimedQuests.includes(quest.id);
        await supabase.from('quest_progress').upsert({
          user_id: user.id, quest_id: quest.id, progress, claimed, updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,quest_id' });
      }
    }, 2000);
  }, [user]);

  // Watch for quest progress changes and sync
  useEffect(() => {
    if (!user) return;
    syncQuestProgress();
  }, [store.questProgress, store.claimedQuests, syncQuestProgress, user]);

  // Sync owned items to DB whenever they change
  const lastOwnedSync = useRef<string>('');
  useEffect(() => {
    if (!user) return;
    const ownedKey = store.ownedItems.join(',') + '|' + Object.entries(store.equippedItems).map(([k, v]) => `${k}:${v}`).join(',');
    if (ownedKey === lastOwnedSync.current) return;
    lastOwnedSync.current = ownedKey;
    (async () => {
      for (const itemId of store.ownedItems) {
        const isEquipped = !!store.equippedItems[itemId];
        await supabase.from('owned_items').upsert({
          user_id: user.id, item_id: itemId, equipped: isEquipped,
        }, { onConflict: 'user_id,item_id' });
      }
    })();
  }, [store.ownedItems, store.equippedItems, user]);

  // Cleanup
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, []);
}
