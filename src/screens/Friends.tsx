import { useStore } from '../store';
import { TopBar } from '../components/BottomNav';
import { EmptyState, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';

export function Friends() {
  const { setScreen } = useStore();
  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent="#3dd4ff" />
      <TopBar title="Friends" showBack />
      <div className="relative z-10 px-4 pt-4">
        <EmptyState icon="Users" title="Friends list moved" desc="Find and manage your friends in the Community hub." action={<Button size="sm" onClick={() => setScreen('community')}>Go to Community</Button>} />
      </div>
    </div>
  );
}
