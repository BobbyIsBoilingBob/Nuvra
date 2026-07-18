import { type ReactNode } from 'react';

export default function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl bg-ink-800/60 border border-ink-700/50 backdrop-blur-sm ${onClick ? 'cursor-pointer hover:border-ink-600 transition-colors' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
