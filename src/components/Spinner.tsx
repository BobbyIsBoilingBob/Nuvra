import { type ReactNode } from 'react';

export default function Spinner({ label }: { label?: string }): ReactNode {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div className="h-8 w-8 rounded-full border-2 border-ink-600 border-t-brand-400 animate-spin" />
      {label && <p className="text-ink-400 text-sm">{label}</p>}
    </div>
  );
}
