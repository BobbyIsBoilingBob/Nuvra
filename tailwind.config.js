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
          50: '#e2e8f0', 100: '#cbd5e1', 200: '#94a3b8', 300: '#64748b',
          400: '#475569', 500: '#334155', 600: '#1e293b', 700: '#0f172a',
          800: '#0a0e1a', 900: '#060a14', 950: '#03060d',
        },
        brand: {
          50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
          400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
          800: '#065f46', 900: '#064e3b',
        },
        accent: {
          50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
          400: '#f59e0b', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
          800: '#92400e', 900: '#78350f',
        },
        surface: {
          0: '#0a0e1a', 50: '#0f1626', 100: '#141d30', 200: '#1a2540',
          300: '#222e48', 400: '#2a3856', 500: '#334466',
        },
        success: { 400: '#22c55e', 500: '#16a34a', 600: '#15803d' },
        warning: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
        error: { 400: '#f87171', 500: '#ef4444', 600: '#dc2626' },
      },
      animation: {
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'slide-in-right': 'slideInRight 0.35s cubic-bezier(0.16,1,0.3,1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pop': 'pop 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        'shimmer': 'shimmer 2s linear infinite',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 2s linear infinite',
        'celebrate': 'celebrate 0.8s cubic-bezier(0.34,1.56,0.64,1)',
        'ripple': 'ripple 0.6s ease-out',
      },
      keyframes: {
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideInRight: { '0%': { opacity: '0', transform: 'translateX(24px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        pop: { '0%': { opacity: '0', transform: 'scale(0.8)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        scaleIn: { '0%': { opacity: '0', transform: 'scale(0.9)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)' },
        },
        glow: { '0%': { boxShadow: '0 0 20px rgba(16,185,129,0.3)' }, '100%': { boxShadow: '0 0 40px rgba(16,185,129,0.6)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        celebrate: {
          '0%': { opacity: '0', transform: 'scale(0.5) rotate(-10deg)' },
          '50%': { transform: 'scale(1.15) rotate(5deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0)' },
        },
        ripple: { '0%': { transform: 'scale(0)', opacity: '1' }, '100%': { transform: 'scale(4)', opacity: '0' } },
      },
      boxShadow: {
        'glow-brand': '0 0 24px rgba(16,185,129,0.35)',
        'glow-accent': '0 0 24px rgba(245,158,11,0.35)',
        'card': '0 4px 24px rgba(0,0,0,0.25)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
}
