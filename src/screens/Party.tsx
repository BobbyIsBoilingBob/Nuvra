import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { Users } from 'lucide-react';

export default function Party() {
  const setScreen = useStore((s) => s.setScreen);
  const { isGuest } = useAuth();
  if (isGuest) {
    return (
      <div className="pb-24">
        <Header title="Party" back={false} />
        <div className="px-4 py-10 text-center">
          <Users size={48} className="text-ink-500 mx-auto" />
          <p className="text-ink-300 mt-4">Sign in to form a walking party.</p>
          <Button className="mt-4" onClick={() => setScreen('auth')}>Sign In</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="pb-24">
      <Header title="Party" back={false} />
      <div className="px-4 py-4 max-w-lg mx-auto">
        <Card className="p-5 text-center">
          <Users size={40} className="text-brand-400 mx-auto" />
          <p className="text-white font-semibold mt-3">No active party</p>
          <p className="text-ink-400 text-sm mt-1">Invite friends to walk together.</p>
          <Button className="mt-4" onClick={() => setScreen('friends')}>Invite Friends</Button>
        </Card>
      </div>
    </div>
  );
}
