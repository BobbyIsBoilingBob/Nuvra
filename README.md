# Zeviqo

Turn every walk into an adventure. A GPS-powered walking adventure app with real-time tracking, quests, achievements, challenges, and a social community.

## Tech Stack

- **Vite** + **React 18** + **TypeScript** + **Tailwind CSS 3**
- **Zustand** for state management (with persist middleware)
- **Supabase** for authentication and database (profiles, friends, notifications, blocks)
- **lucide-react** for icons

## Features

### Authentication
- Real Supabase email/password authentication
- Sign up with email, password, and unique username
- Login with email and password
- Session persistence across app restarts
- Password reset via email
- Change password and change email
- Delete account with confirmation

### Adventures
- Procedurally generated adventures with seeded RNG
- 8 adventure types (treasure hunt, nature walk, mystery, explorer, speed, scenic, fitness, community)
- 5 difficulty levels with multipliers
- GPS drift filtering (3m threshold, 15km/h speed cap)
- Standing still does not count as walking
- Real-time distance tracking with haversine calculations
- Combo system with 6 tiers (Common to Mythic)
- Objective progression with visual feedback

### Social
- Search real registered players by username
- Send and accept friend requests
- Friend list with online indicators
- Notifications for friend requests and acceptances
- Player profile preview modal
- Recently viewed profiles

### Progression
- XP and level system (sqrt curve)
- Daily and weekly quests with claimable rewards
- 15 achievements across 5 categories
- 6 challenges with rewards
- 7-day daily reward calendar
- Shop with cosmetics and boosts

### Quality of Life
- Skeleton loading placeholders
- Error states with retry buttons
- Confirmation dialogs for destructive actions
- Favorite adventures
- Adventure history with repeat and detail view
- Settings for vibration, sound, notifications, GPS tracking, and reduced motion
- Pull-to-refresh-friendly layouts

## Getting Started

The dev server runs automatically. Dependencies are pre-installed.

## Database

Supabase tables: `profiles`, `friends`, `notifications`, `blocks`. All tables have RLS enabled with `TO authenticated` policies scoped to ownership via `auth.uid()`. A `handle_new_user` trigger auto-creates a fresh profile on signup (Level 1, 0 XP, 1000 coins).

## Version

14.0.0 — Beta
