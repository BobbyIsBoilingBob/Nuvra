/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f5f7fa', 100: '#e7ecf3', 200: '#cfd8e3', 300: '#a8b6c8',
          400: '#7a8aa3', 500: '#5a6b85', 600: '#43526a', 700: '#333f54',
          800: '#222b3c', 900: '#161c28', 950: '#0c1018',
        },
        brand: {
          50: '#eefcf6', 100: '#d6f7e9', 200: '#aeedd4', 300: '#79ddb8',
          400: '#43c79b', 500: '#1eab83', 600: '#108a6c', 700: '#0c6e58',
          800: '#0c5747', 900: '#0a473b', 950: '#042821',
        },
        accent: {
          50: '#fff5ed', 100: '#ffe8d4', 200: '#ffcda8', 300: '#ffaa70',
          400: '#ff7e3a', 500: '#fb5a13', 600: '#ec4208', 700: '#c4310a',
          800: '#9c2810', 900: '#7e2412', 950: '#430f05',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-ring': 'pulseRing 1.8s ease-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
