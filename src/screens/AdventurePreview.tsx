import { useStore } from '../store';
import { useAdventures } from '../hooks/useAdventures';
import { ADVENTURES, routePointsForAdventure, checkpointsForAdventure, challengesForAdventure } from '../data/gameData';
import { Header } from '../components/Header';
import { MapView } from '../components/MapView';
import { Button } from '../components/Button';

export default function AdventurePreview() {
  const goBack = useStore((s) => s.goBack);
  const navigate = useStore((s) => s.navigate);
  const activeId = useStore((s) => s.activeAdventureId);
  const customAdventures = useStore((s) => s.customAdventures);
  const { adventures: saved } = useAdventures();
  const all = [...customAdventures, ...saved, ...ADVENTURES];
  const adv = all.find((a) => a.id === activeId);

  if (!adv) {
    return <div><Header title="Preview" onBack={goBack} /><div className="p-6 text-center text-ink-500">Adventure not found.</div></div>;
  }

  const checkpoints = checkpointsForAdventure(adv);
  const challenges = challengesForAdventure(adv);
  const route = routePointsForAdventure(adv);

  return (
    <div className="flex flex-col h-screen">
      <Header title="Map Preview" onBack={goBack} subtitle={adv.title} />
      <div className="flex-1 min-h-0">
        <MapView checkpoints={checkpoints} challenges={challenges} route={route} fitBounds showStartFinish />
      </div>
      <div className="p-4 bg-white border-t border-ink-100">
        <p className="text-xs text-ink-500 mb-2 text-center">🟢 Start · 🏁 Finish · 📍 Checkpoints · Challenge markers shown along the route</p>
        <Button fullWidth onClick={() => navigate('adventureMap')}>Start Adventure</Button>
      </div>
    </div>
  );
}
