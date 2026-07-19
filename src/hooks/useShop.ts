import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store';
import { SHOP_ITEMS } from '../data/gameData';
import type { ShopItem } from '../types';

export function useShop() {
  const [items, setItems] = useState<ShopItem[]>(SHOP_ITEMS);
  const [owned, setOwned] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const coins = useStore((s) => s.coins);
  const spendCoins = useStore((s) => s.spendCoins);
  const addItem = useStore((s) => s.addItem);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('purchases').select('shop_item_id');
    if (error) { setOwned([]); setError(null); setLoading(false); return; }
    setOwned((data as { shop_item_id: string }[]).map((r) => r.shop_item_id));
    setError(null); setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const buy = useCallback(async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    if (!spendCoins(item.price)) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('purchases').insert({ shop_item_id: id, user_id: user.id });
      if (error) { addItem({ id: item.id, name: item.name, type: item.type, icon: item.icon, quantity: 1 }); }
    } else {
      addItem({ id: item.id, name: item.name, type: item.type, icon: item.icon, quantity: 1 });
    }
    setOwned((o) => [...o, id]);
  }, [items, spendCoins, addItem]);

  return { items, owned, loading, error, buy, coins };
}
