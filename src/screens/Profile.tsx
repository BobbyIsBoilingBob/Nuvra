import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Settings as SettingsIcon, History, Package, User as UserIcon, LogOut, Award, Users } from 'lucide-react';

export default function Profile() {
  const goBack = useStore((s) => s.goBack);
  const navigate = useStore((s) => s.navigate);
  const { profile, signOut, isGuest } = useAuth();
  const navigateToAuth = useStore((s) => s.navigateToAuth);
  const level = useStore((s) => s.level);
  const xp = useStore((s) => s.xp);
  const coins = useStore((s) => s.coins);
  const items: { screen: any; label: string; icon: typeof SettingsIcon }[] = [
    { screen: 'customise', label: 'Customise Avatar', icon: UserIcon },
    { screen: 'history', label: 'Adventure History', icon: History },
    { screen: 'inventory', label: 'Inventory', icon: Package },
    { screen: 'achievements', label: 'Achievements', icon: Award },
    { screen: 'friends', label: 'Friends', icon: Users },
    { screen: 'settings', label: 'Settings', icon: SettingsIcon },
  ];
  return (
    <div>
      <Header title="Profile" onBack={goBack} />
      <div className="px-4 py-4 space-y-4">
        <Card className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ background: profile?.avatarColor ?? '#1c7af5' }}>{profile?.avatar ?? '🧭'}</div>
          <div className="flex-1"><h2 className="text-lg font-bold">{profile?.username ?? 'Adventurer'}</h2><p className="text-sm text-ink-500">Level {profile?.level ?? level} · {profile?.xp ?? xp} XP</p><p className="text-sm text-accent-600 font-semibold">🪙 {profile?.coins ?? coins}</p></div>
        </Card>
        {isGuest && (<Card className="bg-brand-50 border-brand-100"><p className="text-sm text-brand-800">You're a guest. Sign in to save progress.</p><div className="flex gap-2 mt-2"><Button size="sm" onClick={() => navigateToAuth('profile')}>Sign In</Button><Button size="sm" variant="secondary" onClick={() => navigateToAuth('profile')}>Create Account</Button></div></Card>)}
        <div className="space-y-2">{items.map(({ screen, label, icon: Icon }) => (<Card key={label} onClick={() => navigate(screen)} className="flex items-center gap-3"><Icon size={20} className="text-brand-600" /><span className="flex-1 font-medium">{label}</span></Card>))}</div>
        {!isGuest && <Button variant="danger" fullWidth onClick={signOut}><LogOut size={18} className="inline mr-2" />Sign Out</Button>}
      </div>
    </div>
  );
}
