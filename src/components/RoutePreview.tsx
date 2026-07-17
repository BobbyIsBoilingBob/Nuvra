import { useEffect, useState } from 'react';

export function RoutePreview({ route, color = '#00c4ff', animated = true }: { route: { x: number; y: number }[]; color?: string; animated?: boolean }) {
  const [drawProgress, setDrawProgress] = useState(animated ? 0 : 1);

  useEffect(() => {
    if (!animated) { setDrawProgress(1); return; }
    setDrawProgress(0);
    const timer = setTimeout(() => setDrawProgress(1), 50);
    return () => clearTimeout(timer);
  }, [animated, route]);

  if (route.length < 2) return null;
  const pathD = route.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const totalLen = 1000;
  const start = route[0];
  const end = route[route.length - 1];

  return (
    <div className="relative w-full aspect-square rounded-2xl overflow-hidden glass">
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="route-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="route-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="50%" stopColor="#33cfff" />
            <stop offset="100%" stopColor="#7a45ff" />
          </linearGradient>
        </defs>
        <path
          d={pathD}
          fill="none"
          stroke="url(#route-gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#route-glow)"
          style={{
            strokeDasharray: totalLen,
            strokeDashoffset: totalLen * (1 - drawProgress),
            transition: 'stroke-dashoffset 2s ease-out'
          }}
        />
        <circle cx={start.x} cy={start.y} r="3" fill="#22c55e" className="animate-pulse-glow" />
        <circle cx={start.x} cy={start.y} r="1.5" fill="#fff" />
        <circle cx={end.x} cy={end.y} r="3" fill="#ff6b00" className="animate-pulse-glow" />
        <circle cx={end.x} cy={end.y} r="1.5" fill="#fff" />
        {route.map((p, i) => i > 0 && i < route.length - 1 ? (
          <circle key={i} cx={p.x} cy={p.y} r="0.8" fill={color} opacity="0.4" />
        ) : null)}
      </svg>
      <div className="absolute top-2 left-2 flex items-center gap-1 glass rounded-full px-2 py-0.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-[9px] font-bold text-white/70">Start</span>
      </div>
      <div className="absolute bottom-2 right-2 flex items-center gap-1 glass rounded-full px-2 py-0.5">
        <span className="w-2 h-2 rounded-full bg-ember-500" />
        <span className="text-[9px] font-bold text-white/70">Finish</span>
      </div>
    </div>
  );
}
