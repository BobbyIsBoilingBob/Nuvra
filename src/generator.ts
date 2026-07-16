// ============================================================
// Nuvra AI Adventure Generation Engine
// ============================================================

import {
  Adventure,
  AdventurePreferences,
  AdventureType,
  Difficulty,
  ADVENTURE_THEMES,
  AdventureTheme,
  CHALLENGES,
  buildAdventure,
  MapPoint,
  MapCheckpoint,
  MapTreasure,
  MapCoin,
  ChallengeZone,
  ChallengeZoneType,
  TreasureRarity,
  TREASURE_RARITIES,
  AdventureLength,
  AdventureStylePref,
  DifficultyPref,
  RewardPriority,
} from './data';

// --- Random helpers ---

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: readonly T[], n: number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  const count = Math.min(n, pool.length);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

// --- Preference mappers ---

function mapDifficulty(pref: DifficultyPref): Difficulty {
  switch (pref) {
    case 'Relaxed': return 'Easy';
    case 'Easy': return 'Easy';
    case 'Medium': return 'Medium';
    case 'Hard': return 'Hard';
    case 'Extreme': return 'Epic';
  }
}

function mapLength(pref: AdventureLength): { durationMin: number; distanceKm: number; pointCount: number } {
  switch (pref) {
    case '10-15': return { durationMin: 15, distanceKm: 0.8, pointCount: 5 };
    case '20-30': return { durationMin: 25, distanceKm: 1.8, pointCount: 6 };
    case '30-45': return { durationMin: 40, distanceKm: 2.8, pointCount: 7 };
    case '45-60': return { durationMin: 55, distanceKm: 4.0, pointCount: 8 };
    case '60+': return { durationMin: 75, distanceKm: 5.5, pointCount: 9 };
  }
}

function mapStyleToType(style: AdventureStylePref): AdventureType {
  switch (style) {
    case 'explorer': return 'explorer';
    case 'treasure_hunter': return 'treasure_hunt';
    case 'relaxed': return 'relaxed_walk';
    case 'fitness': return 'challenge_run';
    case 'story': return 'explorer';
    case 'challenge': return 'challenge_run';
  }
}

// --- Challenge selection ---

// Map a challenge-zone type to the challenge category it corresponds to.
function zoneTypeToChallengeCategory(zt: ChallengeZoneType): 'explorer' | 'collector' | 'adventure' {
  switch (zt) {
    case 'explorer': return 'explorer';
    case 'treasure': return 'collector';
    case 'speed':
    case 'endurance':
    case 'balance':
    case 'precision':
    case 'decision':
      return 'adventure';
  }
}

function selectChallenges(
  theme: AdventureTheme,
  difficulty: Difficulty,
  pointCount: number,
): string[] {
  // The theme's challengeTypes field holds ChallengeZoneType values at runtime
  // (even though the data file types it as ChallengeCategory[]). Cast accordingly.
  const zoneTypes = theme.challengeTypes as unknown as ChallengeZoneType[];
  const targetCategories = new Set<string>(zoneTypes.map(zoneTypeToChallengeCategory));

  // Pull challenge defs whose category overlaps with the theme's zone types.
  const pool = CHALLENGES.filter((c) => targetCategories.has(c.category));

  // Fallback to the full challenge list if the filtered pool is too small.
  const source = pool.length >= 2 ? pool : CHALLENGES;

  // Difficulty influences how many challenges we attach.
  const baseCount = Math.max(1, Math.floor(pointCount / 2));
  const diffBonus = difficulty === 'Epic' ? 2 : difficulty === 'Hard' ? 1 : 0;
  const count = Math.min(baseCount + diffBonus, source.length);

  return pickN(source, count).map((c) => c.id);
}

// --- Reward calculation ---

