import { useStore } from '../store';
import { useNotifications } from '../hooks/useNotifications';
import { Card, Screen } from '../components/ui';
import { Bell, Users, UserPlus, PartyPopper } from 'lucide-react';

export default function Community() {
  const { setScreen } = useStore();
  const { unreadCount } = useNotifications();
  const items = [
    { id: 'friends', label: 'Friends', icon: Users, color: '#00c4ff', desc: 'View your friends list' },
    { id: 'party', label: 'Party', icon: PartyPopper, color: '#fbbf24', desc: 'Adventure together' },
    { id: 'activity', label: 'Activity Feed', icon: Bell, color: '#22c55e', desc: 'Recent friend activity', badge: unreadCount },
  ];
  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4">Community</h1>
      <div className="space-y-3">
        {items.map(item => (
          <Card key={item.id} className="p-4 cursor-pointer hover:border-zeviqo-500/30 transition-all" onClick={() => setScreen(item.id as never)}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${item.color}22` }}><item.icon size={24} color={item.color} /></div>
              <div className="flex-1"><h3 className="font-semibold text-white">{item.label}</h3><p className="text-ink-400 text-sm">{item.desc}</p></div>
              {item.badge ? <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400">{item.badge}</span> : null}
            </div>
          </Card>
        ))}
      </div>
    </Screen>
  );
}
