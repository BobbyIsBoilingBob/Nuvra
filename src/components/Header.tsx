import { type ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useStore } from '../store';

interface HeaderProps {
  title: string;
  /** Show the back button. Defaults to true. Set false only for top-level nav screens. */
  back?: boolean;
  right?: ReactNode;
}

export default function Header({ title, back = true, right }: HeaderProps) {
  const goBack = useStore((s) => s.goBack);
  const stack = useStore((s) => s.stack);
  const navigate = useStore((s) => s.navigate);

  const handleBack = () => {
    // If there's history in the stack, pop to the previous screen.
    if (stack.length > 1) {
      goBack();
    } else {
      // No history — go home as a safe fallback.
      navigate('home');
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-ink-900/80 backdrop-blur-md border-b border-ink-800">
      {back && (
        <button
          onClick={handleBack}
          aria-label="Go back"
          className="text-ink-300 hover:text-white transition-colors -ml-1 p-1 rounded-lg"
        >
          <ChevronLeft size={24} />
        </button>
      )}
      <h1 className="font-display text-lg font-bold text-white flex-1 truncate">{title}</h1>
      {right}
    </header>
  );
}
