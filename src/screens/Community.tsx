import { Icon, GlassCard, EmptyState } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';
import { useState } from 'react';

export function Community(): React.ReactElement {
  const { setScreen } = useStore();
  const [tab, setTab] = useState<'activity' | 'friends' | 'leaderboard'>('activity');
  const tabs = [
    { id: 'activity' as const, label: 'Activity', icon: 'Activity' },
    { id: 'friends' as const, label: 'Friends', icon: 'Users' },
    { id: 'leaderboard' as const, label: 'Leaders', icon: 'Trophy' },
  ];
  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#a78bfa" />
      <div className="relative z-10">
        <TopBar showBack title="Community" />
        <div className="px-4 max-w-md mx-auto flex flex-col gap-4">
          <div className="flex gap-2 p-1 glass rounded-2xl">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${tab===t.id?'bg-gradient-to-r from-plasma-400 to-zeviqo-500 text-ink-950':'text-white/50'}`}>
                <Icon name={t.icon} size={14} />{t.label}
              </button>
            ))}
          </div>
          {tab === 'activity' && <EmptyState icon="Activity" title="No activity yet" desc="When you and your friends complete adventures, find treasures, and level up, their activity will appear here." />}
          {tab === 'friends' && <EmptyState icon="Users" title="No friends yet" desc="Search for players and send friend requests to build your community." action={<button onClick={() => setScreen('friends')} className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-zeviqo-400 to-cyan-400 text-ink-950">Find Friends</button>} />}
          {tab === 'leaderboard' && <EmptyState icon="Trophy" title="No rankings yet" desc="Play adventures to earn XP and climb the leaderboard. Rankings will appear once players start exploring." />}
        </div>
      </div>
    </div>
  );
}
