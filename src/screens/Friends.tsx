import { useStore } from '../store';
import { useAuth } from '../lib/auth';
import { Header } from '../components/Header';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { UserPlus, Search } from 'lucide-react';
import { useState } from 'react';

export default function Friends() {
  const goBack = useStore((s) => s.goBack);
  const { isGuest } = useAuth();
  const navigateToAuth = useStore((s) => s.navigateToAuth);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [added, setAdded] = useState<string[]>([]);

  function search() {
    if (!query.trim()) return;
    setResults([`${query} (demo)`, `${query}_fan`, `${query}_walker`]);
  }
  function add(name: string) { setAdded((a) => [...a, name]); }

  return (
    <div>
      <Header title="Friends" onBack={goBack} subtitle="Find walking buddies" />
      <div className="px-4 py-4 space-y-4">
        {isGuest && (<Card className="bg-warning-50 border-warning-100"><p className="text-sm text-warning-800">Sign in to add and sync friends.</p><Button size="sm" className="mt-2" onClick={() => navigateToAuth('friends')}>Sign In</Button></Card>)}
        <Card><div className="flex gap-2"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by username" className="flex-1 px-3 py-2 rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500" /><Button onClick={search}><Search size={18} /></Button></div></Card>
        {results.length > 0 && (<div className="space-y-2">{results.map((name) => (<Card key={name} className="flex items-center justify-between"><span className="font-medium">{name}</span>{added.includes(name) ? <span className="text-success-600 text-sm font-medium">Added</span> : <Button size="sm" onClick={() => add(name)}><UserPlus size={16} className="inline mr-1" />Add</Button>}</Card>))}</div>)}
        {added.length > 0 && (<div><h3 className="font-semibold mb-2">Your Friends ({added.length})</h3><div className="space-y-2">{added.map((name) => (<Card key={name} className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">{name[0]?.toUpperCase()}</div><span className="flex-1 font-medium">{name}</span></Card>))}</div></div>)}
      </div>
    </div>
  );
}
