import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useState } from 'react';
import { Bell, MapPin, Volume2, Moon, Globe, Info, LogOut } from 'lucide-react';

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`w-11 h-6 rounded-full transition-colors ${on ? 'bg-brand-500' : 'bg-ink-200'}`}><span className={`block w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} /></button>;
}

export default function Settings() {
  const goBack = useStore((s) => s.goBack);
  const { isGuest, signOut } = useAuth();
  const navigateToAuth = useStore((s) => s.navigateToAuth);
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(true);
  const [sound, setSound] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  return (
    <div>
      <Header title="Settings" onBack={goBack} />
      <div className="px-4 py-4 space-y-4">
        <Card className="space-y-3">
          <div className="flex items-center gap-3"><Bell size={20} className="text-brand-600" /><span className="flex-1">Notifications</span><Toggle on={notifications} onClick={() => setNotifications((v) => !v)} /></div>
          <div className="flex items-center gap-3"><MapPin size={20} className="text-brand-600" /><span className="flex-1">Location Services</span><Toggle on={location} onClick={() => setLocation((v) => !v)} /></div>
          <div className="flex items-center gap-3"><Volume2 size={20} className="text-brand-600" /><span className="flex-1">Sound Effects</span><Toggle on={sound} onClick={() => setSound((v) => !v)} /></div>
          <div className="flex items-center gap-3"><Moon size={20} className="text-brand-600" /><span className="flex-1">Dark Mode</span><Toggle on={darkMode} onClick={() => setDarkMode((v) => !v)} /></div>
        </Card>
        <Card className="space-y-3">
          <div className="flex items-center gap-3"><Globe size={20} className="text-brand-600" /><span className="flex-1">Language</span><span className="text-sm text-ink-500">English</span></div>
          <div className="flex items-center gap-3"><Info size={20} className="text-brand-600" /><span className="flex-1">Version</span><span className="text-sm text-ink-500">1.0.0</span></div>
        </Card>
        {isGuest ? <Button fullWidth onClick={() => navigateToAuth('settings')}>Sign In</Button> : <Button variant="danger" fullWidth onClick={signOut}><LogOut size={18} className="inline mr-2" />Sign Out</Button>}
      </div>
    </div>
  );
}
