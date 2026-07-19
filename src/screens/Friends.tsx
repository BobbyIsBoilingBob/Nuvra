import { useState } from 'react';
import { useStore } from '../store';
import { useFriends } from '../hooks/useFriends';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Spinner } from '../components/Spinner';
import { Search, UserPlus, Check, X } from 'lucide-react';

export default function Friends() {
  const goBack = useStore((s) => s.goBack);
  const { friends, requests, loading, search, sendRequest, accept, decline } = useFriends();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  async function doSearch() {
    if (!query.trim()) { setResults([]); return; }
    setSearching(true);
    try { setResults(await search(query)); } catch { /* ignore */ }
    setSearching(false);
  }

  return (
    <div>
      <Header title="Friends" onBack={goBack} />
      <div className="px-4 py-4 space-y-4">
        <div className="flex gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doSearch()}
            placeholder="Search by username" className="flex-1 px-3 py-2 rounded-lg border border-ink-200" />
          <Button onClick={doSearch} disabled={searching}><Search size={18} /></Button>
        </div>

        {searching && <div className="flex justify-center"><Spinner /></div>}
        {results.length > 0 && (
          <div>
            <h2 className="font-semibold mb-2">Search Results</h2>
            <div className="space-y-2">
              {results.map((r) => (
                <Card key={r.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: r.avatar_color }}>{r.avatar_emoji}</div>
                  <span className="flex-1 font-medium">{r.username}</span>
                  <Button size="sm" onClick={() => sendRequest(r.id)}><UserPlus size={16} /></Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {requests.length > 0 && (
          <div>
            <h2 className="font-semibold mb-2">Pending Requests ({requests.length})</h2>
            <div className="space-y-2">
              {requests.map((r) => (
                <Card key={r.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: r.avatar_color }}>{r.avatar_emoji}</div>
                  <span className="flex-1 font-medium">{r.username}</span>
                  <Button size="sm" variant="success" onClick={() => accept(r.id, r.sender_id)}><Check size={16} /></Button>
                  <Button size="sm" variant="danger" onClick={() => decline(r.id)}><X size={16} /></Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="font-semibold mb-2">Your Friends ({friends.length})</h2>
          {loading ? <div className="flex justify-center"><Spinner /></div> : friends.length === 0 ? (
            <p className="text-sm text-ink-500 text-center py-4">No friends yet. Search above to add some!</p>
          ) : (
            <div className="space-y-2">
              {friends.map((f) => (
                <Card key={f.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: f.avatar_color }}>{f.avatar_emoji}</div>
                  <span className="flex-1 font-medium">{f.username}</span>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
