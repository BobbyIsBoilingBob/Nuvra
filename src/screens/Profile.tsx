import { useAuth } from '../lib/auth';
import { useStore } from '../store';
import { Card, Screen, Stat, ProgressBar, Badge, Button } from '../components/ui';
import { getLevelForXp, LEVELS } from '../data';
import { Coins, Gem, Footprints, Trophy, Zap, Flame, Settings, ChevronRight, User, LogIn } from 'lucide-react';

export default function Profile() {
  const { profile, isGuest, exitGuest } = useAuth(); const { setScreen } = useStore();
  if (isGuest || !profile) return (
    <Screen className="flex flex-col items-center justify-center">
      <Card className="p-6 text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-zeviqo-500/20 flex items-center justify-center mx-auto mb-4"><User size={32} color="#fbbf24" /></div>
        <h2 className="font-display text-xl font-bold text-white mb-2">Sign in to view your profile</h2>
        <p className="text-ink-400 text-sm mb-6">You need an account to access your profile, track progress, and earn rewards. Create one or sign in to continue.</p>
        <Button className="w-full mb-2 flex items-center justify-center gap-2" onClick={() => { exitGuest(); setScreen('auth'); }}><LogIn size={18} /> Sign In</Button>
        <Button variant="secondary" className="w-full flex items-center justify-center gap-2" onClick={() => { exitGuest(); setScreen('auth'); }}><User size={18} /> Create Account</Button>
      </Card>
    </Screen>
  );
  const level = getLevelForXp(profile.xp); const xpInLevel = profile.xp - (LEVELS[level - 1]?.xpRequired ?? 0); const xpForNext = (LEVELS[level]?.xpRequired ?? profile.xp) - (LEVELS[level - 1]?.xpRequired ?? 0);
  return (
    <Screen>
      <div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3"><div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: `${profile.avatar_color}33` }}>{profile.avatar_emoji}</div><div><h1 className="font-display text-xl font-bold text-white">{profile.username}</h1><Badge color="#fbbf24">Level {level}</Badge></div></div><button onClick={() => setScreen('settings')}><Settings size={22} color="#94a3b8" /></button></div>
      <Card className="p-4 mb-4"><div className="flex justify-between text-sm mb-2"><span className="text-ink-300">Level {level}</span><span className="text-ink-400">{xpInLevel} / {xpForNext} XP</span></div><ProgressBar value={xpInLevel} max={xpForNext} /></Card>
      <div className="grid grid-cols-2 gap-3 mb-4"><Stat icon={Footprints} label="Distance" value={`${(profile.distance_walked / 1000).toFixed(2)} km`} color="#22c55e" /><Stat icon={Trophy} label="Adventures" value={profile.completed_adventures} color="#fbbf24" /><Stat icon={Flame} label="Streak" value={`${profile.walking_streak} days`} color="#f97316" /><Stat icon={Zap} label="Total XP" value={profile.xp.toLocaleString()} color="#3b82f6" /><Stat icon={Coins} label="Coins" value={profile.coins.toLocaleString()} color="#fbbf24" /><Stat icon={Gem} label="Gems" value={profile.gems} color="#a78bfa" /></div>
      <div className="space-y-2"><Button variant="secondary" className="w-full flex items-center justify-between" onClick={() => setScreen('inventory')}><span>Inventory</span><ChevronRight size={18} color="#64748b" /></Button><Button variant="secondary" className="w-full flex items-center justify-between" onClick={() => setScreen('customise')}><span>Customise</span><ChevronRight size={18} color="#64748b" /></Button><Button variant="secondary" className="w-full flex items-center justify-between" onClick={() => setScreen('history')}><span>History</span><ChevronRight size={18} color="#64748b" /></Button><Button variant="secondary" className="w-full flex items-center justify-between" onClick={() => setScreen('achievements')}><span>Achievements</span><ChevronRight size={18} color="#64748b" /></Button></div>
    </Screen>
  );
}
