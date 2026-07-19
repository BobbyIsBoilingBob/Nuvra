import { useStore } from '../store';
import { useAdventures } from '../hooks/useAdventures';
import { ADVENTURES, nearbyToAdventure, routePointsForAdventure, checkpointsForAdventure, challengesForAdventure } from '../data/gameData';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { MapPin, Clock, Target, Trophy, Map as MapIcon, CircleCheck as CheckCircle } from 'lucide-react';
import { CHALLENGE_LABELS } from '../data/gameData';
import type { ChallengeKind } from '../types';

const DIFF_COLORS: Record<string, string> = {
  easy: 'bg-success-100 text-success-700',
  medium: 'bg-warning-100 text-warning-700',
  hard: 'bg-error-100 text-error-700',
  extreme: 'bg-ink-900 text-white',
};

export default function AdventureDetail() {
  const goBack = useStore((s) => s.goBack);
  const navigate = useStore((s) => s.navigate);
  const activeId = useStore((s) => s.activeAdventureId);
  const customAdventures = useStore((s) => s.customAdventures);
  const hasClaimed = useStore((s) => s.hasClaimedAdventure);
  const { adventures: saved } = useAdventures();
  const all = [...customAdventures, ...saved, ...ADVENTURES];
  const adv = all.find((a) => a.id === activeId);

  if (!adv) {
    return (
      <div>
        <Header title="Adventure" onBack={goBack} />
        <div className="p-6 text-center text-ink-500">Adventure not found.</div>
      </div>
    );
  }

  const checkpoints = checkpointsForAdventure(adv);
  const challenges = challengesForAdventure(adv);
  const route = routePointsForAdventure(adv);
  const claimed = hasClaimed(adv.id);

  return (
    <div>
      <Header title={adv.title} onBack={goBack} subtitle={`${adv.distanceKm} km · ${adv.durationMin} min · ${adv.quests.length} quests`} />
      <div className="px-4 py-4 space-y-4">
        {adv.imageUrl && <img src={adv.imageUrl} alt={adv.title} className="w-full h-48 object-cover rounded-2xl" />}
        <p className="text-ink-700">{adv.description}</p>

        <div className="grid grid-cols-3 gap-2 text-center">
          <Card><MapPin className="mx-auto text-brand-500" size={20} /><p className="text-xs text-ink-500 mt-1">Distance</p><p className="font-semibold">{adv.distanceKm} km</p></Card>
          <Card><Clock className="mx-auto text-brand-500" size={20} /><p className="text-xs text-ink-500 mt-1">Duration</p><p className="font-semibold">{adv.durationMin} min</p></Card>
          <Card><Target className="mx-auto text-brand-500" size={20} /><p className="text-xs text-ink-500 mt-1">Quests</p><p className="font-semibold">{adv.quests.length}</p></Card>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Quests & Challenges</h2>
          <div className="space-y-2">
            {adv.quests.map((q, i) => (
              <Card key={q.id} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{q.title}</p>
                    {q.type === 'challenge' && q.challenge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-100 text-accent-700 font-medium">
                        {CHALLENGE_LABELS[q.challenge.kind as ChallengeKind] ?? q.challenge.kind}
                      </span>
                    )}
                    {q.type === 'checkpoint' && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-100 text-brand-700 font-medium">checkpoint</span>}
                    {q.type === 'distance' && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-success-100 text-success-700 font-medium">distance</span>}
                  </div>
                  <p className="text-xs text-ink-500">{q.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="bg-accent-50 border-accent-100">
          <div className="flex items-center gap-2 mb-1"><Trophy size={18} className="text-accent-600" /><p className="font-semibold">Rewards</p></div>
          <p className="text-sm text-ink-600">+{adv.rewards.xp} XP · +{adv.rewards.coins} coins{adv.rewards.items?.length ? ` · ${adv.rewards.items.join(', ')}` : ''}</p>
          {claimed && <p className="text-xs text-success-600 mt-1 flex items-center gap-1"><CheckCircle size={14} /> You've completed this adventure</p>}
        </Card>

        <div className="flex gap-2">
          <Button fullWidth onClick={() => navigate('adventureMap')}>Start Adventure</Button>
          <Button variant="secondary" onClick={() => navigate('adventurePreview')}><MapIcon size={18} className="inline mr-1" />Preview</Button>
        </div>
      </div>
    </div>
  );
}
