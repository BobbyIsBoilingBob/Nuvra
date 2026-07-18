import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { Compass } from 'lucide-react';

export default function Creator() {
  const setScreen = useStore((s) => s.setScreen);
  const { isGuest } = useAuth();
  if (isGuest) {
    return (
      <div className="pb-24">
        <Header title="Adventure Creator" back={false} />
        <div className="px-4 py-10 text-center">
          <Compass size={48} className="text-ink-500 mx-auto" />
          <p className="text-ink-300 mt-4">Sign in to create custom adventures.</p>
          <Button className="mt-4" onClick={() => setScreen('auth')}>Sign In</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="pb-24">
      <Header title="Adventure Creator" back={false} />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-3">
        <Card className="p-4">
          <label className="text-ink-300 text-sm">Adventure title</label>
          <input className="w-full mt-1 px-3 py-2 rounded-xl bg-ink-900 border border-ink-700 text-white outline-none focus:border-brand-500" placeholder="My custom walk" />
        </Card>
        <Card className="p-4">
          <label className="text-ink-300 text-sm">Description</label>
          <textarea className="w-full mt-1 px-3 py-2 rounded-xl bg-ink-900 border border-ink-700 text-white outline-none focus:border-brand-500 min-h-20" placeholder="What makes this adventure special?" />
        </Card>
        <Button className="w-full">Publish Adventure</Button>
      </div>
    </div>
  );
}
