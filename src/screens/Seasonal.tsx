import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { Sparkles, Snowflake } from 'lucide-react';

export default function Seasonal() {
  const navigate = useStore((s) => s.navigate);
  const { isGuest } = useAuth();
  if (isGuest) {
    return (
      <div className="pb-24"><Header title="Seasonal" />
        <div className="px-4 py-10 text-center"><Snowflake size={48} className="text-ink-500 mx-auto" /><p className="text-ink-300 mt-4">Sign in to join seasonal events.</p><Button className="mt-4" onClick={() => navigate('auth')}>Sign In</Button></div>
      </div>
    );
  }
  return (
    <div className="pb-24"><Header title="Seasonal" />
      <div className="px-4 py-4 max-w-lg mx-auto">
        <Card className="p-5 text-center"><Sparkles size={36} className="text-brand-400 mx-auto" /><p className="text-white font-semibold mt-2">Summer Walking Festival</p><p className="text-ink-400 text-sm mt-1">Complete 5 summer adventures for exclusive rewards.</p><div className="mt-3 h-1.5 rounded-full bg-ink-700 overflow-hidden"><div className="h-full bg-brand-400" style={{ width: '0%' }} /></div><p className="text-ink-400 text-xs mt-1">0/5 completed</p></Card>
      </div>
    </div>
  );
}
