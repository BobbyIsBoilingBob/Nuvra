import { useState, useCallback, useRef } from 'react';
import { Icon } from './ui';
import type { LatLng } from '../lib/map-utils';

// ============================================================
// MapSearch — search using Nominatim (free OSM geocoding)
// No API key required. Respects usage policy with debounce.
// ============================================================

interface SearchResult {
  id: string;
  label: string;
  type: string;
  lat: number;
  lng: number;
}

interface MapSearchProps {
  onSelect: (pos: LatLng, label: string) => void;
}

export function MapSearch({ onSelect }: MapSearchProps): React.ReactElement {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 3) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } },
        );
        const data = await res.json() as Array<{
          place_id: number;
          display_name: string;
          lat: string;
          lon: string;
          type: string;
        }>;
        setResults(
          data.map((d) => ({
            id: String(d.place_id),
            label: d.display_name,
            type: d.type,
            lat: parseFloat(d.lat),
            lng: parseFloat(d.lon),
          })),
        );
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);
  }, []);

  function handleSelect(r: SearchResult): void {
    onSelect({ lat: r.lat, lng: r.lng }, r.label.split(',')[0]);
    setQuery(r.label.split(',')[0]);
    setOpen(false);
    setResults([]);
  }

  return (
    <div className="absolute top-3 right-3 z-[1000] w-64 max-w-[calc(100vw-1.5rem)]">
      <div className="glass-strong rounded-xl flex items-center gap-2 px-3 py-2.5">
        <Icon name="Search" size={16} className="text-white/50 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); search(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search places, parks, landmarks..."
          className="flex-1 bg-transparent text-white text-sm font-medium placeholder:text-white/30 outline-none min-w-0"
          aria-label="Search for places on the map"
        />
        {searching && <div className="w-4 h-4 border-2 border-nova-400/30 border-t-nova-400 rounded-full animate-spin flex-shrink-0" />}
        {query && !searching && (
          <button onClick={() => { setQuery(''); setResults([]); }} aria-label="Clear search" className="flex-shrink-0">
            <Icon name="X" size={14} className="text-white/40 hover:text-white" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="mt-1 glass-strong rounded-xl overflow-hidden max-h-64 overflow-y-auto">
          {results.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r)}
              className="w-full px-3 py-2.5 flex items-center gap-2.5 text-left hover:bg-white/[0.08] transition-colors border-b border-white/5 last:border-0"
            >
              <Icon name="MapPin" size={14} className="text-nova-300 flex-shrink-0" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{r.label.split(',')[0]}</div>
                <div className="text-[10px] text-white/40 truncate">{r.label.split(',').slice(1).join(',').trim()}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
