import { useState } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { generateAIAdventure } from '../data/gameData';
import { useAdventures } from '../hooks/useAdventures';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Spinner } from '../components/Spinner';
import { Sparkles, Wand as Wand2 } from 'lucide-react';

const PROMPTS = [
  'A relaxing riverside walk with photo spots',
  'An urban exploration route with street art',
  'A nature trail with wildlife checkpoints',
  'A historic city centre walking tour',
];

export default function AiGenerator() {
  const goBack = useStore((s) => s.goBack);
  const navigate = useStore((s) => s.navigate);
  const setActiveAdventure = useStore((s) => s.setActiveAdventure);
  const { isGuest } = useAuth();
  const navigateToAuth = useStore((s) => s.navigateToAuth);
  const { save } = useAdventures();
  const [prompt, setPrompt] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true); setError(null);
    try {
      const adv = generateAIAdventure(prompt);
      if (!isGuest) { await save(adv); }
      setActiveAdventure(adv.id);
      navigate('adventureDetail');
    } catch (e: any) {
      setError(e.message ?? 'Failed to generate');
    } finally { setBusy(false); }
  }

  return (
    <div>
      <Header title="AI Adventure Generator" onBack={goBack} />
      <div className="px-4 py-4 space-y-4">
        <Card className="bg-gradient-to-r from-brand-500 to-accent-500 text-white border-0">
          <Sparkles size={24} />
          <p className="font-semibold mt-2">Describe your perfect walk</p>
          <p className="text-sm text-white/80">Our AI will craft a custom adventure with checkpoints and rewards.</p>
        </Card>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A sunset walk along the canal with historic bridges"
          className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-white min-h-[100px] focus:outline-none focus:ring-2 focus:ring-brand-500"
        />

        <div className="flex flex-wrap gap-2">
          {PROMPTS.map((p) => (
            <button key={p} onClick={() => setPrompt(p)} className="text-xs px-3 py-1.5 rounded-full bg-ink-100 text-ink-700 hover:bg-ink-200">
              {p}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-error-600">{error}</p>}

        {isGuest && (
          <Card className="bg-warning-50 border-warning-100">
            <p className="text-sm text-warning-800">Sign in to save AI-generated adventures to your library.</p>
            <Button size="sm" className="mt-2" onClick={() => navigateToAuth('aiGenerator')}>Sign In</Button>
          </Card>
        )}

        <Button fullWidth onClick={generate} disabled={busy}>
          {busy ? <Spinner size={18} className="mx-auto" /> : <><Wand2 size={18} className="inline mr-2" />Generate Adventure</>}
        </Button>
      </div>
    </div>
  );
}
