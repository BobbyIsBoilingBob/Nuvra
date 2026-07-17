import { GlassCard, Button, EmptyState } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';
import { TopBar } from '../components/BottomNav';
import { useStore } from '../store';

export function Party(): React.ReactElement {
  const { setScreen } = useStore();
  return (
    <div className="relative min-h-screen w-full overflow-hidden pb-24">
      <AdventureBg accent="#7a45ff" />
      <div className="relative z-10">
        <TopBar showBack title="Adventure Party" />
        <div className="px-4 max-w-md mx-auto">
          <EmptyState icon="Users" title="No party yet" desc="Create or join a party to walk with friends in real-time." action={<Button size="sm" variant="secondary" icon="Plus" onClick={() => setScreen('adventures')}>Browse Adventures</Button>} />
        </div>
      </div>
    </div>
  );
}
