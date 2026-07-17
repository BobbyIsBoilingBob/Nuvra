import { GlassCard, Button, EmptyState } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';

export function Friends() {
  const { setScreen } = useStore();
  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#3dd4ff" />
      <div className="relative z-10"><TopBar title="Friends" showBack />
        <div className="px-4 max-w-md mx-auto">
          <EmptyState icon="Users" title="No friends yet" desc="Search for players and send friend requests to start walking together." action={<Button size="sm" variant="secondary" icon="Search" onClick={() => setScreen('community')}>Search Players</Button>} />
        </div>
      </div>
    </div>
  );
}
