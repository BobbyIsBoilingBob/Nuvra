import { useState } from 'react';
import { useStore } from '../store';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Pill, RarityBadge, RarityBorder, SectionTitle } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { COSMETICS, RARITY_LABELS, type InventoryCategory } from '../cosmetics';

const CATEGORIES: { id: InventoryCategory | 'all'; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: 'Grid' },
  { id: 'trails', label: 'Trails', icon: 'Sparkles' },
  { id: 'pets', label: 'Pets', icon: 'Users' },
  { id: 'themes', label: 'Themes', icon: 'Palette' },
  { id: 'stickers', label: 'Stickers', icon: 'Star' },
  { id: 'badges', label: 'Badges', icon: 'Award' },
];

export function Inventory() {
  const { ownedItems } = useStore();
  const [category, setCategory] = useState<InventoryCategory | 'all'>('all');
  const owned = COSMETICS.filter(c => ownedItems.includes(c.id));
  const filtered = category === 'all' ? owned : owned.filter(c => c.category === category);

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg />
      <TopBar title="Inventory" showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCategory(c.id)} className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${category === c.id ? 'bg-gradient-to-r from-zeviqo-400 to-zeviqo-500 text-ink-950' : 'glass text-white/60'}`}><Icon name={c.icon} size={12} />{c.label}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <GlassCard className="p-6 text-center"><Icon name="Package" size={32} className="text-white/20 mx-auto mb-2" /><p className="text-sm text-white/40">No items in this category.</p><p className="text-xs text-white/30 mt-1">Visit the shop to buy items.</p></GlassCard>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map(item => (
              <RarityBorder key={item.id} rarity={item.rarity} className="p-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mx-auto mb-2" style={{ background: `${item.color}22` }}>{item.emoji}</div>
                <p className="text-xs font-bold text-white text-center">{item.name}</p>
                <p className="text-[10px] text-white/40 text-center mb-1">{item.description}</p>
                <div className="flex justify-center"><RarityBadge rarity={item.rarity} size="sm" /></div>
              </RarityBorder>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
