/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 950: '#0a0e1a', 900: '#0f1525', 800: '#161d33', 700: '#1e2640', 600: '#2a3354', 500: '#3d4666', 400: '#64748b', 300: '#94a3b8', 200: '#cbd5e1' },
        zeviqo: { 50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309' },
      },
      fontFamily: { display: ['"Space Grotesk"', 'system-ui', 'sans-serif'], sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
