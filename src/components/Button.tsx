import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant; size?: Size; children: ReactNode; fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm',
  secondary: 'bg-ink-100 hover:bg-ink-200 text-ink-900 border border-ink-200',
  ghost: 'bg-transparent hover:bg-ink-100 text-ink-700',
  danger: 'bg-error-500 hover:bg-error-600 text-white',
  success: 'bg-success-500 hover:bg-success-600 text-white',
};
const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-base rounded-xl',
  lg: 'px-6 py-3.5 text-lg rounded-xl',
};

export function Button({ variant = 'primary', size = 'md', fullWidth, className = '', children, ...rest }: Props) {
  return (
    <button
      className={`font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
