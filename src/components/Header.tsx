import { type ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

interface Props {
  title: string; onBack?: () => void; right?: ReactNode; subtitle?: string;
}

export function Header({ title, onBack, right, subtitle }: Props) {
  return (
    <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-ink-100 sticky top-0 z-10">
      {onBack && (
        <button onClick={onBack} aria-label="Back" className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-700">
          <ArrowLeft size={20} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold text-ink-900 truncate">{title}</h1>
        {subtitle && <p className="text-xs text-ink-500 truncate">{subtitle}</p>}
      </div>
      {right}
    </header>
  );
}