function calculateRewards(
  difficulty: Difficulty,
  length: AdventureLength,
  rewardPriority: RewardPriority,
  theme: AdventureTheme,
): { xpReward: number; coinReward: number } {
  const lengthMult: Record<AdventureLength, number> = {
    '10-15': 1,
    '20-30': 1.5,
    '30-45': 2.2,
    '45-60': 3,
    '60+': 4,
  };
  const diffMult: Record<Difficulty, number> = {
    Easy: 1,
    Medium: 1.4,
    Hard: 1.9,
    Epic: 2.5,
  };

  const base = 100 * lengthMult[length] * diffMult[difficulty];

  // Blend the user's reward priority with the theme's natural bias.
  const bias: RewardPriority = rewardPriority === 'balanced' ? theme.rewardBias : rewardPriority;

  let xpReward = base;
  let coinReward = base * 0.6;

  switch (bias) {
    case 'xp':
      xpReward = base * 1.5;
      coinReward = base * 0.5;
      break;
    case 'coins':
      xpReward = base * 0.7;
      coinReward = base * 1.4;
      break;
    case 'exploration':
      xpReward = base * 1.2;
      coinReward = base * 0.8;
      break;
    case 'rare_items':
      xpReward = base * 1.1;
      coinReward = base * 1.1;
      break;
    case 'balanced':
      xpReward = base * 1.15;
      coinReward = base * 0.85;
      break;
  }

  return {
    xpReward: Math.round(xpReward),
    coinReward: Math.round(coinReward),
  };
}

// --- Name & description generation ---

function generateName(theme: AdventureTheme): string {
  return `${pick(theme.namePrefixes)} ${pick(theme.nameSuffixes)}`;
}

function generateDescription(theme: AdventureTheme): string {
  return pick(theme.descTemplates);
}

// --- Route path generation (5-9 points, left-to-right wandering path) ---

function generateRoutePath(pointCount: number): MapPoint[] {
  const points: MapPoint[] = [];
  const startX = 8;
  const endX = 92;
  const step = (endX - startX) / (pointCount - 1);

  for (let i = 0; i < pointCount; i++) {
    const x = startX + step * i;
    // Alternate above/below the midline with decreasing amplitude toward the end.
    const baseY = 50;
    const amp = 30 * (1 - i / pointCount * 0.4);
    const wobble = Math.sin(i * 1.3) * amp + rand(-8, 8);
    const y = Math.max(10, Math.min(90, baseY + wobble));
    points.push({ x: Math.round(x), y: Math.round(y) });
  }
  return points;
}

// --- Checkpoint generation ---

const CHECKPOINT_LABELS: Record<MapCheckpoint['kind'], string[]> = {
  start: ['Trailhead', 'Starting Point', 'Base Camp', 'Departure'],
  challenge: ['Checkpoint', 'Test Point', 'Challenge Gate', 'Skill Point'],
  treasure: ['Hidden Cache', 'Treasure Spot', 'Loot Vault', 'Secret Stash'],
  finish: ['Summit', 'Final Point', 'Destination', 'Goal'],
};

function generateCheckpoints(routePath: MapPoint[], difficulty: Difficulty): MapCheckpoint[] {
  const n = routePath.length;
  const checkpoints: MapCheckpoint[] = [];

  // Start at first point, finish at last point, distribute challenge/treasure between.
  const rewardBase: Record<Difficulty, number> = { Easy: 100, Medium: 200, Hard: 300, Epic: 450 };

  checkpoints.push({
    id: 'cp1',
    label: pick(CHECKPOINT_LABELS.start),
    kind: 'start',
    x: routePath[0].x,
    y: routePath[0].y,
    reward: 0,
    done: false,
  });

  const interior = n - 2; // points between start and finish
  for (let i = 1; i <= interior; i++) {
    const kind: MapCheckpoint['kind'] = i % 2 === 1 ? 'challenge' : 'treasure';
    const labelPool = kind === 'challenge' ? CHECKPOINT_LABELS.challenge : CHECKPOINT_LABELS.treasure;
    checkpoints.push({
      id: `cp${i + 1}`,
      label: pick(labelPool),
      kind,
      x: routePath[i].x,
      y: routePath[i].y,
      reward: Math.round(rewardBase[difficulty] * (0.6 + i * 0.15)),
      done: false,
    });
  }

  checkpoints.push({
    id: `cp${n}`,
    label: pick(CHECKPOINT_LABELS.finish),
    kind: 'finish',
    x: routePath[n - 1].x,
    y: routePath[n - 1].y,
    reward: Math.round(rewardBase[difficulty] * 1.5),
    done: false,
  });

  return checkpoints;
}

// --- Treasure generation ---

