import { useStore } from '../store';
import { useAdventures } from '../hooks/useAdventures';
import { ADVENTURES } from '../data/gameData';
import { Header } from '../components/Header';
import { MapView } from '../components/MapView';
import { Button } from '../components/Button';
import type { GeoPoint } from '../types';

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

  const checkpoints: GeoPoint[] = adv.quests.filter((q) => q.lat != null).map((q) => ({ lat: q.lat!, lng: q.lng! }));

  return (
    <div className="flex flex-col h-screen">
      <Header title="Preview Map" onBack={goBack} subtitle={adv.title} />
      <div className="flex-1 min-h-0">
        <MapView checkpoints={checkpoints} center={checkpoints[0] ?? { lat: adv.startLat, lng: adv.startLng }} />
      </div>
      <div className="p-4 bg-white border-t border-ink-100">
        <Button fullWidth onClick={() => navigate('adventureMap')}>Start Adventure</Button>
      </div>
    </div>
  );
}
