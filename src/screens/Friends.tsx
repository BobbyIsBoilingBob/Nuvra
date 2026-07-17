import { TopBar } from '../components/BottomNav';
import { GlassCard, Icon, Button } from '../components/ui';
import { AdventureBg } from '../components/AdventureBg';

export function Friends() {
  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent="#8b5cf6" />
      <TopBar title="Friends" showBack showCurrencies />
      <div className="relative z-10 px-4 pt-4">
        <GlassCard className="p-6 text-center">
          <Icon name="Users" size={32} className="text-white/20 mx-auto mb-2" />
          <p className="text-sm text-white/40">No friends yet.</p>
          <p className="text-xs text-white/30 mt-1">Add friends to walk together and compare stats.</p>
          <Button className="mt-4" icon="UserPlus">Add Friends</Button>
        </GlassCard>
      </div>
    </div>
  );
}

export function Party() {
  return (
    <div className="relative min-h-screen pb-24">
      <AdventureBg accent="#fb923c" />
      <TopBar title="Party" showBack showCurrencies />
      <div className="relative z-10 px-4 pt-4">
        <GlassCard className="p-6 text-center">
          <Icon name="Swords" size={32} className="text-white/20 mx-auto mb-2" />
          <p className="text-sm text-white/40">No active party.</p>
          <p className="text-xs text-white/30 mt-1">Create or join a party to adventure together.</p>
          <Button className="mt-4" icon="Users">Create Party</Button>
        </GlassCard>
      </div>
    </div>
  );
}
