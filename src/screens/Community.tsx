import { useStore } from '../store';
import { useCommunity } from '../hooks/useCommunity';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { Heart, MessageCircle, Share2, Users } from 'lucide-react';

export default function Community() {
  const goBack = useStore((s) => s.goBack);
  const navigate = useStore((s) => s.navigate);
  const setActiveAdventure = useStore((s) => s.setActiveAdventure);
  const { posts, loading, error, like, refresh } = useCommunity();
  if (loading) return (<div><Header title="Community" onBack={goBack} /><div className="flex justify-center py-12"><Spinner /></div></div>);
  return (
    <div>
      <Header title="Community" onBack={goBack} subtitle="Shared adventures" />
      <div className="px-4 py-4 space-y-4">
        {error && <p className="text-sm text-error-600">{error}<button onClick={refresh} className="block mx-auto mt-2 underline">Retry</button></p>}
        {posts.length === 0 && !loading ? (
          <div className="text-center py-12 text-ink-400"><Users className="mx-auto mb-2" /><p>No community posts yet. Share your first adventure!</p></div>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <Card key={p.id}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white" style={{ background: p.avatarColor ?? '#1c7af5' }}>{p.username[0]?.toUpperCase()}</div>
                  <div><h3 className="font-semibold text-sm">{p.username}</h3><p className="text-xs text-ink-400">{new Date(p.createdAt).toLocaleDateString()}</p></div>
                </div>
                {p.adventure && (<button onClick={() => { setActiveAdventure(p.adventure!.id); navigate('adventureDetail'); }} className="block w-full text-left mb-3"><div className="rounded-xl overflow-hidden bg-ink-50 aspect-video mb-2 flex items-center justify-center text-4xl">🗺️</div><h4 className="font-semibold">{p.adventure!.title}</h4><p className="text-sm text-ink-500">{p.adventure!.distanceKm} km · {p.adventure!.difficulty}</p></button>)}
                {p.caption && <p className="text-sm mb-3">{p.caption}</p>}
                <div className="flex items-center gap-4 text-sm text-ink-500">
                  <button onClick={() => like(p.id)} className="flex items-center gap-1 hover:text-error-500"><Heart size={16} className={p.liked ? 'fill-error-500 text-error-500' : ''} />{p.likes}</button>
                  <button className="flex items-center gap-1 hover:text-brand-500"><MessageCircle size={16} />{p.comments}</button>
                  <button className="flex items-center gap-1 hover:text-brand-500"><Share2 size={16} /></button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
