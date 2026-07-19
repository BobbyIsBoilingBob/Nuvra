import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store';
import type { InventoryItem } from '../types';

type Row = { id: string; name: string; type: string; icon: string | null; quantity: number };

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const storeInventory = useStore((s) => s.inventory);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('inventory').select('*');
    if (error) { setItems(storeInventory); setError(null); setLoading(false); return; }
    setItems((data as Row[]).map((r) => ({ id: r.id, name: r.name, type: (r.type as any) ?? 'consumable', icon: r.icon ?? undefined, quantity: r.quantity })));
    setError(null); setLoading(false);
  }, [storeInventory]);

  useEffect(() => { load(); }, [load]);

  return { items, loading, error, reload: load };
}
