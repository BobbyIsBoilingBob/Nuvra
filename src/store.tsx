// ============================================================
// Nuvra Global State — StoreContext + useStore hook
// ============================================================

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from 'react';
import {
  type Screen,
  type Profile,
  DEFAULT_PROFILE,
  type Adventure,
  type AdventurePreferences,
  type ActiveMysteryEvent,
  type AccessibilitySettings,
  DEFAULT_ACCESSIBILITY,
  type NotificationSettings,
  DEFAULT_NOTIFICATIONS,
  type PrivacySettings,
  DEFAULT_PRIVACY,
  DAILY_MISSIONS,
  type DailyMission,
  type Achievement,
  ACHIEVEMENTS,
} from './data';
import {
  type OwnedItem,
  type InventoryCategory,
  type CosmeticRarity,
} from './cosmetics';

// --- Toast & Celebration State ---
export interface ToastState {
  visible: boolean;
  message: string;
  icon: string;
  color: string;
}

export interface CelebrationState {
  visible: boolean;
  itemName: string;
  itemEmoji: string;
  rarity: CosmeticRarity;
  subtitle: string;
}

// --- Store Context Type ---
export interface StoreContextType {
  // Navigation
  screen: Screen;
  setScreen: (s: Screen) => void;
  prevScreen: Screen | null;

  // Profile
  profile: Profile;
  setProfile: Dispatch<SetStateAction<Profile>>;
  updateProfile: (patch: Partial<Profile>) => void;

  // Adventures
  adventures: Adventure[];
  selectedAdventure: Adventure | null;
  setSelectedAdventure: (a: Adventure | null) => void;
  addAdventure: (a: Adventure) => void;

  // AI prefs
  aiPrefs: AdventurePreferences;
  setAiPrefs: Dispatch<SetStateAction<AdventurePreferences>>;

  // Phase 7
  combo: number;
  setCombo: Dispatch<SetStateAction<number>>;
  resetCombo: () => void;
  activeMystery: ActiveMysteryEvent | null;
  setActiveMystery: (m: ActiveMysteryEvent | null) => void;

  // Accessibility
  accessibility: AccessibilitySettings;
  setAccessibility: Dispatch<SetStateAction<AccessibilitySettings>>;

  // Encouragement toast
  encouragement: ToastState;
  showEncouragement: (message: string, icon: string, color: string) => void;

  // Phase 9 — inventory
  ownedItems: OwnedItem[];
  unlockItem: (id: string, category: InventoryCategory) => void;
  toggleFavourite: (id: string) => void;
  isOwned: (id: string) => boolean;

  // Phase 9 — equip
  equipTrail: (id: string | null) => void;
  equipPet: (id: string | null) => void;
  equipTheme: (id: string | null) => void;
  toggleSticker: (id: string) => void;
  toggleBadge: (id: string) => void;

  // Phase 9 — currencies
  addCoins: (n: number) => void;
  addGems: (n: number) => void;
  addXP: (n: number) => void;
  spendCoins: (n: number) => boolean;
  spendGems: (n: number) => boolean;

  // Phase 9 — daily
  claimDailyReward: () => void;
  canClaimDaily: boolean;

  // Phase 9 — celebration
  celebration: CelebrationState;
  showCelebration: (itemName: string, itemEmoji: string, rarity: CosmeticRarity, subtitle: string) => void;
  hideCelebration: () => void;

  // Phase 10 — settings
  notifications: NotificationSettings;
  setNotifications: Dispatch<SetStateAction<NotificationSettings>>;
  privacy: PrivacySettings;
  setPrivacy: Dispatch<SetStateAction<PrivacySettings>>;

  // Missions & achievements
  missions: DailyMission[];
  achievements: Achievement[];
}

const StoreContext = createContext<StoreContextType | null>(null);

