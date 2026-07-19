import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store';
import { useAdventures } from '../hooks/useAdventures';
import { ADVENTURES, suggestNearbyAdventures, nearbyToAdventure } from '../data/gameData';
import { getCurrentPosition } from '../lib/geo';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { Spinner } from '../components/Spinner';
import { Sparkles, Plus, Navigation } from 'lucide-react';
import type { Adventure, NearbyAdventure, GeoPoint } from '../types';

const DIFF_COLORS: Record<string, string> = {
  easy: 'bg-success-100 text-success-700',
  medium: 'bg-warning-100 text-warning-700',
  hard: 'bg-error-100 text-error-700',
  extreme: 'bg-ink-900 text-white',
};

function travelLabel(min: number): string {
  if (min < 60) return `${min} min away`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m away` : `${h}h away`;
}

export default function Adventures() {
  const navigate = useStore((s) => s.navigate);
  const setActiveAdventure = useStore((s) => s.setActiveAdventure);
  const addCustomAdventure = useStore((s) => s.addCustomAdventure);
  const customAdventures = useStore((s) => s.customAdventures);
  const lastKnownLocation = useStore((s) => s.lastKnownLocation);
  const setLastKnownLocation = useStore((s) => s.setLastKnownLocation);
  const { adventures: saved, loading } = useAdventures();
  const [nearby, setNearby] = useState<NearbyAdventure[]>([]);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  const userLocation = useMemo<GeoPoint>(() => lastKnownLocation ?? { lat: 0, lng: 0 }, [lastKnownLocation]);

  useEffect(() => {
    if (lastKnownLocation) {
      setNearby(suggestNearbyAdventures(lastKnownLocation, 10));
      return;
    }
    setLocating(true);
    getCurrentPosition()
      .then((loc) => {
        setLastKnownLocation(loc);
        setNearby(suggestNearbyAdventures(loc, 10));
        setLocating(false);
      })
      .catch((err) => {
        setLocError(err.message ?? 'Unable to get location');
        setNearby(suggestNearbyAdventures({ lat: 0, lng: 0 }, 10));
        setLocating(false);
      });
  }, [lastKnownLocation, setLastKnownLocation]);

  function open(a: Adventure) {
    setActiveAdventure(a.id);
    navigate('adventureDetail');
  }

  function openNearby(n: NearbyAdventure) {
    const adv = nearbyToAdventure(n);
    addCustomAdventure(adv);
    setActiveAdventure(adv.id);
    navigate('adventureDetail');
  }

  return (
    <div>
      <Header title="Adventures" subtitle={`${nearby.length} suggested near you`} />
      <div className="px-4 py-4 space-y-3">
        <Card onClick={() => navigate('aiGenerator')} className="flex items-center gap-3 bg-gradient-to-r from-brand-500 to-accent-500 text-white border-0">
          <Sparkles size={24} />
          <div className="flex-1"><p className="font-semibold">AI Adventure Generator</p><p className="text-xs text-white/80">Create a custom walking adventure</p></div>
        </Card>
        <Card onClick={() => navigate('creator')} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center"><Plus size={20} /></div>
          <div><p className="font-semibold">Adventure Creator</p><p className="text-xs text-ink-500">Build your own route</p></div>
        </Card>

        {locating && (
          <Card className="flex items-center gap-2 text-sm text-ink-500">
            <Navigation size={16} className="animate-pulse text-brand-500" /> Finding adventures near you...
          </Card>
        )}
        {locError && !locating && !lastKnownLocation && (
          <Card className="bg-warning-50 border-warning-100">
            <p className="text-sm text-warning-800">Couldn't get your location: {locError}</p>
            <p className="text-xs text-warning-700 mt-1">Enter a location in the AI Generator, or enable location permissions.</p>
          </Card>
        )}

        <h2 className="text-sm font-semibold text-ink-500 pt-2">Suggested Near You</h2>
        {!locating && nearby.map((n) => (
          <Card key={n.id} onClick={() => openNearby(n)} padded={false} className="overflow-hidden">
            {n.imageUrl && <img src={n.imageUrl} alt={n.title} className="w-full h-32 object-cover" loading="lazy" />}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{n.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFF_COLORS[n.difficulty]}`}>{n.difficulty}</span>
              </div>
              <p className="text-sm text-ink-500 mt-1 line-clamp-2">{n.description}</p>
              <div className="flex flex-wrap gap-3 text-xs text-ink-400 mt-2">
                <span className="text-brand-600 font-medium">{travelLabel(n.travelMin)}</span>
                <span>📍 {n.distanceKm} km</span>
                <span>⏱️ {n.durationMin} min</span>
                <span>🎯 {n.quests.length} quests</span>
              </div>
            </div>
          </Card>
        ))}

        {customAdventures.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-ink-500 pt-2">Your Created Adventures</h2>
            {customAdventures.map((a) => (
              <Card key={a.id} onClick={() => open(a)} padded={false} className="overflow-hidden">
                {a.imageUrl && <img src={a.imageUrl} alt={a.title} className="w-full h-32 object-cover" loading="lazy" />}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{a.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFF_COLORS[a.difficulty]}`}>{a.difficulty}</span>
                  </div>
                  <p className="text-sm text-ink-500 mt-1 line-clamp-2">{a.description}</p>
                  <div className="flex gap-4 text-xs text-ink-400 mt-2"><span>📍 {a.distanceKm} km</span><span>⏱️ {a.durationMin} min</span><span>🎯 {a.quests.length} quests</span></div>
                </div>
              </Card>
            ))}
          </>
        )}

        {loading && <div className="flex justify-center py-4"><Spinner /></div>}

        {saved.length > 0 && (
          <>
            <h2 className="text-sm font-semibold text-ink-500 pt-2">Saved Adventures</h2>
            {saved.map((a) => (
              <Card key={a.id} onClick={() => open(a)} padded={false} className="overflow-hidden">
                {a.imageUrl && <img src={a.imageUrl} alt={a.title} className="w-full h-32 object-cover" loading="lazy" />}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold">{a.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFF_COLORS[a.difficulty]}`}>{a.difficulty}</span>
                  </div>
                  <p className="text-sm text-ink-500 mt-1 line-clamp-2">{a.description}</p>
                  <div className="flex gap-4 text-xs text-ink-400 mt-2"><span>📍 {a.distanceKm} km</span><span>⏱️ {a.durationMin} min</span><span>🎯 {a.quests.length} quests</span></div>
                </div>
              </Card>
            ))}
          </>
        )}

        <h2 className="text-sm font-semibold text-ink-500 pt-2">Featured Adventures</h2>
        {ADVENTURES.map((a) => (
          <Card key={a.id} onClick={() => open(a)} padded={false} className="overflow-hidden">
            {a.imageUrl && <img src={a.imageUrl} alt={a.title} className="w-full h-32 object-cover" loading="lazy" />}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold">{a.title}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFF_COLORS[a.difficulty]}`}>{a.difficulty}</span>
              </div>
              <p className="text-sm text-ink-500 mt-1 line-clamp-2">{a.description}</p>
              <div className="flex gap-4 text-xs text-ink-400 mt-2"><span>📍 {a.distanceKm} km</span><span>⏱️ {a.durationMin} min</span><span>🎯 {a.quests.length} quests</span></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
