# Zeviqo — Walking Adventures

Turn every walk into an adventure. Explore unique routes, complete quests, find treasures, and level up.

## Tech Stack

- Vite + React 18 + TypeScript
- Tailwind CSS 3 (custom Zeviqo color palette)
- Zustand (state management)
- lucide-react (icons)
- @supabase/supabase-js (authentication + backend)

## Authentication

Zeviqo uses **real Supabase Authentication** — no placeholder or demo auth.

- **Sign up**: Email, password, and unique username (3-20 chars, alphanumeric + underscore)
- **Log in**: Email and password only
- **Sessions persist** across app restarts (Supabase session management)
- **Password reset** via email link
- **Change password** from Settings
- **Change email** from Settings
- **Delete account** removes profile and associated data
- **Log out** clears the session

Every new account starts fresh: Level 1, 0 XP, 1000 coins, 0 distance, 0 friends, 0 achievements, no fake data.

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

## Getting Started

Dependencies are pre-installed. The dev server runs automatically.

## Project Structure

```
src/
  components/     Reusable UI components
  screens/        App screens (Auth, Home, Adventures, Community, etc.)
  lib/            Supabase client, auth context, map utilities
  data.ts         Adventure data, quests, achievements, shop items
  store.ts        Zustand store (local state)
  App.tsx         Screen router with auth gate
  main.tsx        Entry point (wraps App in AuthProvider)
```
