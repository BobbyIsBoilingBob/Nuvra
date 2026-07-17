import { useMemo } from 'react';

interface AdventureBgProps {
  variant?: 'default' | 'cyber' | 'forest' | 'ocean' | 'mountain';
  accent?: string;
}

export function AdventureBg({ variant = 'default', accent = '#33ffd6' }: AdventureBgProps): React.ReactElement {
  const blobs = useMemo(() => {
    const seed = variant;
    const arr: Array<{ x: number; y: number; size: number; delay: number }> = [];
    for (let i = 0; i < 5; i++) {
      const hash = (seed.charCodeAt(i % seed.length) || 65) * (i + 1);
      arr.push({
        x: (hash * 37) % 100,
        y: (hash * 53) % 100,
        size: 200 + (hash % 300),
        delay: (hash % 10) * 0.5,
      });
    }
    return arr;
  }, [variant]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-ink-950" />
      {blobs.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-[0.07] blur-3xl animate-pulse"
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            background: accent,
            animationDelay: `${b.delay}s`,
            animationDuration: '4s',
          }}
        />
      ))}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${accent}15 0%, transparent 50%)`,
        }}
      />
    </div>
  );
}
