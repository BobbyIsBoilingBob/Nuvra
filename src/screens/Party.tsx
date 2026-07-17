import { useStore } from '../store';
import { TopBar } from '../components/BottomNav';
import { EmptyState } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';

export function Party() {
  const { setScreen } = useStore();
  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent="#7a45ff" />
      <TopBar title="Party" showBack />
      <div className="relative z-10 px-4 pt-4">
        <EmptyState icon="Users" title="No party yet" desc="Walking with friends is coming soon. For now, add friends in Community and adventure solo!" />
      </div>
    </div>
  );
}
