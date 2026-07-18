import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { User, Trophy, Coins, Sparkles, Settings, MapPin, History as HistoryIcon, Award, Package, LogOut } from 'lucide-react';

export default function Profile() {
  const navigate = useStore((s) => s.navigate);
  const resetTo = useStore((s) => s.resetTo);
  const { isGuest, profile, signOut } = useAuth();

  if (isGuest) {
    return (
      <div className="pb-24">
        <Header title="Profile" back={false} />
        <div className="px-4 py-10 max-w-md mx-auto flex flex-col items-center text-center animate-fade-in">
          <div className="h-24 w-24 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center mb-6">
            <User size={40} className="text-brand-300" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white">Sign in or create an account to view your profile</h2>
          <p className="text-ink-300 mt-2 max-w-xs">
            You need an account to access your profile, track progress, earn rewards, and connect with friends.
          </p>
          <div className="flex gap-3 mt-6 w-full">
            <Button className="flex-1" onClick={() => navigate('auth')}>Sign In</Button>
            <Button className="flex-1" variant="secondary" onClick={() => navigate('auth')}>Create Account</Button>
          </div>
          <button onClick={() => resetTo('home')} className="text-ink-400 text-sm mt-4 hover:text-ink-200">
            Continue browsing as guest
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="pb-24">
        <Header title="Profile" back={false} right={
          <button onClick={() => navigate('settings')} aria-label="Settings" className="text-ink-300 hover:text-white"><Settings size={20} /></button>
        } />
        <div className="px-4 py-4 max-w-lg mx-auto">
          <Card className="p-5 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-ink-700" />
              <div className="space-y-2">
                <div className="h-5 w-32 rounded bg-ink-700" />
                <div className="h-3 w-20 rounded bg-ink-700" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <Header title="Profile" back={false} right={
        <button onClick={() => navigate('settings')} aria-label="Settings" className="text-ink-300 hover:text-white"><Settings size={20} /></button>
      } />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        <Card className="p-5 flex items-center gap-4 animate-fade-in">
          <div className="h-16 w-16 rounded-full flex items-center justify-center text-3xl" style={{ backgroundColor: profile.avatarColor ?? '#1c7af5' + '30', border: `2px solid ${profile.avatarColor ?? '#1c7af5'}` }}>
            {profile.avatar ?? '🧭'}
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-white">{profile.username}</h2>
            <p className="text-ink-400 text-sm">Level {profile.level}</p>
          </div>
        </Card>
        <Card className="p-4 grid grid-cols-3 gap-3 text-center animate-fade-in">
          <div><Sparkles size={18} className="text-brand-400 mx-auto" /><p className="text-white font-bold mt-1">{profile.xp.toLocaleString()}</p><p className="text-ink-400 text-xs">XP</p></div>
          <div><Trophy size={18} className="text-accent-400 mx-auto" /><p className="text-white font-bold mt-1">{profile.level}</p><p className="text-ink-400 text-xs">Level</p></div>
          <div><Coins size={18} className="text-accent-400 mx-auto" /><p className="text-white font-bold mt-1">{profile.coins}</p><p className="text-ink-400 text-xs">Coins</p></div>
        </Card>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4" onClick={() => navigate('achievements')}><Award size={20} className="text-accent-400" /><p className="text-white font-semibold mt-2">Achievements</p></Card>
          <Card className="p-4" onClick={() => navigate('history')}><HistoryIcon size={20} className="text-brand-400" /><p className="text-white font-semibold mt-2">History</p></Card>
          <Card className="p-4" onClick={() => navigate('friends')}><User size={20} className="text-brand-400" /><p className="text-white font-semibold mt-2">Friends</p></Card>
          <Card className="p-4" onClick={() => navigate('inventory')}><Package size={20} className="text-brand-400" /><p className="text-white font-semibold mt-2">Inventory</p></Card>
          <Card className="p-4" onClick={() => navigate('customise')}><User size={20} className="text-brand-400" /><p className="text-white font-semibold mt-2">Customise</p></Card>
          <Card className="p-4" onClick={() => navigate('settings')}><Settings size={20} className="text-brand-400" /><p className="text-white font-semibold mt-2">Settings</p></Card>
        </div>
        <Button variant="danger" className="w-full" onClick={() => { signOut(); resetTo('home'); }}>
          <LogOut size={18} /> Sign Out
        </Button>
      </div>
    </div>
  );
}
