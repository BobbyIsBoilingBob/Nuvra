import type { Adventure, ShopItem, Achievement, DailyReward, Challenge } from '../types';

export const ADVENTURES: Adventure[] = [
  {
    id: 'adv-riverside',
    title: 'Riverside Ramble',
    description: 'A gentle stroll along the river, taking in the sights and sounds of the waterfront.',
    difficulty: 'easy',
    durationMin: 30,
    distanceKm: 2.5,
    startLat: 51.5074,
    startLng: -0.1278,
    imageUrl: 'https://images.pexels.com/photos/103871/pexels-photo-103871.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['nature', 'waterfront', 'beginner'],
    quests: [
      { id: 'q1', type: 'checkpoint', title: 'Reach the boathouse', description: 'Walk to the old boathouse by the pier.', lat: 51.508, lng: -0.128 },
      { id: 'q2', type: 'distance', title: 'Walk 2 km', description: 'Cover at least 2 km on foot.', target: 2000 },
      { id: 'q3', type: 'checkpoint', title: 'Find the willow tree', description: 'Locate the ancient willow at the bend.', lat: 51.509, lng: -0.13 },
    ],
    rewards: { xp: 150, coins: 80, items: ['river-badge'], achievements: ['first-steps'] },
  },
  {
    id: 'adv-urban',
    title: 'Urban Explorer',
    description: 'Discover hidden street art and historic landmarks across the city centre.',
    difficulty: 'medium',
    durationMin: 60,
    distanceKm: 5,
    startLat: 51.5074,
    startLng: -0.1278,
    imageUrl: 'https://images.pexels.com/photos/1486577/pexels-photo-1486577.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['city', 'art', 'landmarks'],
    quests: [
      { id: 'q1', type: 'checkpoint', title: 'Reach the mural', description: 'Find the giant mural on Bridge Street.', lat: 51.51, lng: -0.125 },
      { id: 'q2', type: 'distance', title: 'Walk 4 km', description: 'Cover at least 4 km.', target: 4000 },
      { id: 'q3', type: 'challenge', title: 'Photo challenge', description: 'Snap a photo of your favourite piece of street art.' },
    ],
    rewards: { xp: 300, coins: 150, items: ['urban-badge'], achievements: ['explorer'] },
  },
  {
    id: 'adv-forest',
    title: 'Forest Trail Trek',
    description: 'A challenging trek through ancient woodland with rewarding summit views.',
    difficulty: 'hard',
    durationMin: 120,
    distanceKm: 10,
    startLat: 51.5074,
    startLng: -0.1278,
    imageUrl: 'https://images.pexels.com/photos/12715946/pexels-photo-12715946.jpeg?auto=compress&cs=tinysrgb&w=800',
    tags: ['nature', 'hiking', 'summit'],
    quests: [
      { id: 'q1', type: 'checkpoint', title: 'Reach the trailhead', description: 'Start at the marked trailhead.', lat: 51.51, lng: -0.13 },
      { id: 'q2', type: 'distance', title: 'Walk 8 km', description: 'Cover at least 8 km of trail.', target: 8000 },
      { id: 'q3', type: 'checkpoint', title: 'Summit viewpoint', description: 'Reach the summit viewpoint.', lat: 51.515, lng: -0.135 },
      { id: 'q4', type: 'challenge', title: 'Wildlife spot', description: 'Spot and log three types of wildlife.' },
    ],
    rewards: { xp: 600, coins: 300, items: ['forest-badge', 'trail-compass'], achievements: ['trailblazer'] },
  },
];

export const SHOP_ITEMS: ShopItem[] = [
  { id: 'cosmetic-1', name: 'Neon Trail', description: 'Glowing neon route line on the map.', price: 200, type: 'cosmetic' },
  { id: 'cosmetic-2', name: 'Golden Avatar Frame', description: 'A shiny gold frame for your avatar.', price: 350, type: 'cosmetic' },
  { id: 'boost-1', name: 'XP Booster', description: 'Double XP for your next adventure.', price: 150, type: 'boost' },
  { id: 'boost-2', name: 'Coin Magnet', description: '1.5x coins on your next adventure.', price: 180, type: 'boost' },
  { id: 'consumable-1', name: 'Lucky Charm', description: 'Reveals nearby checkpoints for 10 minutes.', price: 100, type: 'consumable' },
];

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-steps', title: 'First Steps', description: 'Complete your first adventure.', icon: 'Footprints', unlocked: false },
  { id: 'explorer', title: 'Explorer', description: 'Complete 5 different adventures.', icon: 'Compass', unlocked: false, progress: 0, target: 5 },
  { id: 'trailblazer', title: 'Trailblazer', description: 'Complete a hard difficulty adventure.', icon: 'Mountain', unlocked: false },
  { id: 'social-walker', title: 'Social Walker', description: 'Complete an adventure with a party.', icon: 'Users', unlocked: false },
  { id: 'marathon', title: 'Marathon', description: 'Walk 42 km in total.', icon: 'Medal', unlocked: false, progress: 0, target: 42000 },
  { id: 'early-bird', title: 'Early Bird', description: 'Start an adventure before 7 AM.', icon: 'Sunrise', unlocked: false },
];

export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, claimed: false, reward: { coins: 20 } },
  { day: 2, claimed: false, reward: { coins: 30 } },
  { day: 3, claimed: false, reward: { coins: 40, xp: 50 } },
  { day: 4, claimed: false, reward: { coins: 50 } },
  { day: 5, claimed: false, reward: { coins: 60, xp: 100 } },
  { day: 6, claimed: false, reward: { coins: 80 } },
  { day: 7, claimed: false, reward: { coins: 100, item: 'lucky-charm' } },
];

export const CHALLENGES: Challenge[] = [
  { id: 'ch1', title: 'Weekend Warrior', description: 'Complete 3 adventures this weekend.', progress: 0, target: 3, reward: { xp: 200, coins: 100 } },
  { id: 'ch2', title: 'Distance Demon', description: 'Walk 20 km this week.', progress: 0, target: 20000, reward: { xp: 300, coins: 150 } },
  { id: 'ch3', title: 'Social Butterfly', description: 'Complete an adventure with 3 friends.', progress: 0, target: 3, reward: { xp: 250, coins: 120 } },
];
