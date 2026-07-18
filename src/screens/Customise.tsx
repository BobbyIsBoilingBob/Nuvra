import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { Palette } from 'lucide-react';

export default function Customise() {
  const navigate = useStore((s) => s.navigate);
  const { isGuest } = useAuth();
  if (isGuest) {
    return (
      <div className="pb-24">
        <Header title="Customise" />
        <div className="px-4 py-10 text-center">
          <Palette size={48} className="text-ink-500 mx-auto" />
          <p className="text-ink-300 mt-4">Sign in to customise your avatar.</p>
          <Button className="mt-4" onClick={() => navigate('auth')}>Sign In</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="pb-24">
      <Header title="Customise" />
      <div className="px-4 py-4 max-w-lg mx-auto">
        <Card className="p-5 text-center">
          <Palette size={32} className="text-brand-400 mx-auto" />
          <p className="text-white font-semibold mt-2">Avatar customisation</p>
          <p className="text-ink-400 text-sm mt-1">Coming soon.</p>
        </Card>
      </div>
    </div>
  );
}
