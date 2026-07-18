import { useAuth } from '../lib/auth';
import { useStore } from '../store';
import { getLevelProgress, getComboTier, getAdventures } from '../data';
import { Card, Button, Stat, ProgressBar, Screen } from '../components/ui';
import { Footprints, Gem, Flame, Coins, Zap, Trophy, Gift, Map, TrendingUp, Calendar } from 'lucide-react';

export default function Home() {
  const { profile } = useAuth();
  const { setScreen } = useStore();
  if (!profile) return null;
  const levelInfo = getLevelProgress(profile.xp);
  const adventures = getAdventures();

  return (
    <Screen>
      <div className="mb-6">
        <p className="text-ink-400 text-sm">Welcome back,</p>
        <h1 className="font-display text-2xl font-bold text-white">{profile.username}</h1>
      </div>
      <Card className="p-5 mb-4 bg-gradient-to-br from-ink-800/80 to-ink-900/80">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-ink-400 text-xs">Level {levelInfo.info.level}</p>
            <h2 className="font-display text-xl font-bold text-white">{levelInfo.info.title} {levelInfo.info.emoji}</h2>
          </div>
          <div className="text-right">
            <p className="text-zeviqo-400 font-bold text-2xl">{profile.xp.toLocaleString()}</p>
            <p className="text-ink-400 text-xs">Total XP</p>
          </div>
        </div>
        <ProgressBar value={levelInfo.current} max={levelInfo.needed} color="#00c4ff" />
        <p className="text-ink-400 text-xs mt-1.5">{levelInfo.current} / {levelInfo.needed} XP to next level</p>
      </Card>
      <div className="grid grid-cols-4 gap-3 mb-4">
        <Stat icon={Coins} label="Coins" value={profile.coins.toLocaleString()} color="#fbbf24" />
        <Stat icon={Gem} label="Gems" value={profile.gems} color="#a78bfa" />
        <Stat icon={Footprints} label="Steps" value={profile.steps.toLocaleString()} color="#22c55e" />
        <Stat icon={Flame} label="Streak" value={`${profile.walking_streak}d`} color="#f97316" />
      </div>
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2"><Trophy size={18} color="#fbbf24" /><h3 className="font-semibold text-white">Today's Quests</h3></div>
          <button onClick={() => setScreen('quests')} className="text-zeviqo-400 text-sm">View all</button>
        </div>
        <p className="text-ink-400 text-sm">Complete quests to earn XP and coins</p>
      </Card>
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-2 mb-3"><Map size={18} color="#00c4ff" /><h3 className="font-semibold text-white">Featured Adventures</h3></div>
        <div className="space-y-2">
          {adventures.slice(0, 2).map(a => (
            <button key={a.id} onClick={() => setScreen('adventures')}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-ink-700/30 hover:bg-ink-700/50 transition-colors text-left">
              <span className="text-2xl">{a.emoji}</span>
              <div className="flex-1"><p className="font-semibold text-white text-sm">{a.title}</p><p className="text-ink-400 text-xs">{a.distance} km · {a.duration} min</p></div>
              <Zap size={16} color="#00c4ff" />
            </button>
          ))}
        </div>
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="primary" onClick={() => setScreen('adventures')} className="flex items-center justify-center gap-2"><Map size={18} /> Start Adventure</Button>
        <Button variant="gold" onClick={() => setScreen('daily-rewards')} className="flex items-center justify-center gap-2"><Gift size={18} /> Daily Rewards</Button>
      </div>
      <Card className="p-4 mt-4">
        <div className="flex items-center gap-2 mb-2"><TrendingUp size={18} color="#22c55e" /><h3 className="font-semibold text-white">Stats Overview</h3></div>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="flex items-center gap-2 text-ink-400"><Footprints size={16} /> {profile.distance_walked.toFixed(1)} km walked</div>
          <div className="flex items-center gap-2 text-ink-400"><Map size={16} /> {profile.completed_adventures} adventures</div>
          <div className="flex items-center gap-2 text-ink-400"><Gem size={16} /> {profile.treasure_collected} treasures</div>
          <div className="flex items-center gap-2 text-ink-400"><Calendar size={16} /> {profile.walking_streak} day streak</div>
        </div>
      </Card>
    </Screen>
  );
}
