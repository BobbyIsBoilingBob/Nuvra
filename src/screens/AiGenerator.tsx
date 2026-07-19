import { useState } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { generateAIAdventure, CHALLENGE_KINDS, CHALLENGE_LABELS } from '../data/gameData';
import { useAdventures } from '../hooks/useAdventures';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Spinner } from '../components/Spinner';
import { Sparkles, Wand as Wand2, ChevronDown } from 'lucide-react';
import type { ChallengeKind, GeneratorOptions, Adventure } from '../types';

const DIFFICULTIES: Adventure['difficulty'][] = ['easy', 'medium', 'hard', 'extreme'];
const DURATIONS = [20, 30, 45, 60, 90, 120, 240];

export default function AiGenerator() {
  const goBack = useStore((s) => s.goBack);
  const navigate = useStore((s) => s.navigate);
  const setActiveAdventure = useStore((s) => s.setActiveAdventure);
  const addCustomAdventure = useStore((s) => s.addCustomAdventure);
  const lastKnownLocation = useStore((s) => s.lastKnownLocation);
  const { isGuest } = useAuth();
  const navigateToAuth = useStore((s) => s.navigateToAuth);
  const { save } = useAdventures();

  const [prompt, setPrompt] = useState('');
  const [location, setLocation] = useState('');
  const [maxDistance, setMaxDistance] = useState('');
  const [minDistance, setMinDistance] = useState('');
  const [approxDistance, setApproxDistance] = useState('');
  const [difficulty, setDifficulty] = useState<Adventure['difficulty'] | ''>('');
  const [challengeTypes, setChallengeTypes] = useState<ChallengeKind[]>([]);
  const [duration, setDuration] = useState<number | ''>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleChallenge(kind: ChallengeKind) {
    setChallengeTypes((prev) => prev.includes(kind) ? prev.filter((k) => k !== kind) : [...prev, kind]);
  }

  function parseKm(input: string): number | undefined {
    if (!input.trim()) return undefined;
    const m = input.match(/([\d.]+)\s*(km|kilomet|k)?/i);
    if (m) return parseFloat(m[1]);
    const n = parseFloat(input);
    return isNaN(n) ? undefined : n;
  }

  async function generate() {
    setBusy(true); setError(null);
    try {
      const opts: GeneratorOptions = {
        prompt,
        location: location.trim() || undefined,
        maxDistanceKm: parseKm(maxDistance),
        minDistanceKm: parseKm(minDistance),
        approxDistanceKm: parseKm(approxDistance),
        difficulty: difficulty || undefined,
        challengeTypes: challengeTypes.length ? challengeTypes : undefined,
        durationMin: duration || undefined,
      };
      if (!location.trim() && lastKnownLocation) {
        opts.location = 'Near me';
      }
      const adv = generateAIAdventure(opts);
      addCustomAdventure(adv);
      if (!isGuest) { try { await save(adv); } catch { /* ignore */ } }
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
          <p className="text-sm text-white/80">Our AI will craft a custom adventure with varied challenges, checkpoints, and rewards.</p>
        </Card>

        <Card>
          <label className="text-sm font-medium block mb-1">Prompt (optional)</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A sunset walk along the canal with historic bridges"
            className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-white min-h-[80px] focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </Card>

        <Card>
          <label className="text-sm font-medium block mb-1">Location (optional)</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={lastKnownLocation ? 'Near me (default)' : 'e.g. Brisbane, Noosa, Tokyo'}
            className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <p className="text-xs text-ink-400 mt-1">Leave blank to use your current location.</p>
        </Card>

        <Card>
          <label className="text-sm font-medium block mb-2">Difficulty (optional)</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDifficulty('')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${difficulty === '' ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-700'}`}
            >
              Auto
            </button>
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${difficulty === d ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-700'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <label className="text-sm font-medium block mb-2">Preferred Duration (optional)</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDuration('')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${duration === '' ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-700'}`}
            >
              Auto
            </button>
            {DURATIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${duration === d ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-700'}`}
              >
                {d < 60 ? `${d} min` : d < 240 ? `${d / 60}h` : '4h'}
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <label className="text-sm font-medium block mb-2">Preferred Challenge Types (optional)</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setChallengeTypes([])}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${challengeTypes.length === 0 ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-700'}`}
            >
              Mixed (default)
            </button>
            {CHALLENGE_KINDS.map((k) => (
              <button
                key={k}
                onClick={() => toggleChallenge(k)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${challengeTypes.includes(k) ? 'bg-brand-500 text-white' : 'bg-ink-100 text-ink-700'}`}
              >
                {CHALLENGE_LABELS[k]}
              </button>
            ))}
          </div>
        </Card>

        <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-1 text-sm font-medium text-brand-600">
          <ChevronDown size={16} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          Advanced distance options
        </button>

        {showAdvanced && (
          <Card className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1">Maximum distance (optional)</label>
              <input value={maxDistance} onChange={(e) => setMaxDistance(e.target.value)} placeholder="e.g. Within 10 km"
                className="w-full px-3 py-2 rounded-lg border border-ink-200" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Minimum distance (optional)</label>
              <input value={minDistance} onChange={(e) => setMinDistance(e.target.value)} placeholder="e.g. At least 30 km"
                className="w-full px-3 py-2 rounded-lg border border-ink-200" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Approximate distance (optional)</label>
              <input value={approxDistance} onChange={(e) => setApproxDistance(e.target.value)} placeholder="e.g. Around 20 km"
                className="w-full px-3 py-2 rounded-lg border border-ink-200" />
            </div>
          </Card>
        )}

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
