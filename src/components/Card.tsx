import { type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  padded?: boolean;
}

export function Card({ children, onClick, className = '', padded = true }: Props) {
  const Tag = onClick ? 'button' : 'div' as any;
  return (
    <Tag
      onClick={onClick}
      className={`bg-white rounded-2xl shadow-sm border border-ink-100 text-left w-full ${padded ? 'p-4' : ''} ${onClick ? 'hover:shadow-md transition-shadow active:scale-[0.99] cursor-pointer' : ''} ${className}`}
    >
      {children}
    </Tag>
  );
}
