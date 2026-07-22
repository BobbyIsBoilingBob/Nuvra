/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: {
          50: '#f0f4ff', 100: '#e0e9ff', 200: '#c7d6fe', 300: '#a4b8fc',
          400: '#8094f8', 500: '#6568f0', 600: '#5250e0', 700: '#4340c7',
          800: '#3836a1', 900: '#312f81', 950: '#1e1c4d',
        },
        brand: {
          50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
          400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
          800: '#065f46', 900: '#064e3b',
        },
        accent: {
          50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
          400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
          800: '#92400e', 900: '#78350f',
        },
        surface: {
          0: '#f8fafc', 50: '#f1f5f9', 100: '#ffffff', 200: '#f1f5f9',
          300: '#e2e8f0', 400: '#cbd5e1', 500: '#94a3b8',
        },
        success: {
          50: '#f0fdf4', 100: '#dcfce7', 400: '#4ade80', 500: '#22c55e',
          600: '#16a34a', 700: '#15803d',
        },
        warning: {
          50: '#fff7ed', 100: '#ffedd5', 400: '#fb923c', 500: '#f97316',
          600: '#ea580c', 700: '#c2410c',
        },
        error: {
          50: '#fef2f2', 100: '#fee2e2', 400: '#f87171', 500: '#ef4444',
          600: '#dc2626', 700: '#b91c1c',
        },
      },
      boxShadow: {
        'glow-brand': '0 0 20px rgba(16,185,129,0.35)',
        'glow-accent': '0 0 20px rgba(245,158,11,0.35)',
        'card': '0 2px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.10)',
      },
      keyframes: {
        'slide-up': { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        'slide-in-right': { '0%': { opacity: '0', transform: 'translateX(20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        'fade-in': { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        'pop': { '0%': { transform: 'scale(0.9)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        'shimmer': { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'scale-in': { '0%': { transform: 'scale(0.95)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        'bounce-in': { '0%': { transform: 'scale(0.3)', opacity: '0' }, '50%': { transform: 'scale(1.05)' }, '70%': { transform: 'scale(0.95)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        'glow': { '0%,100%': { boxShadow: '0 0 12px rgba(245,158,11,0.3)' }, '50%': { boxShadow: '0 0 24px rgba(245,158,11,0.6)' } },
        'float': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
        'celebrate': { '0%': { transform: 'scale(0) rotate(-180deg)', opacity: '0' }, '50%': { transform: 'scale(1.2) rotate(0deg)', opacity: '1' }, '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' } },
        'ripple': { '0%': { transform: 'scale(1)', opacity: '0.5' }, '100%': { transform: 'scale(2.5)', opacity: '0' } },
        'spin-slow': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
        'progress': { '0%': { width: '0%' }, '100%': { width: '100%' } },
      },
      animation: {
        'slide-up': 'slide-up 0.4s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'pop': 'pop 0.3s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'scale-in': 'scale-in 0.2s ease-out',
        'bounce-in': 'bounce-in 0.6s ease-out',
        'glow': 'glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'celebrate': 'celebrate 0.6s ease-out',
        'ripple': 'ripple 1.5s ease-out infinite',
        'spin-slow': 'spin-slow 3s linear infinite',
      },
    },
  },
  plugins: [],
}