// --- Default owned items (all avatar category) ---
const DEFAULT_OWNED_ITEMS: OwnedItem[] = [
  { id: 'hair1', category: 'avatar', unlockedAt: Date.now(), favourite: false },
  { id: 'hc1', category: 'avatar', unlockedAt: Date.now(), favourite: false },
  { id: 'sk1', category: 'avatar', unlockedAt: Date.now(), favourite: false },
  { id: 'eye1', category: 'avatar', unlockedAt: Date.now(), favourite: false },
  { id: 'fac1', category: 'avatar', unlockedAt: Date.now(), favourite: false },
  { id: 'sh1', category: 'avatar', unlockedAt: Date.now(), favourite: false },
  { id: 'pn1', category: 'avatar', unlockedAt: Date.now(), favourite: false },
  { id: 'sho1', category: 'avatar', unlockedAt: Date.now(), favourite: false },
];

// --- Helpers ---
function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

// --- Provider ---
export function StoreProvider({ children }: { children: ReactNode }) {
  // Navigation
  const [screen, setScreenState] = useState<Screen>('landing');
  const [prevScreen, setPrevScreen] = useState<Screen | null>(null);

  // Profile
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  // Adventures
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [selectedAdventure, setSelectedAdventure] = useState<Adventure | null>(null);

  // AI prefs
  const [aiPrefs, setAiPrefs] = useState<AdventurePreferences>({
    length: '20-30',
    style: 'explorer',
    difficulty: 'Easy',
    rewardPriority: 'balanced',
  });

  // Phase 7
  const [combo, setComboState] = useState<number>(0);
  const [activeMystery, setActiveMystery] = useState<ActiveMysteryEvent | null>(null);

  // Accessibility
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(DEFAULT_ACCESSIBILITY);

  // Encouragement toast
  const [encouragement, setEncouragement] = useState<ToastState>({
    visible: false,
    message: '',
    icon: '',
    color: '',
  });

  // Phase 9 — inventory
  const [ownedItems, setOwnedItems] = useState<OwnedItem[]>(DEFAULT_OWNED_ITEMS);

  // Phase 9 — celebration
  const [celebration, setCelebration] = useState<CelebrationState>({
    visible: false,
    itemName: '',
    itemEmoji: '',
    rarity: 'common',
    subtitle: '',
  });

  // Phase 10 — settings
  const [notifications, setNotifications] = useState<NotificationSettings>(DEFAULT_NOTIFICATIONS);
  const [privacy, setPrivacy] = useState<PrivacySettings>(DEFAULT_PRIVACY);

  // Missions & achievements
  const [missions] = useState<DailyMission[]>(DAILY_MISSIONS);
  const [achievements] = useState<Achievement[]>(ACHIEVEMENTS);

  // --- Navigation ---
  const setScreen = useCallback((s: Screen) => {
    setScreenState((prev) => {
      setPrevScreen(prev);
      return s;
    });
  }, []);

  // --- Profile helpers ---
  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setProfile((p) => ({ ...p, ...patch }));
  }, []);

  // --- Adventures ---
  const addAdventure = useCallback((a: Adventure) => {
    setAdventures((prev) => [...prev, a]);
  }, []);

  // --- Combo ---
  const setCombo = useCallback<Dispatch<SetStateAction<number>>>((updater) => {
    setComboState(updater);
  }, []);

  const resetCombo = useCallback(() => {
    setComboState(0);
  }, []);

  // --- Encouragement toast ---
  const showEncouragement = useCallback((message: string, icon: string, color: string) => {
    setEncouragement({ visible: true, message, icon, color });
    window.setTimeout(() => {
      setEncouragement((prev) => ({ ...prev, visible: false }));
    }, 2500);
  }, []);

  // --- Phase 9 — inventory ---
  const unlockItem = useCallback((id: string, category: InventoryCategory) => {
    setOwnedItems((prev) => {
      if (prev.some((item) => item.id === id)) return prev;
      return [...prev, { id, category, unlockedAt: Date.now(), favourite: false }];
    });
  }, []);

  const toggleFavourite = useCallback((id: string) => {
    setOwnedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, favourite: !item.favourite } : item,
      ),
    );
  }, []);

  const isOwned = useCallback(
    (id: string) => ownedItems.some((item) => item.id === id),
    [ownedItems],
  );

  // --- Phase 9 — equip ---
  const equipTrail = useCallback((id: string | null) => {
    updateProfile({ equippedTrail: id });
  }, [updateProfile]);

  const equipPet = useCallback((id: string | null) => {
    updateProfile({ equippedPet: id });
  }, [updateProfile]);

  const equipTheme = useCallback((id: string | null) => {
    updateProfile({ equippedTheme: id });
  }, [updateProfile]);

  const toggleSticker = useCallback((id: string) => {
    setProfile((p) => {
      const has = p.equippedStickers.includes(id);
      return {
        ...p,
        equippedStickers: has
          ? p.equippedStickers.filter((s) => s !== id)
          : [...p.equippedStickers, id],
      };
    });
  }, []);

  const toggleBadge = useCallback((id: string) => {
    setProfile((p) => {
      const has = p.equippedBadges.includes(id);
      return {
        ...p,
        equippedBadges: has
          ? p.equippedBadges.filter((b) => b !== id)
          : [...p.equippedBadges, id],
      };
    });
  }, []);

  // --- Phase 9 — currencies ---
  const addCoins = useCallback((n: number) => {
    setProfile((p) => ({ ...p, coins: p.coins + n }));
  }, []);

  const addGems = useCallback((n: number) => {
    setProfile((p) => ({ ...p, gems: p.gems + n }));
  }, []);

  const addXP = useCallback((n: number) => {
    setProfile((p) => ({ ...p, xp: p.xp + n }));
  }, []);

  const spendCoins = useCallback((n: number): boolean => {
    if (profile.coins < n) return false;
    setProfile((p) => (p.coins < n ? p : { ...p, coins: p.coins - n }));
    return true;
  }, [profile.coins]);

  const spendGems = useCallback((n: number): boolean => {
    if (profile.gems < n) return false;
    setProfile((p) => (p.gems < n ? p : { ...p, gems: p.gems - n }));
    return true;
  }, [profile.gems]);

  // --- Phase 9 — daily ---
  const canClaimDaily = profile.lastDailyClaim !== todayString();

  const claimDailyReward = useCallback(() => {
    const today = todayString();
    if (profile.lastDailyClaim === today) return;
    const newStreak = profile.dailyStreak + 1;
    const reward = 100 + newStreak * 20;
    setProfile((p) => ({
      ...p,
      coins: p.coins + reward,
      dailyStreak: newStreak,
      lastDailyClaim: today,
    }));
    showEncouragement(`Daily reward claimed! +${reward} coins`, 'Gift', '#fbbf24');
  }, [profile.lastDailyClaim, profile.dailyStreak, showEncouragement]);

  // --- Phase 9 — celebration ---
  const showCelebration = useCallback(
    (itemName: string, itemEmoji: string, rarity: CosmeticRarity, subtitle: string) => {
      setCelebration({ visible: true, itemName, itemEmoji, rarity, subtitle });
      window.setTimeout(() => {
        setCelebration((prev) => ({ ...prev, visible: false }));
      }, 3500);
    },
    [],
  );

  const hideCelebration = useCallback(() => {
    setCelebration((prev) => ({ ...prev, visible: false }));
  }, []);

  const value: StoreContextType = {
    screen,
    setScreen,
    prevScreen,
    profile,
    setProfile,
    updateProfile,
    adventures,
    selectedAdventure,
    setSelectedAdventure,
    addAdventure,
    aiPrefs,
    setAiPrefs,
    combo,
    setCombo,
    resetCombo,
    activeMystery,
    setActiveMystery,
    accessibility,
    setAccessibility,
    encouragement,
    showEncouragement,
    ownedItems,
    unlockItem,
    toggleFavourite,
    isOwned,
    equipTrail,
    equipPet,
    equipTheme,
    toggleSticker,
    toggleBadge,
    addCoins,
    addGems,
    addXP,
    spendCoins,
    spendGems,
    claimDailyReward,
    canClaimDaily,
    celebration,
    showCelebration,
    hideCelebration,
    notifications,
    setNotifications,
    privacy,
    setPrivacy,
    missions,
    achievements,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

// --- Hook ---
export function useStore(): StoreContextType {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
}
