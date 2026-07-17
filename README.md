# Zeviqo — Walking Adventures

Turn every walk into an adventure. Explore unique routes, complete quests, find treasures, and level up.

## Tech Stack

- Vite + React 18 + TypeScript
- Tailwind CSS 3 (custom Zeviqo color palette)
- Zustand (state management with localStorage persistence)
- lucide-react (icons)
- @supabase/supabase-js (backend for social features)

## Features

- **8 Adventure Types**: Treasure Hunts, Nature Walks, Mystery, Explorer Routes, Speed Challenges, Scenic Walks, Fitness, Community
- **Procedural Generation**: Seeded RNG ensures unique, reproducible adventures
- **Route Preview**: Animated SVG route with start/end markers and glow effects
- **Progression System**: XP/levels (sqrt curve), daily rewards, daily/weekly quests, walking streaks
- **Combo System**: Tier multipliers from Common (1.2x) to Mythic (3.0x)
- **Achievements**: 15 achievements across 5 categories
- **Challenges**: 6 completable challenges with rewards
- **Adventure History**: Save completed adventures with full stats, favorites, repeat, and sharing
- **Shop**: Buy cosmetic items with coins
- **Social System**: Real user search, friend requests, accept/decline, remove friends, block users, notifications
- **PWA**: Installable with manifest.json

## Getting Started

Dependencies are pre-installed. The dev server runs automatically.

## Project Structure

```
src/
  components/     Reusable UI components
  screens/        17 app screens
  lib/            Supabase client, map utilities
  data.ts         Adventure data, quests, achievements, shop items
  store.ts        Zustand store with persistence
  App.tsx         Screen router
  main.tsx        Entry point
```