function rollRarity(difficulty: Difficulty): TreasureRarity {
  const roll = Math.random();
  const legendaryChance = difficulty === 'Epic' ? 0.25 : difficulty === 'Hard' ? 0.15 : difficulty === 'Medium' ? 0.08 : 0.04;
  const epicChance = legendaryChance + (difficulty === 'Epic' ? 0.3 : difficulty === 'Hard' ? 0.25 : 0.18);
  const rareChance = epicChance + 0.3;

  if (roll < legendaryChance) return 'legendary';
  if (roll < epicChance) return 'epic';
  if (roll < rareChance) return 'rare';
  return 'common';
}

function generateTreasures(routePath: MapPoint[], difficulty: Difficulty): MapTreasure[] {
  // Place treasures at roughly every other interior point.
  const indices: number[] = [];
  for (let i = 1; i < routePath.length - 1; i++) {
    if (i % 2 === 1) indices.push(i);
  }
  if (indices.length === 0 && routePath.length > 2) indices.push(Math.floor(routePath.length / 2));

  const baseCoins: Record<Difficulty, number> = { Easy: 80, Medium: 150, Hard: 250, Epic: 400 };
  const baseXp: Record<Difficulty, number> = { Easy: 40, Medium: 80, Hard: 140, Epic: 220 };

  return indices.map((idx, i) => {
    const rarity = rollRarity(difficulty);
    const meta = TREASURE_RARITIES.find((r) => r.id === rarity)!;
    return {
      id: `t${i + 1}`,
      x: routePath[idx].x,
      y: routePath[idx].y,
      coins: Math.round(baseCoins[difficulty] * meta.coinMult),
      xp: Math.round(baseXp[difficulty] * meta.xpMult),
      opened: false,
      rarity,
    };
  });
}

// --- Coin generation ---

function generateCoins(routePath: MapPoint[], difficulty: Difficulty): MapCoin[] {
  const count = Math.max(2, Math.floor(routePath.length * 0.6) + (difficulty === 'Epic' ? 2 : 0));
  const coins: MapCoin[] = [];
  const used = new Set<string>();

  for (let i = 0; i < count; i++) {
    let x = Math.round(rand(15, 85));
    let y = Math.round(rand(15, 85));
    let key = `${x},${y}`;
    let attempts = 0;
    while (used.has(key) && attempts < 5) {
      x = Math.round(rand(15, 85));
      y = Math.round(rand(15, 85));
      key = `${x},${y}`;
      attempts++;
    }
    used.add(key);
    coins.push({ id: `co${i + 1}`, x, y, collected: false });
  }
  return coins;
}

// --- Zone generation ---

function generateZones(
  theme: AdventureTheme,
  routePath: MapPoint[],
  difficulty: Difficulty,
): ChallengeZone[] {
  // Use the theme's challenge types to pick zone types, placing a few along the route.
  const zoneTypes = theme.challengeTypes as unknown as ChallengeZoneType[];
  const zoneCount = Math.min(zoneTypes.length, difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : 3);

  const chosen = pickN(zoneTypes, zoneCount);
  const zones: ChallengeZone[] = [];
  const usedIndices = new Set<number>();

  chosen.forEach((type, i) => {
    // Pick an interior route point that hasn't been used for a zone.
    let idx = Math.floor(rand(1, routePath.length - 1));
    let attempts = 0;
    while (usedIndices.has(idx) && attempts < 5) {
      idx = Math.floor(rand(1, routePath.length - 1));
      attempts++;
    }
    usedIndices.add(idx);

    const base = routePath[idx];
    const meta = getZoneMeta(type);
    zones.push({
      id: `z${i + 1}`,
      type,
      label: meta.label,
      x: Math.round(base.x + rand(-6, 6)),
      y: Math.round(base.y + rand(-6, 6)),
      radius: Math.round(rand(8, 14)),
      icon: meta.icon,
      accent: meta.accent,
      color: meta.color,
    });
  });

  return zones;
}

