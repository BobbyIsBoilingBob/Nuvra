import { useAuth } from '../lib/auth';
import { useStore } from '../store';
import { Card, Screen, Stat, ProgressBar, Badge, Button } from '../components/ui';
import { getLevelForXp, LEVELS, ADVENTURES } from '../data';
import { Coins, Gem, Flame, Footprints, Trophy, Zap, MapPin, ChevronRight, Sparkles } from 'lucide-react';

export default function Home() {
  const { profile } = useAuth();
  const { setScreen } = useStore();
  if (!profile) return null;
  const level = getLevelForXp(profile.xp);
  const nextLevel = LEVELS[level] ?? LEVELS[LEVELS.length - 1];
  const xpInLevel = profile.xp - (LEVELS[level - 1]?.xpRequired ?? 0);
  const xpForNext = nextLevel.xpRequired - (LEVELS[level - 1]?.xpRequired ?? 0);
  const featured = ADVENTURES[0];

  return (
    <Screen>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: `${profile.avatar_color}33` }}>{profile.avatar_emoji}</div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">{profile.username}</h1>
            <Badge color="#fbbf24">Level {level}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge color="#fbbf24"><Coins size={12} className="inline" /> {profile.coins.toLocaleString()}</Badge>
          <Badge color="#a78bfa"><Gem size={12} className="inline" /> {profile.gems}</Badge>
        </div>
      </div>

      <Card className="p-4 mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-ink-300">Level {level}</span>
          <span className="text-ink-400">{xpInLevel} / {xpForNext} XP</span>
        </div>
        <ProgressBar value={xpInLevel} max={xpForNext} />
      </Card>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Stat icon={Footprints} label="Distance" value={`${(profile.distance_walked / 1000).toFixed(2)} km`} color="#22c55e" />
        <Stat icon={Trophy} label="Adventures" value={profile.completed_adventures} color="#fbbf24" />
        <Stat icon={Flame} label="Streak" value={`${profile.walking_streak} days`} color="#f97316" />
        <Stat icon={Zap} label="Total XP" value={profile.xp.toLocaleString()} color="#3b82f6" />
      </div>

      <h2 className="text-ink-400 text-sm font-semibold uppercase mb-3">Featured Adventure</h2>
      <Card className="p-4 mb-4" style={{ borderColor: `${featured.color}33` }}>
        <div className="flex items-center gap-3">
          <div className="text-4xl">{featured.emoji}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">{featured.name}</h3>
            <p className="text-ink-400 text-sm">{featured.description}</p>
            <div className="flex gap-2 mt-1">
              <Badge color={featured.color}>{featured.difficulty}</Badge>
              <Badge color="#fbbf24"><Zap size={10} className="inline" /> {featured.totalXp} XP</Badge>
            </div>
          </div>
        </div>
        <Button className="w-full mt-3 flex items-center justify-center gap-1" onClick={() => { setScreen('adventureDetail'); }}>
          Start Adventure <ChevronRight size={16} />
        </Button>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => setScreen('aiGenerator')} className="flex items-center justify-center gap-2"><Sparkles size={18} /> AI Generate</Button>
        <Button variant="secondary" onClick={() => setScreen('challenges')} className="flex items-center justify-center gap-2"><Trophy size={18} /> Challenges</Button>
      </div>
    </Screen>
  );
}
