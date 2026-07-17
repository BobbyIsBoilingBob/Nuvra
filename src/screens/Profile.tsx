import { useMemo } from 'react';
import { Icon, GlassCard, XpBar, LevelBadge, StatChip, Pill, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { getLevelInfo, ACHIEVEMENTS } from '../data';

export function Profile(): React.ReactElement {
  const { profile, stats, walkingStreak, achievementProgress, setScreen } = useStore();
  const levelInfo = useMemo(() => getLevelInfo(profile.xp), [profile.xp]);
  const unlockedAchievements = achievementProgress.filter((a) => a.unlocked).length;

  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent={profile.avatar.color} />
      <div className="relative z-10">
        <TopBar title="Profile" showCurrencies />

        <div className="px-4 max-w-md mx-auto flex flex-col gap-4">
          {/* Profile header */}
          <GlassCard className="p-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl" style={{ background: profile.avatar.color + '30' }}>
                {profile.avatar.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lg font-black text-white truncate">{profile.username}</div>
                <div className="text-xs text-white/50">{levelInfo.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Pill icon="TrendingUp" accent="text-nova-300 border-nova-500/30">Lv {levelInfo.level}</Pill>
                  <Pill icon="Flame" accent="text-ember-300 border-ember-500/30">{walkingStreak} days</Pill>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <XpBar />
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-white/40">{levelInfo.xpIntoLevel} / {levelInfo.xpForNext - (levelInfo.level - 1) ** 2 * 100} XP to next level</span>
                <span className="text-xs text-white/40">{profile.xp.toLocaleString()} total</span>
              </div>
            </div>
          </GlassCard>

          {/* Statistics */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white/60 mb-2">Statistics</h3>
            <div className="grid grid-cols-2 gap-2">
              <StatChip icon="Footprints" label="Total Distance" value={`${(stats.totalDistance / 1000).toFixed(1)} km`} color="text-nova-300" />
              <StatChip icon="Flag" label="Adventures" value={stats.totalAdventures} color="text-cyan-300" />
              <StatChip icon="Flame" label="Longest Streak" value={`${stats.longestStreak} days`} color="text-ember-300" />
              <StatChip icon="Users" label="Friends" value={stats.friendsAdded} color="text-plasma-300" />
              <StatChip icon="Users" label="Multiplayer" value={stats.multiplayerAdventures} color="text-plasma-300" />
              <StatChip icon="Trophy" label="Achievements" value={`${unlockedAchievements}/${ACHIEVEMENTS.length}`} color="text-gold-300" />
              <StatChip icon="Coins" label="Coins Earned" value={stats.totalCoinsEarned.toLocaleString()} color="text-gold-300" />
              <StatChip icon="Zap" label="XP Earned" value={stats.totalXpEarned.toLocaleString()} color="text-nova-300" />
              <StatChip icon="Swords" label="Challenges" value={stats.totalChallenges} color="text-ember-300" />
              <StatChip icon="Gem" label="Treasures" value={stats.treasuresFound} color="text-gold-300" />
            </div>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" icon="Trophy" onClick={() => setScreen('achievements')}>Achievements</Button>
            <Button variant="secondary" icon="ScrollText" onClick={() => setScreen('quests')}>Quests</Button>
            <Button variant="secondary" icon="Users" onClick={() => setScreen('friends')}>Friends</Button>
            <Button variant="secondary" icon="ShoppingBag" onClick={() => setScreen('shop')}>Shop</Button>
            <Button variant="secondary" icon="Gift" onClick={() => setScreen('daily-rewards')}>Daily Reward</Button>
            <Button variant="secondary" icon="Settings" onClick={() => setScreen('settings')}>Settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
