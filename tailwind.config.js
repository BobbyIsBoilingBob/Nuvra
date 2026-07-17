/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070713',
          900: '#0a0a1a',
          800: '#0f0f23',
          700: '#161630',
          600: '#1e1e3f',
        },
        nova: {
          50: '#e6fffa',
          100: '#ccfff5',
          200: '#99ffeb',
          300: '#66ffe0',
          400: '#33ffd6',
          500: '#00ffcc',
          600: '#00cca3',
          700: '#00997a',
          800: '#006652',
          900: '#003329',
        },
        plasma: {
          50: '#f0e6ff',
          100: '#e0ccff',
          200: '#c199ff',
          300: '#a166ff',
          400: '#7a33ff',
          500: '#5c00e6',
          600: '#4500b3',
          700: '#2e0080',
          800: '#17004d',
          900: '#09001a',
        },
        gold: {
          50: '#fff9e6',
          100: '#fff3cc',
          200: '#ffe699',
          300: '#ffd966',
          400: '#ffcc33',
          500: '#ffbf00',
          600: '#cc9900',
          700: '#997300',
          800: '#664d00',
          900: '#332600',
        },
        ember: {
          50: '#fff0e6',
          100: '#ffe0cc',
          200: '#ffc299',
          300: '#ffa366',
          400: '#ff8433',
          500: '#ff6600',
          600: '#cc5200',
          700: '#993d00',
          800: '#662900',
          900: '#331400',
        },
        cyan: {
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(0, 255, 204, 0.15)',
        'glow-lg': '0 0 40px rgba(0, 255, 204, 0.25)',
      },
      animation: {
        'progress-shimmer': 'progress-shimmer 2s linear infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.25s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'bounce-in': 'bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        'progress-shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
