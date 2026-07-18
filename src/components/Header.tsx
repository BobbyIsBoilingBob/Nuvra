import { type ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useStore } from '../store';

interface HeaderProps {
  title: string;
  back?: boolean;
  right?: ReactNode;
}

export default function Header({ title, back = true, right }: HeaderProps) {
  const setScreen = useStore((s) => s.setScreen);
  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-ink-900/80 backdrop-blur-md border-b border-ink-800">
      {back && (
        <button onClick={() => setScreen('home')} className="text-ink-300 hover:text-white transition-colors">
          <ChevronLeft size={24} />
        </button>
      )}
      <h1 className="font-display text-lg font-bold text-white flex-1 truncate">{title}</h1>
      {right}
    </header>
  );
}
