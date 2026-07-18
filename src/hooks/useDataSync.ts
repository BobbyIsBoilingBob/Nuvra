import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';

export function useDataSync() {
  const { session } = useAuth();
  const uid = session?.user?.id;
  const { updateQuest, addHistory, ownedItems, buyItem } = useStore();

  useEffect(() => {
    if (!uid) return;
    (async () => {
      const { data: quests } = await supabase.from('quest_progress').select('*').eq('user_id', uid);
      if (quests) for (const q of quests as any[]) updateQuest(q.quest_id, q.progress, q.completed);

      const { data: items } = await supabase.from('owned_items').select('*').eq('user_id', uid);
      if (items) for (const item of items as any[]) if (!ownedItems.includes(item.item_id)) buyItem(item.item_id);

      const { data: history } = await supabase.from('adventure_history').select('*').eq('user_id', uid).order('completed_at', { ascending: true });
      if (history) for (const h of history as any[]) addHistory({
        id: h.id, adventureName: h.adventure_name, distance: h.distance, duration: h.duration, xp: h.xp, rating: h.rating, completedAt: h.completed_at,
      });
    })();
  }, [uid]);
}
