/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0e1a', 900: '#0f1525', 800: '#161d33', 700: '#1e2742',
          600: '#2a3556', 500: '#3b4870', 400: '#5a6a9a',
        },
        zeviqo: {
          50: '#e6fcff', 100: '#b3f5ff', 200: '#80efff', 300: '#4de8ff',
          400: '#1ae1ff', 500: '#00c4ff', 600: '#0099cc', 700: '#007399', 800: '#004d66',
        },
        nova: {
          300: '#a78bfa', 400: '#8b5cf6', 500: '#7c3aed', 600: '#6d28d9',
        },
        plasma: {
          300: '#f0abfc', 400: '#e879f9', 500: '#d946ef',
        },
        gold: {
          300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706',
        },
        ember: {
          400: '#fb923c', 500: '#f97316', 600: '#ea580c',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-ring': 'pulseRing 2s ease-out infinite',
      },
      keyframes: {
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-20px)' } },
        shimmer: { '0%': { transform: 'translateX(-100%)' }, '100%': { transform: 'translateX(100%)' } },
        pulseRing: { '0%': { transform: 'scale(0.8)', opacity: '1' }, '100%': { transform: 'scale(2)', opacity: '0' } },
      },
    },
  },
  plugins: [],
};
