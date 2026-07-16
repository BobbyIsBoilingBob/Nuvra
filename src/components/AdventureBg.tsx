import React from 'react';

interface AdventureBgProps {
  accent?: string;
  variant?: 'default' | 'forest' | 'space' | 'ocean' | 'mountain' | 'cyber' | 'volcano' | 'temple' | 'winter';
  children?: React.ReactNode;
}

const VARIANTS: Record<string, string> = {
  default: 'from-ink-950 via-ink-900 to-ink-950',
  forest: 'from-green-950 via-green-900 to-ink-950',
  space: 'from-ink-950 via-plasma-950 to-ink-950',
  ocean: 'from-cyan-950 via-cyan-900 to-ink-950',
  mountain: 'from-slate-800 via-ink-800 to-ink-950',
  cyber: 'from-plasma-950 via-ink-900 to-ink-950',
  volcano: 'from-ember-950 via-ember-900 to-ink-950',
  temple: 'from-gold-950 via-ink-800 to-ink-950',
  winter: 'from-cyan-800 via-blue-900 to-ink-950',
};

export function AdventureBg({ accent = '#40f5cb', variant = 'default', children }: AdventureBgProps) {
  return (
    <div className={`fixed inset-0 bg-gradient-to-b ${VARIANTS[variant]} -z-10`}>
      <div className="absolute inset-0 bg-grid opacity-30" />
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${accent}15, transparent 60%)` }}
      />
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/20 animate-float-slow"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: `${4 + (i % 3)}s`,
            }}
          />
        ))}
      </div>
      {children}
    </div>
  );
}
