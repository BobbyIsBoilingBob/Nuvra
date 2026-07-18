import { useAuth } from '../lib/auth';
import { useStore } from '../store';
import { getLevelProgress } from '../data';
import { Card, Screen, Button, Stat, ProgressBar } from '../components/ui';
import { Coins, Gem, Footprints, Flame, Zap, Map, Settings, CreditCard as Edit3, Backpack, Trophy, Gift } from 'lucide-react';

export default function Profile() {
  const { profile, signOut } = useAuth();
  const { setScreen } = useStore();

  if (!profile) return null;
  const levelInfo = getLevelProgress(profile.xp);

  return (
    <Screen>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: `${profile.avatar_color}22` }}>
          {profile.avatar_emoji}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold text-white">{profile.username}</h1>
          <p className="text-ink-400 text-sm">{levelInfo.info.title} {levelInfo.info.emoji} · Level {levelInfo.info.level}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setScreen('settings')}><Settings size={18} /></Button>
      </div>

      <Card className="p-4 mb-4">
        <ProgressBar value={levelInfo.current} max={levelInfo.needed} color="#00c4ff" />
        <p className="text-ink-400 text-xs mt-2">{levelInfo.current} / {levelInfo.needed} XP · {profile.xp.toLocaleString()} total</p>
      </Card>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Stat icon={Coins} label="Coins" value={profile.coins.toLocaleString()} color="#fbbf24" />
        <Stat icon={Gem} label="Gems" value={profile.gems} color="#a78bfa" />
        <Stat icon={Zap} label="XP" value={profile.xp.toLocaleString()} color="#00c4ff" />
      </div>

      <Card className="p-4 mb-4">
        <h3 className="font-semibold text-white mb-3">Stats</h3>
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <div className="flex items-center gap-2 text-ink-300"><Footprints size={16} color="#22c55e" /> {profile.distance_walked.toFixed(1)} km walked</div>
          <div className="flex items-center gap-2 text-ink-300"><Map size={16} color="#00c4ff" /> {profile.completed_adventures} adventures</div>
          <div className="flex items-center gap-2 text-ink-300"><Flame size={16} color="#f97316" /> {profile.walking_streak} day streak</div>
          <div className="flex items-center gap-2 text-ink-300"><Gem size={16} color="#a78bfa" /> {profile.treasure_collected} treasures</div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Button variant="secondary" onClick={() => setScreen('customise')} className="flex items-center justify-center gap-2">
          <Edit3 size={18} /> Customise
        </Button>
        <Button variant="secondary" onClick={() => setScreen('inventory')} className="flex items-center justify-center gap-2">
          <Backpack size={18} /> Inventory
        </Button>
        <Button variant="secondary" onClick={() => setScreen('achievements')} className="flex items-center justify-center gap-2">
          <Trophy size={18} /> Achievements
        </Button>
        <Button variant="secondary" onClick={() => setScreen('history')} className="flex items-center justify-center gap-2">
          <Map size={18} /> History
        </Button>
      </div>

      <Button variant="danger" onClick={signOut} className="w-full">Sign Out</Button>
    </Screen>
  );
}
