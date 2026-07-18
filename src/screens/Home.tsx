import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import Card from '../components/Card';
import Button from '../components/Button';
import { Compass, Trophy, User, Sparkles, MapPin } from 'lucide-react';

export default function Home() {
  const navigate = useStore((s) => s.navigate);
  const { isGuest, profile } = useAuth();
  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const coins = profile?.coins ?? 0;

  return (
    <div className="px-4 py-6 space-y-6 max-w-lg mx-auto pb-24">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-ink-400 text-sm">Welcome back</p>
          <h1 className="font-display text-2xl font-bold text-white">
            {isGuest ? 'Explorer' : profile?.username ?? 'Adventurer'}
          </h1>
        </div>
        <button onClick={() => navigate('profile')}
          className="h-11 w-11 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center">
          <User size={20} className="text-brand-300" />
        </button>
      </header>

      {isGuest ? (
        <Card className="p-5 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles size={20} className="text-brand-300" />
            </div>
            <div className="flex-1">
              <h2 className="font-display font-bold text-white">You're exploring as a guest</h2>
              <p className="text-ink-300 text-sm mt-1">
                Browse adventures and the community freely. Sign in to save your progress, earn rewards, and join friends.
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={() => navigate('auth')}>Sign In</Button>
                <Button size="sm" variant="secondary" onClick={() => navigate('auth')}>Create Account</Button>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-5 grid grid-cols-3 gap-4">
          <div><p className="text-ink-400 text-xs">Level</p><p className="font-display text-2xl font-bold text-brand-300">{level}</p></div>
          <div><p className="text-ink-400 text-xs">XP</p><p className="font-display text-2xl font-bold text-white">{xp.toLocaleString()}</p></div>
          <div><p className="text-ink-400 text-xs">Coins</p><p className="font-display text-2xl font-bold text-accent-400">{coins}</p></div>
        </Card>
      )}

      <section>
        <h2 className="font-display font-bold text-white mb-3">Start your next adventure</h2>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4" onClick={() => navigate('adventures')}>
            <Compass size={28} className="text-brand-400" />
            <p className="font-semibold text-white mt-2">Adventures</p>
            <p className="text-ink-400 text-xs mt-0.5">Explore nearby routes</p>
          </Card>
          <Card className="p-4" onClick={() => navigate('rewards')}>
            <Trophy size={28} className="text-accent-400" />
            <p className="font-semibold text-white mt-2">Leaderboard</p>
            <p className="text-ink-400 text-xs mt-0.5">Climb the ranks</p>
          </Card>
        </div>
      </section>

      <section>
        <h2 className="font-display font-bold text-white mb-3">Quick actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 flex flex-col items-center gap-1" onClick={() => navigate('quests')}>
            <MapPin size={20} className="text-brand-300" />
            <span className="text-xs text-ink-200">Quests</span>
          </Card>
          <Card className="p-3 flex flex-col items-center gap-1" onClick={() => navigate('challenges')}>
            <Trophy size={20} className="text-accent-400" />
            <span className="text-xs text-ink-200">Challenges</span>
          </Card>
          <Card className="p-3 flex flex-col items-center gap-1" onClick={() => navigate('seasonal')}>
            <Sparkles size={20} className="text-brand-300" />
            <span className="text-xs text-ink-200">Seasonal</span>
          </Card>
        </div>
      </section>

      <section>
        <Card className="p-5 flex items-center gap-4" onClick={() => navigate('aiGenerator')}>
          <div className="h-12 w-12 rounded-xl bg-brand-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles size={24} className="text-brand-300" />
          </div>
          <div className="flex-1">
            <p className="font-display font-bold text-white">AI Adventure Generator</p>
            <p className="text-ink-400 text-sm">Create a custom walking adventure with AI.</p>
          </div>
        </Card>
      </section>
    </div>
  );
}
