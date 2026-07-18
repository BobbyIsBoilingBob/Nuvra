import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { Sparkles } from 'lucide-react';

export default function AIGenerator() {
  const navigate = useStore((s) => s.navigate);
  const { isGuest } = useAuth();
  if (isGuest) {
    return (
      <div className="pb-24">
        <Header title="AI Adventure Generator" />
        <div className="px-4 py-10 text-center">
          <Sparkles size={48} className="text-ink-500 mx-auto" />
          <p className="text-ink-300 mt-4">Sign in to generate custom adventures.</p>
          <Button className="mt-4" onClick={() => navigate('auth')}>Sign In</Button>
        </div>
      </div>
    );
  }
  return (
    <div className="pb-24">
      <Header title="AI Adventure Generator" />
      <div className="px-4 py-4 max-w-lg mx-auto">
        <Card className="p-5">
          <Sparkles size={32} className="text-brand-400" />
          <p className="text-white font-semibold mt-2">Generate a new adventure</p>
          <p className="text-ink-400 text-sm mt-1">Describe what you want and the AI will create a route.</p>
          <textarea placeholder="A relaxed riverside walk with two checkpoints…"
            className="w-full mt-3 px-3 py-2 rounded-xl bg-ink-900 border border-ink-700 text-white outline-none focus:border-brand-500 min-h-24" />
          <Button className="w-full mt-3">Generate</Button>
        </Card>
      </div>
    </div>
  );
}
