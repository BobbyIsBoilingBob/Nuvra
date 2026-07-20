/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f6f7f9', 100: '#eceef2', 200: '#d5d9e2', 300: '#b0b8c8',
          400: '#8492a8', 500: '#65748b', 600: '#4e5b70', 700: '#3f4a5c',
          800: '#2a3340', 900: '#1a2028', 950: '#0f1419',
        },
        brand: {
          50: '#eefcf5', 100: '#d6f7e8', 200: '#b0edd5', 300: '#7adebc',
          400: '#3fc59b', 500: '#1ba87d', 600: '#0f8a64', 700: '#0c6e52',
          800: '#0a5742', 900: '#084736',
        },
        accent: {
          50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
          400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
        },
        success: { 400: '#4ade80', 500: '#22c55e', 600: '#16a34a' },
        warning: { 400: '#facc15', 500: '#eab308', 600: '#ca8a04' },
        error: { 400: '#f87171', 500: '#ef4444', 600: '#dc2626' },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(12px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        pulseRing: { '0%': { transform: 'scale(0.8)', opacity: '0.8' }, '100%': { transform: 'scale(2)', opacity: '0' } },
      },
    },
  },
  plugins: [],
}
