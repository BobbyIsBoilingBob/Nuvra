import Header from '../components/Header';
import Card from '../components/Card';
import { Users, MessageCircle, Globe } from 'lucide-react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';

export default function Community() {
  const navigate = useStore((s) => s.navigate);
  const { isGuest } = useAuth();
  return (
    <div className="pb-24"><Header title="Community" />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {isGuest && <p className="text-ink-400 text-sm bg-ink-800/50 rounded-xl p-3 border border-ink-700/50">You're browsing as a guest. Sign in to post and interact.</p>}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 flex flex-col items-center gap-1" onClick={() => navigate('friends')}><Users size={24} className="text-brand-400" /><span className="text-xs text-ink-200">Friends</span></Card>
          <Card className="p-4 flex flex-col items-center gap-1" onClick={() => navigate('party')}><MessageCircle size={24} className="text-brand-400" /><span className="text-xs text-ink-200">Party</span></Card>
          <Card className="p-4 flex flex-col items-center gap-1" onClick={() => navigate('creator')}><Globe size={24} className="text-brand-400" /><span className="text-xs text-ink-200">Create</span></Card>
        </div>
        <Card className="p-4"><p className="text-white font-semibold">Recent activity</p><p className="text-ink-400 text-sm mt-1">No recent community activity.</p></Card>
      </div>
    </div>
  );
}
