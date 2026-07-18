/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
          800: '#1e293b', 900: '#0f172a', 950: '#020617',
        },
        brand: {
          50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9',
          400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490',
          800: '#155e75', 900: '#164e63',
        },
        accent: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706' },
        success: { 400: '#4ade80', 500: '#22c55e', 600: '#16a34a' },
        warning: { 400: '#facc15', 500: '#eab308' },
        error: { 400: '#f87171', 500: '#ef4444', 600: '#dc2626' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl: '0.875rem', '2xl': '1.25rem' },
    },
  },
  plugins: [],
};
