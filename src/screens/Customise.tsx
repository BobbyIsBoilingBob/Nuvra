import { useStore } from '../store';
import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Pill, RarityBadge, RarityBorder, AvatarDisplay, SectionTitle } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { COSMETICS, RARITY_COLORS, RARITY_LABELS, type InventoryCategory } from '../cosmetics';

export function Customise() {
  const { ownedItems } = useStore();
  const owned = COSMETICS.filter(c => ownedItems.includes(c.id));

  const trails = owned.filter(c => c.category === 'trails');
  const pets = owned.filter(c => c.category === 'pets');
  const themes = owned.filter(c => c.category === 'themes');

  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent="#fb923c" />
      <TopBar title="Customise" showBack showCurrencies={false} />
      <div className="relative z-10 px-4 pt-4 space-y-4">
        <GlassCard className="p-4 text-center">
          <AvatarDisplay emoji="🧭" color="#00c4ff" size={64} ring />
          <p className="text-sm font-bold text-white mt-2">Your Avatar</p>
          <p className="text-[10px] text-white/40">Customize your appearance with owned items</p>
        </GlassCard>

        {trails.length > 0 && (
          <GlassCard className="p-4">
            <SectionTitle icon="Sparkles">Trails</SectionTitle>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {trails.map(t => (
                <RarityBorder key={t.id} rarity={t.rarity} className="p-3 text-center">
                  <div className="text-2xl">{t.emoji}</div>
                  <p className="text-[10px] font-bold text-white mt-1">{t.name}</p>
                  <RarityBadge rarity={t.rarity} size="sm" showLabel={false} />
                </RarityBorder>
              ))}
            </div>
          </GlassCard>
        )}

        {pets.length > 0 && (
          <GlassCard className="p-4">
            <SectionTitle icon="Users">Pets</SectionTitle>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {pets.map(p => (
                <RarityBorder key={p.id} rarity={p.rarity} className="p-3 text-center">
                  <div className="text-2xl">{p.emoji}</div>
                  <p className="text-[10px] font-bold text-white mt-1">{p.name}</p>
                  <RarityBadge rarity={p.rarity} size="sm" showLabel={false} />
                </RarityBorder>
              ))}
            </div>
          </GlassCard>
        )}

        {themes.length > 0 && (
          <GlassCard className="p-4">
            <SectionTitle icon="Palette">Themes</SectionTitle>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {themes.map(t => (
                <RarityBorder key={t.id} rarity={t.rarity} className="p-3 text-center">
                  <div className="text-2xl">{t.emoji}</div>
                  <p className="text-[10px] font-bold text-white mt-1">{t.name}</p>
                  <RarityBadge rarity={t.rarity} size="sm" showLabel={false} />
                </RarityBorder>
              ))}
            </div>
          </GlassCard>
        )}

        {owned.length === 0 && (
          <GlassCard className="p-6 text-center">
            <Icon name="Package" size={32} className="text-white/20 mx-auto mb-2" />
            <p className="text-sm text-white/40">No items to customize.</p>
            <p className="text-xs text-white/30 mt-1">Visit the shop to get trails, pets, and themes.</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
