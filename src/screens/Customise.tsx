import { useState } from 'react';
import { Icon, GlassCard, Button, RarityBadge, RarityBorder, AvatarDisplay } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { COSMETIC_ITEMS, type CosmeticSlot, TRAILS, PETS, COSMETIC_RARITY_MAP } from '../cosmetics';

type Tab = 'avatar' | 'trails' | 'pets';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'avatar', label: 'Avatar', icon: 'Shirt' },
  { id: 'trails', label: 'Trails', icon: 'Sparkles' },
  { id: 'pets', label: 'Pets', icon: 'Cat' },
];

const SLOT_LABELS: Record<CosmeticSlot, string> = {
  hairstyle: 'Hairstyle',
  hairColor: 'Hair Color',
  skinTone: 'Skin Tone',
  eyes: 'Eyes',
  facial: 'Facial',
  shirt: 'Shirt',
  jacket: 'Jacket',
  pants: 'Pants',
  shorts: 'Shorts',
  shoes: 'Shoes',
  hat: 'Hat',
  glasses: 'Glasses',
  backpack: 'Backpack',
};

const SLOTS: CosmeticSlot[] = [
  'hairstyle', 'hairColor', 'skinTone', 'eyes', 'facial',
  'shirt', 'jacket', 'pants', 'shorts', 'shoes', 'hat', 'glasses', 'backpack',
];

