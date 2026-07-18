export type Quest = { id: string; title: string; description: string; xp: number; type: 'location' | 'distance' | 'discovery' | 'social'; target?: number };
export type Adventure = { id: string; name: string; description: string; theme: string; difficulty: 'easy' | 'medium' | 'hard' | 'epic'; estimatedMinutes: number; totalXp: number; emoji: string; color: string; quests: Quest[] };

export const ADVENTURES: Adventure[] = [
  { id: 'urban-explorer', name: 'Urban Explorer', description: 'Discover hidden gems in your city', theme: 'Urban', difficulty: 'easy', estimatedMinutes: 30, totalXp: 250, emoji: '🏙️', color: '#3b82f6', quests: [
    { id: 'q1', title: 'Visit a landmark', description: 'Walk to a nearby landmark', xp: 100, type: 'location' },
    { id: 'q2', title: 'Walk 500m', description: 'Cover 500 meters', xp: 75, type: 'distance', target: 500 },
    { id: 'q3', title: 'Find a park', description: 'Discover a green space', xp: 75, type: 'discovery' },
  ]},
  { id: 'nature-trail', name: 'Nature Trail', description: 'Connect with nature on a scenic walk', theme: 'Nature', difficulty: 'medium', estimatedMinutes: 45, totalXp: 400, emoji: '🌿', color: '#22c55e', quests: [
    { id: 'q1', title: 'Walk 1km', description: 'Cover 1 kilometer', xp: 150, type: 'distance', target: 1000 },
    { id: 'q2', title: 'Find a water feature', description: 'Discover a pond, stream, or fountain', xp: 125, type: 'discovery' },
    { id: 'q3', title: 'Reach a viewpoint', description: 'Walk to an elevated point', xp: 125, type: 'location' },
  ]},
  { id: 'treasure-hunt', name: 'Treasure Hunt', description: 'Follow clues to hidden treasure', theme: 'Mystery', difficulty: 'hard', estimatedMinutes: 60, totalXp: 600, emoji: '🗺️', color: '#f59e0b', quests: [
    { id: 'q1', title: 'Walk 1.5km', description: 'Cover 1.5 kilometers', xp: 200, type: 'distance', target: 1500 },
    { id: 'q2', title: 'Find 3 landmarks', description: 'Discover 3 notable locations', xp: 200, type: 'discovery', target: 3 },
    { id: 'q3', title: 'Reach the treasure spot', description: 'Walk to the final destination', xp: 200, type: 'location' },
  ]},
  { id: 'night-prowl', name: 'Night Prowl', description: 'A mysterious adventure after dark', theme: 'Night', difficulty: 'epic', estimatedMinutes: 50, totalXp: 750, emoji: '🌙', color: '#8b5cf6', quests: [
    { id: 'q1', title: 'Walk 2km', description: 'Cover 2 kilometers under the stars', xp: 250, type: 'distance', target: 2000 },
    { id: 'q2', title: 'Find 2 lit landmarks', description: 'Discover illuminated locations', xp: 250, type: 'discovery', target: 2 },
    { id: 'q3', title: 'Complete the circuit', description: 'Return to your starting point', xp: 250, type: 'location' },
  ]},
];

export const CHALLENGES = [
  { id: 'c1', title: 'Walk 5km this week', description: 'Cover 5 kilometers in 7 days', xp: 500, target: 5000, type: 'distance' as const },
  { id: 'c2', title: 'Complete 3 adventures', description: 'Finish 3 adventures', xp: 300, target: 3, type: 'adventures' as const },
  { id: 'c3', title: '10-day streak', description: 'Walk for 10 consecutive days', xp: 1000, target: 10, type: 'streak' as const },
];

export const LEVELS = Array.from({ length: 100 }, (_, i) => ({ level: i + 1, xpRequired: Math.floor(100 * Math.pow(1.15, i)) }));

export function getLevelForXp(xp: number) { let level = 1; for (const l of LEVELS) { if (xp >= l.xpRequired) level = l.level; else break; } return level; }
export function getComboTier(combo: number) { if (combo >= 10) return { name: 'Legendary', color: '#f59e0b', multiplier: 3 }; if (combo >= 5) return { name: 'Epic', color: '#a78bfa', multiplier: 2 }; if (combo >= 3) return { name: 'Great', color: '#3b82f6', multiplier: 1.5 }; return { name: 'Normal', color: '#64748b', multiplier: 1 }; }
export const DAILY_REWARDS = Array.from({ length: 7 }, (_, i) => ({ day: i + 1, coins: 100 + i * 50, gems: i === 6 ? 5 : 0 }));

export function generateAdventure(): Adventure {
  const themes = ['Forest', 'Coastal', 'Mountain', 'Desert', 'City'];
  const theme = themes[Math.floor(Math.random() * themes.length)];
  const emojis: Record<string, string> = { Forest: '🌲', Coastal: '🏖️', Mountain: '⛰️', Desert: '🏜️', City: '🏙️' };
  const colors: Record<string, string> = { Forest: '#22c55e', Coastal: '#06b6d4', Mountain: '#f59e0b', Desert: '#f97316', City: '#3b82f6' };
  return { id: `gen-${Date.now()}`, name: `${theme} Expedition`, description: `A procedurally generated ${theme.toLowerCase()} adventure`, theme, difficulty: 'medium', estimatedMinutes: 30 + Math.floor(Math.random() * 30), totalXp: 300 + Math.floor(Math.random() * 300), emoji: emojis[theme], color: colors[theme], quests: [
    { id: 'gq1', title: `Explore ${theme}`, description: `Walk through ${theme.toLowerCase()} terrain`, xp: 100, type: 'location' },
    { id: 'gq2', title: 'Walk 800m', description: 'Cover 800 meters', xp: 100, type: 'distance', target: 800 },
    { id: 'gq3', title: 'Discover a landmark', description: 'Find a notable spot', xp: 100, type: 'discovery' },
  ]};
}
