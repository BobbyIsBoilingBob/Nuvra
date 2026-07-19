import { useState, type FormEvent } from 'react';
import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { useAdventures } from '../hooks/useAdventures';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Spinner } from '../components/Spinner';
import { Plus, Trash2, MapPin } from 'lucide-react';
import type { Adventure, Quest } from '../types';

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export default function Creator() {
  const goBack = useStore((s) => s.goBack);
  const navigate = useStore((s) => s.navigate);
  const setActiveAdventure = useStore((s) => s.setActiveAdventure);
  const addCustomAdventure = useStore((s) => s.addCustomAdventure);
  const { isGuest } = useAuth();
  const navigateToAuth = useStore((s) => s.navigateToAuth);
  const { save } = useAdventures();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<typeof DIFFICULTIES[number]>('easy');
  const [distanceKm, setDistanceKm] = useState(2);
  const [durationMin, setDurationMin] = useState(30);
  const [quests, setQuests] = useState<Quest[]>([
    { id: 'q1', type: 'checkpoint', title: 'Checkpoint 1', description: 'Reach the first checkpoint', lat: 51.5074, lng: -0.1278, adventureId: '', adventureTitle: '' },
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addQuest() {
    setQuests((qs) => [...qs, {
      id: `q${qs.length + 1}-${Date.now()}`, type: 'checkpoint',
      title: `Checkpoint ${qs.length + 1}`, description: 'Reach this checkpoint',
      lat: 51.5074 + (Math.random() - 0.5) * 0.01, lng: -0.1278 + (Math.random() - 0.5) * 0.01,
      adventureId: '', adventureTitle: title,
    }]);
  }

  function removeQuest(id: string) {
    setQuests((qs) => qs.filter((q) => q.id !== id));
  }

  function updateQuest(id: string, patch: Partial<Quest>) {
    setQuests((qs) => qs.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) { setError('Title is required'); return; }
    if (quests.length === 0) { setError('Add at least one quest'); return; }
    setBusy(true);
    try {
      const id = `custom-${Date.now()}`;
      const adv: Adventure = {
        id, title: title.trim(), description: description.trim(),
        difficulty, distanceKm, durationMin,
        startLat: quests[0].lat ?? 51.5074, startLng: quests[0].lng ?? -0.1278,
        quests: quests.map((q) => ({ ...q, adventureId: id, adventureTitle: title })),
        rewards: { xp: Math.round(distanceKm * 60), coins: Math.round(distanceKm * 30), items: [] },
        tags: ['custom'], creator: 'You',
        imageUrl: 'https://images.pexels.com/photos/3752878/pexels-photo-3752878.jpeg?auto=compress&cs=tinysrgb&w=800',
      };
      addCustomAdventure(adv);
      if (!isGuest) { try { await save(adv); } catch { /* ignore */ } }
      setActiveAdventure(id);
      navigate('adventureDetail');
    } catch (e: any) {
      setError(e.message ?? 'Failed to save');
    } finally { setBusy(false); }
  }

  return (
    <div>
      <Header title="Adventure Creator" onBack={goBack} subtitle="Build a custom walking adventure" />
      <form onSubmit={submit} className="px-4 py-4 space-y-4">
        {isGuest && (
          <Card className="bg-warning-50 border-warning-100">
            <p className="text-sm text-warning-800">Sign in to save your created adventures to the cloud.</p>
            <Button size="sm" className="mt-2" onClick={() => navigateToAuth('creator')}>Sign In</Button>
          </Card>
        )}

        <Card>
          <label className="text-sm font-medium block mb-1">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Walking Adventure"
            className="w-full px-3 py-2 rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </Card>

        <Card>
          <label className="text-sm font-medium block mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What makes this adventure special?"
            className="w-full px-3 py-2 rounded-lg border border-ink-200 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </Card>

        <Card>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1">Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-ink-200 bg-white">
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Distance (km)</label>
              <input type="number" min={0.5} step={0.5} value={distanceKm} onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-ink-200" />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Duration (min)</label>
              <input type="number" min={5} step={5} value={durationMin} onChange={(e) => setDurationMin(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-ink-200" />
            </div>
          </div>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">Quests ({quests.length})</h2>
            <Button size="sm" variant="secondary" onClick={addQuest}><Plus size={16} className="inline mr-1" />Add</Button>
          </div>
          <div className="space-y-2">
            {quests.map((q, i) => (
              <Card key={q.id}>
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</div>
                  <div className="flex-1 space-y-2">
                    <input value={q.title} onChange={(e) => updateQuest(q.id, { title: e.target.value })} placeholder="Quest title"
                      className="w-full px-2 py-1.5 text-sm rounded-lg border border-ink-200" />
                    <input value={q.description} onChange={(e) => updateQuest(q.id, { description: e.target.value })} placeholder="Description"
                      className="w-full px-2 py-1.5 text-sm rounded-lg border border-ink-200" />
                    <div className="flex gap-2">
                      <input type="number" step="0.0001" value={q.lat ?? 0} onChange={(e) => updateQuest(q.id, { lat: Number(e.target.value) })}
                        className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-ink-200" placeholder="Lat" />
                      <input type="number" step="0.0001" value={q.lng ?? 0} onChange={(e) => updateQuest(q.id, { lng: Number(e.target.value) })}
                        className="flex-1 px-2 py-1.5 text-sm rounded-lg border border-ink-200" placeholder="Lng" />
                    </div>
                  </div>
                  <button type="button" onClick={() => removeQuest(q.id)} className="p-1.5 text-error-500 hover:bg-error-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-error-600">{error}</p>}

        <Button type="submit" fullWidth disabled={busy}>
          {busy ? <Spinner size={18} className="mx-auto" /> : <><MapPin size={18} className="inline mr-2" />Create Adventure</>}
        </Button>
      </form>
    </div>
  );
}