// Inline lookup to avoid importing ZONE_META (keeps the import list to exactly what's requested).
function getZoneMeta(type: ChallengeZoneType): { label: string; icon: string; accent: string; color: string } {
  const map: Record<string, { label: string; icon: string; accent: string; color: string }> = {
    balance: { label: 'Balance Challenge', icon: 'Scale', accent: 'from-nova-400 to-nova-600', color: '#1fe3b0' },
    explorer: { label: 'Explorer Zone', icon: 'Compass', accent: 'from-cyan-300 to-nova-500', color: '#40f5cb' },
    treasure: { label: 'Treasure Zone', icon: 'Gem', accent: 'from-gold-400 to-ember-500', color: '#fbbf24' },
    speed: { label: 'Speed Zone', icon: 'Gauge', accent: 'from-ember-400 to-ember-600', color: '#fb923c' },
    precision: { label: 'Precision Zone', icon: 'Crosshair', accent: 'from-cyan-300 to-nova-400', color: '#22d3ee' },
    endurance: { label: 'Endurance Zone', icon: 'Activity', accent: 'from-ember-400 to-gold-500', color: '#f97316' },
    decision: { label: 'Decision Point', icon: 'GitFork', accent: 'from-plasma-400 to-nova-500', color: '#a78bfa' },
  };
  return map[type];
}

// --- Image selection ---

const THEME_IMAGE_POOL: Record<string, number[]> = {
  lost_explorer: [1366919, 2387873, 417074],
  hidden_treasure: [1010659, 847020, 326311],
  mountain_expedition: [1271619, 618833, 1761279],
  city_discovery: [1108101, 2412604, 37352],
  nature_escape: [1366919, 2406732, 37527],
  weekend_wanderer: [1036936, 2167397, 21787],
  sunset_journey: [1029604, 355448, 1287142],
  ancient_route: [1004584, 2157059, 1301256],
  urban_treasure_hunt: [1108101, 2412604, 37352],
  morning_sprint: [1029604, 2387873, 1366919],
};

function generateImage(themeId: string): string {
  const pool = THEME_IMAGE_POOL[themeId] ?? [1366919];
  const id = pick(pool);
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800`;
}

// --- ID generation ---

let advCounter = 0;
function generateId(prefix = 'ai'): string {
  advCounter += 1;
  return `${prefix}-${Date.now().toString(36)}-${advCounter}`;
}

// --- Core generation ---

export function generateAdventure(prefs: AdventurePreferences, themeId?: string): Adventure {
  const theme = themeId
    ? ADVENTURE_THEMES.find((t) => t.id === themeId) ?? pick(ADVENTURE_THEMES)
    : pick(ADVENTURE_THEMES);

  const difficulty = mapDifficulty(prefs.difficulty);
  const { durationMin, distanceKm, pointCount } = mapLength(prefs.length);
  const type = mapStyleToType(prefs.style);

  const routePath = generateRoutePath(pointCount);
  const challenges = selectChallenges(theme, difficulty, pointCount);
  const checkpoints = generateCheckpoints(routePath, difficulty);
  const treasures = generateTreasures(routePath, difficulty);
  const coins = generateCoins(routePath, difficulty);
  const zones = generateZones(theme, routePath, difficulty);
  const { xpReward, coinReward } = calculateRewards(difficulty, prefs.length, prefs.rewardPriority, theme);

  return buildAdventure({
    id: generateId(),
    name: generateName(theme),
    description: generateDescription(theme),
    type,
    difficulty,
    distanceKm,
    durationMin,
    xpReward,
    coinReward,
    accent: theme.accent,
    emoji: theme.emoji,
    image: generateImage(theme.id),
    challenges,
    routePath,
    checkpoints,
    treasures,
    coins,
    zones,
    themeId: theme.id,
    isAIGenerated: true,
    plays: 0,
    rating: 0,
  });
}

export function generateAdventureOptions(prefs: AdventurePreferences, count: number = 3): Adventure[] {
  const usedThemes = new Set<string>();
  const adventures: Adventure[] = [];

  for (let i = 0; i < count; i++) {
    // Try to pick a theme we haven't used yet.
    let theme = ADVENTURE_THEMES.find((t) => !usedThemes.has(t.id));
    if (!theme) {
      theme = pick(ADVENTURE_THEMES);
    }
    usedThemes.add(theme.id);
    adventures.push(generateAdventure(prefs, theme.id));
  }

  return adventures;
}

export function generateSeasonalAdventure(
  prefs: AdventurePreferences,
  seasonalThemeId: string,
): Adventure {
  const adventure = generateAdventure(prefs, seasonalThemeId);
  return {
    ...adventure,
    id: generateId('seasonal'),
    bonusMultiplier: 2,
    xpReward: Math.round(adventure.xpReward * 2),
    coinReward: Math.round(adventure.coinReward * 2),
  };
}
