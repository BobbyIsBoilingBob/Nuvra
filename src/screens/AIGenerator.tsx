import { useState } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { generateAIAdventure } from '../data/gameData';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';
import { Sparkles, Wand as Wand2, Check, Navigation } from 'lucide-react';
import type { Adventure } from '../types';

const PROMPT_IDEAS = [
  'A relaxed riverside walk with two checkpoints',
  'An urban exploration route with street art',
  'A challenging hilly trek with a summit viewpoint',
  'A family-friendly park loop',
];

export default function AIGenerator() {
  const navigate = useStore((s) => s.navigate);
  const setActiveAdventure = useStore((s) => s.setActiveAdventure);
  const addCustomAdventure = useStore((s) => s.addCustomAdventure);
  const { isGuest } = useAuth();

  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<Adventure | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const generate = () => {
    setError(null);
    setGenerating(true);
    setResult(null);
    setTimeout(() => {
      try {
        const adv = generateAIAdventure(prompt);
        addCustomAdventure(adv);
        setResult(adv);
      } catch {
        setError('Could not generate an adventure. Please try again.');
      }
      setGenerating(false);
    }, 800);
  };

  const startAdventure = () => {
    if (!result) return;
    setActiveAdventure(result.id);
    navigate('adventurePreview');
  };

  return (
    <div className="pb-24">
      <Header title="AI Adventure Generator" />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Wand2 size={24} className="text-brand-400" />
            <h2 className="font-display text-lg font-bold text-white">Generate a new adventure</h2>
          </div>
          <p className="text-ink-400 text-sm mb-3">
            Describe the kind of walking adventure you want and the AI will create a route with checkpoints and rewards.
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A relaxed riverside walk with two checkpoints…"
            className="w-full px-3 py-2 rounded-xl bg-ink-900 border border-ink-700 text-white outline-none focus:border-brand-500 min-h-24"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {PROMPT_IDEAS.map((idea) => (
              <button key={idea} onClick={() => setPrompt(idea)}
                className="px-2 py-1 rounded-lg text-xs bg-ink-700 text-ink-300 hover:bg-ink-600 transition-colors">
                {idea}
              </button>
            ))}
          </div>
          <Button className="w-full mt-3" onClick={generate} disabled={generating}>
            {generating ? 'Generating…' : (<><Wand2 size={18} /> Generate Adventure</>)}
          </Button>
          {error && <p className="text-error-400 text-sm mt-2">{error}</p>}
        </Card>

        {generating && (
          <Card className="p-5 text-center">
            <div className="h-8 w-8 rounded-full border-2 border-ink-600 border-t-brand-400 animate-spin mx-auto" />
            <p className="text-ink-300 text-sm mt-3">Generating your adventure…</p>
          </Card>
        )}

        {result && (
          <Card className="p-5 animate-slide-up">
            <div className="flex items-center gap-2 mb-3">
              <Check size={20} className="text-success-400" />
              <h3 className="font-display font-bold text-white">Adventure generated!</h3>
            </div>
            <div className="h-32 rounded-xl bg-ink-700 mb-3" style={result.imageUrl ? { backgroundImage: `url(${result.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}} />
            <h4 className="font-display text-lg font-bold text-white">{result.title}</h4>
            <p className="text-ink-300 text-sm mt-1">{result.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-0.5 rounded-md text-xs bg-brand-500/15 text-brand-300 capitalize">{result.difficulty}</span>
              <span className="px-2 py-0.5 rounded-md text-xs bg-ink-700 text-ink-300">{result.durationMin} min</span>
              <span className="px-2 py-0.5 rounded-md text-xs bg-ink-700 text-ink-300">{result.distanceKm} km</span>
              <span className="px-2 py-0.5 rounded-md text-xs bg-ink-700 text-ink-300">{result.quests.length} quests</span>
              <span className="px-2 py-0.5 rounded-md text-xs bg-accent-500/15 text-accent-400">{result.rewards.xp} XP</span>
              <span className="px-2 py-0.5 rounded-md text-xs bg-accent-500/15 text-accent-400">{result.rewards.coins} coins</span>
            </div>
            <div className="mt-3">
              <p className="text-ink-400 text-xs font-medium mb-1">Quests:</p>
              <ul className="space-y-1">
                {result.quests.map((q, i) => (
                  <li key={q.id} className="text-ink-300 text-sm flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-ink-700 flex items-center justify-center text-[10px] font-bold text-ink-300">{i + 1}</span>
                    {q.title}
                  </li>
                ))}
              </ul>
            </div>
            <Button className="w-full mt-4" onClick={startAdventure}>
              <Navigation size={18} /> Start This Adventure
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