export function Customise(): React.ReactElement {
  const { profile, equipTrail, equipPet, isOwned } = useStore();
  const [tab, setTab] = useState<Tab>('avatar');
  const [activeSlot, setActiveSlot] = useState<CosmeticSlot>('hairstyle');

  const equippedTrail = TRAILS.find((t) => t.id === profile.equippedTrail) ?? null;
  const equippedPet = PETS.find((p) => p.id === profile.equippedPet) ?? null;

  const slotItems = COSMETIC_ITEMS.filter((i) => i.slot === activeSlot);

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg variant="cyber" accent="#40f5cb" />

      <div className="relative z-10">
        <TopBar showBack title="Customise" />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-5">
          {/* Live preview card */}
          <GlassCard className="p-5 flex flex-col items-center gap-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-nova-300">
              Live Preview
            </div>
            <div className="relative flex items-center justify-center w-full py-4">
              {/* Trail glow */}
              {equippedTrail && (
                <div
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full ${equippedTrail.animation}`}
                  style={{ boxShadow: `0 0 40px ${equippedTrail.color}40`, background: `radial-gradient(circle, ${equippedTrail.color}20, transparent 70%)` }}
                />
              )}
              <AvatarDisplay
                emoji={profile.avatar.emoji}
                color={profile.avatar.color}
                size={80}
                ring
              />
              {/* Pet bounce */}
              {equippedPet && (
                <div className="absolute -bottom-1 right-1/4 animate-pet-bounce text-3xl">
                  <span>{equippedPet.emoji}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {equippedTrail && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-white/[0.04] border-nova-500/30 text-nova-300">
                  <span>{equippedTrail.emoji}</span>
                  {equippedTrail.name}
                </span>
              )}
              {equippedPet && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border bg-white/[0.04] border-plasma-500/30 text-plasma-300">
                  <span>{equippedPet.emoji}</span>
                  {equippedPet.name}
                </span>
              )}
              {!equippedTrail && !equippedPet && (
                <span className="text-xs text-white/40 font-semibold">No trail or pet equipped</span>
              )}
            </div>
          </GlassCard>

          {/* Tab switcher */}
          <div className="flex gap-2">
            {TABS.map((t) => {
              const isActive = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-nova-400 to-cyan-400 text-ink-950 shadow-glow'
                      : 'glass text-white/60 hover:text-white hover:bg-white/[0.1]'
                  }`}
                >
                  <Icon name={t.icon} size={16} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Avatar tab */}
          {tab === 'avatar' && (
            <div className="flex flex-col gap-4">
              {/* Slot selector */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {SLOTS.map((slot) => {
                  const isActive = activeSlot === slot;
                  return (
                    <button
                      key={slot}
                      onClick={() => setActiveSlot(slot)}
                      className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-nova-400 to-cyan-400 text-ink-950 shadow-glow'
                          : 'glass text-white/60 hover:text-white'
                      }`}
                    >
                      {SLOT_LABELS[slot]}
                    </button>
                  );
                })}
              </div>

              {/* Item grid */}
              <div className="grid grid-cols-3 gap-3">
                {slotItems.map((item) => {
                  const owned = isOwned(item.id);
                  const meta = COSMETIC_RARITY_MAP[item.rarity];
                  return (
                    <RarityBorder key={item.id} rarity={item.rarity} className="overflow-hidden">
                      <div className="p-3 flex flex-col items-center gap-2 bg-ink-900/60">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.accent} flex items-center justify-center text-2xl`}>
                          <span>{item.emoji}</span>
                        </div>
                        <div className="text-xs font-bold text-white text-center leading-tight">{item.name}</div>
                        <RarityBadge rarity={item.rarity} size="sm" showLabel={false} />
                        {owned ? (
                          <div className="w-full text-center py-1.5 text-xs font-bold text-nova-300 bg-nova-500/10 rounded-lg">
                            Owned
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            fullWidth
                            disabled
                          >
                            {item.currency === 'gems' ? `${item.price}💎` : `${item.price}🪙`}
                          </Button>
                        )}
                      </div>
                    </RarityBorder>
                  );
                })}
              </div>
            </div>
          )}

          {/* Trails tab */}
          {tab === 'trails' && (
            <div className="grid grid-cols-2 gap-3">
              {TRAILS.map((trail) => {
                const owned = isOwned(trail.id);
                const equipped = profile.equippedTrail === trail.id;
                return (
                  <RarityBorder key={trail.id} rarity={trail.rarity} active={equipped} className="overflow-hidden">
                    <div className="p-4 flex flex-col items-center gap-2 bg-ink-900/60">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${trail.accent} flex items-center justify-center text-3xl ${trail.animation}`}>
                        <span>{trail.emoji}</span>
                      </div>
                      <div className="text-sm font-bold text-white text-center">{trail.name}</div>
                      <div className="text-[10px] text-white/50 text-center leading-tight">{trail.desc}</div>
                      <RarityBadge rarity={trail.rarity} size="sm" />
                      {owned ? (
                        equipped ? (
                          <Button size="sm" variant="ghost" fullWidth onClick={() => equipTrail('')}>
                            Unequip
                          </Button>
                        ) : (
                          <Button size="sm" variant="primary" fullWidth onClick={() => equipTrail(trail.id)}>
                            Equip
                          </Button>
                        )
                      ) : (
                        <Button size="sm" variant="ghost" fullWidth disabled>
                          {trail.currency === 'gems' ? `${trail.price}💎` : `${trail.price}🪙`}
                        </Button>
                      )}
                    </div>
                  </RarityBorder>
                );
              })}
            </div>
          )}

          {/* Pets tab */}
          {tab === 'pets' && (
            <div className="grid grid-cols-2 gap-3">
              {PETS.map((pet) => {
                const owned = isOwned(pet.id);
                const equipped = profile.equippedPet === pet.id;
                return (
                  <RarityBorder key={pet.id} rarity={pet.rarity} active={equipped} className="overflow-hidden">
                    <div className="p-4 flex flex-col items-center gap-2 bg-ink-900/60">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pet.accent} flex items-center justify-center text-3xl animate-pet-bounce`}>
                        <span>{pet.emoji}</span>
                      </div>
                      <div className="text-sm font-bold text-white text-center">{pet.name}</div>
                      <div className="text-[10px] text-nova-300 font-semibold text-center">{pet.personality}</div>
                      <RarityBadge rarity={pet.rarity} size="sm" />
                      {owned ? (
                        equipped ? (
                          <Button size="sm" variant="ghost" fullWidth onClick={() => equipPet('')}>
                            Unequip
                          </Button>
                        ) : (
                          <Button size="sm" variant="primary" fullWidth onClick={() => equipPet(pet.id)}>
                            Equip
                          </Button>
                        )
                      ) : (
                        <Button size="sm" variant="ghost" fullWidth disabled>
                          {pet.currency === 'gems' ? `${pet.price}💎` : `${pet.price}🪙`}
                        </Button>
                      )}
                    </div>
                  </RarityBorder>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
