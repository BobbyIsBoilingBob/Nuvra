import { useEffect, useCallback } from 'react';
import { supabase, type QuestProgressRow, type OwnedItemRow, type AdventureHistoryRow } from '../lib/supabase';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';

export function useDataSync() {
  const { user } = useAuth();
  const syncQuestProgressFromDb = useStore(s => s.syncQuestProgressFromDb);
  const syncOwnedItemsFromDb = useStore(s => s.syncOwnedItemsFromDb);
  const syncHistoryFromDb = useStore(s => s.syncHistoryFromDb);

  const loadAll = useCallback(async () => {
    if (!user) return;
    const [quests, items, history] = await Promise.all([
      supabase.from('quest_progress').select('*').eq('user_id', user.id),
      supabase.from('owned_items').select('*').eq('user_id', user.id),
      supabase.from('adventure_history').select('*').eq('user_id', user.id).order('completed_at', { ascending: false }).limit(100),
    ]);

    if (quests.data) syncQuestProgressFromDb(quests.data as QuestProgressRow[]);
    if (items.data) syncOwnedItemsFromDb(items.data as OwnedItemRow[]);
    if (history.data) syncHistoryFromDb(history.data as AdventureHistoryRow[]);
  }, [user, syncQuestProgressFromDb, syncOwnedItemsFromDb, syncHistoryFromDb]);

  useEffect(() => {
    if (!user) return;
    loadAll();
  }, [user, loadAll]);

  return { loadAll };
}
