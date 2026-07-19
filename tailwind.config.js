/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { 50: '#f7f8fa', 100: '#eef0f4', 200: '#dde1e8', 400: '#9aa3b2', 500: '#6b7484', 700: '#3d4452', 900: '#1a1d24' },
        brand: { 50: '#eef5ff', 100: '#d9e8ff', 500: '#1c7af5', 600: '#1567d6', 700: '#0f54b8' },
        accent: { 50: '#fff7e6', 100: '#ffe8b3', 500: '#f59e0b', 600: '#d97c06', 700: '#b56304' },
        success: { 50: '#ecfdf5', 100: '#d1fae5', 500: '#22c55e', 600: '#16a34a', 700: '#15803d' },
        warning: { 50: '#fffbeb', 100: '#fef3c7', 500: '#f59e0b', 600: '#d97706', 700: '#b45309' },
        error: { 50: '#fef2f2', 100: '#fee2e2', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
