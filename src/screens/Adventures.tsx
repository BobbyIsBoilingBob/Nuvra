import { useStore } from '../store';
import { ADVENTURES } from '../data';
import { Card, Screen, Badge, EmptyState } from '../components/ui';
import { MapPin, Clock, Zap, Heart } from 'lucide-react';

export default function Adventures() {
  const { setScreen, setActiveAdventure, favorites, toggleFavorite } = useStore();
  return (
    <Screen>
      <h1 className="font-display text-2xl font-bold text-white mb-4">Adventures</h1>
      <div className="space-y-3">
        {ADVENTURES.map((a) => (
          <Card key={a.id} className="p-4" style={{ borderColor: `${a.color}22` }}>
            <div className="flex items-start gap-3">
              <div className="text-4xl">{a.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">{a.name}</h3>
                  <button onClick={() => toggleFavorite(a.id)}><Heart size={18} color={favorites.includes(a.id) ? '#ef4444' : '#64748b'} fill={favorites.includes(a.id) ? '#ef4444' : 'transparent'} /></button>
                </div>
                <p className="text-ink-400 text-sm mb-2">{a.description}</p>
                <div className="flex gap-2 mb-3">
                  <Badge color={a.color}>{a.difficulty}</Badge>
                  <Badge color="#94a3b8"><Clock size={10} className="inline" /> {a.estimatedMinutes}m</Badge>
                  <Badge color="#fbbf24"><Zap size={10} className="inline" /> {a.totalXp}</Badge>
                  <Badge color="#3b82f6"><MapPin size={10} className="inline" /> {a.quests.length}</Badge>
                </div>
                <button onClick={() => { setActiveAdventure(a.id); setScreen('adventureDetail'); }} className="w-full bg-zeviqo-500/20 text-zeviqo-400 font-semibold py-2 rounded-xl text-sm hover:bg-zeviqo-500/30 transition-colors">View Details</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Screen>
  );
}
