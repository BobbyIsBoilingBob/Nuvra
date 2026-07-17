import { useMemo, useState, useEffect } from 'react';
import { Icon } from './ui';
import type { RoutePoint } from '../data';

interface RoutePreviewProps {
  route: RoutePoint[];
  accent: string;
  height?: number;
}

export function RoutePreview({ route, accent, height = 200 }: RoutePreviewProps): React.ReactElement {
  const [drawProgress, setDrawProgress] = useState(0);

  useEffect(() => {
    setDrawProgress(0);
    const start = Date.now();
    const duration = 1500;
    const id = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.min(1, elapsed / duration);
      setDrawProgress(pct);
      if (pct >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [route]);

  const { pathD, viewBox, totalLength, startPt, endPt } = useMemo(() => {
    if (route.length === 0) return { pathD: '', viewBox: '0 0 100 100', totalLength: 0, startPt: { x: 50, y: 50 }, endPt: { x: 50, y: 50 } };
    const lats = route.map(p => p.lat);
    const lngs = route.map(p => p.lng);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const pad = 0.0001;
    const w = (maxLng - minLng) + pad * 2 || 1;
    const h = (maxLat - minLat) + pad * 2 || 1;
    const scale = 100 / Math.max(w, h);
    const offsetX = (100 - w * scale) / 2;
    const offsetY = (100 - h * scale) / 2;

    const points = route.map(p => ({
      x: offsetX + (p.lng - minLng + pad) * scale,
      y: 100 - (offsetY + (p.lat - minLat + pad) * scale),
    }));

    const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' ');
    return { pathD: d, viewBox: '0 0 100 100', totalLength: 1000, startPt: points[0], endPt: points[points.length - 1] };
  }, [route]);

  const visibleLength = totalLength * drawProgress;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden glass" style={{ height }}>
      <svg viewBox={viewBox} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <path d={pathD} fill="none" stroke={accent} strokeOpacity="0.15" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d={pathD} fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={totalLength} strokeDashoffset={totalLength - visibleLength}
          style={{ filter: `drop-shadow(0 0 4px ${accent}80)` }}
        />
        <circle cx={startPt.x} cy={startPt.y} r="2.5" fill={accent} />
        {drawProgress >= 1 && <circle cx={endPt.x} cy={endPt.y} r="2.5" fill="#ff6b00" />}
      </svg>
      <div className="absolute top-2 right-2 glass px-2 py-1 rounded-lg flex items-center gap-1">
        <Icon name="Route" size={12} className="text-white/60" />
        <span className="text-[10px] font-bold text-white/60">{route.length} pts</span>
      </div>
    </div>
  );
}
